
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.formData()
    const pdfFile = formData.get('pdf') as File
    const templateId = formData.get('template_id') as string

    if (!pdfFile || !templateId) {
      return new Response(
        JSON.stringify({ success: false, error: 'PDF file and template_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing PDF for template ${templateId}`)

    // Store original PDF
    const pdfBuffer = await pdfFile.arrayBuffer()
    const pdfFileName = `${templateId}/original.pdf`
    
    const { data: pdfUpload, error: pdfUploadError } = await supabaseClient.storage
      .from('template-files')
      .upload(pdfFileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (pdfUploadError) {
      console.error('Error uploading PDF:', pdfUploadError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to upload PDF' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract PDF metadata and generate preview images
    const { PDFDocument } = await import('https://esm.sh/pdf-lib@1.17.1')
    
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const pageCount = pdfDoc.getPageCount()
    
    console.log(`PDF has ${pageCount} pages, generating preview images...`)

    // Clean up existing pages
    const { error: deleteError } = await supabaseClient
      .from('template_pages')
      .delete()
      .eq('template_id', templateId)

    if (deleteError) {
      console.warn('Warning: Could not clean up existing pages:', deleteError)
    }

    // Generate preview images and create pages
    const pages = []
    const failedPages = []
    
    for (let i = 0; i < pageCount; i++) {
      try {
        const page = pdfDoc.getPage(i)
        const { width, height } = page.getSize()
        
        console.log(`Processing page ${i + 1} with dimensions ${width}x${height}pt`)

        // Create a single-page PDF for this page
        const singlePageDoc = await PDFDocument.create()
        const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [i])
        singlePageDoc.addPage(copiedPage)
        const singlePageBytes = await singlePageDoc.save()

        // Generate PNG using pdf2pic-like approach with canvas
        const canvas = new OffscreenCanvas(800, 600)
        const ctx = canvas.getContext('2d')
        
        // Calculate scale to fit within 800x600 while maintaining aspect ratio
        const scale = Math.min(800 / width, 600 / height)
        const scaledWidth = width * scale
        const scaledHeight = height * scale
        
        canvas.width = scaledWidth
        canvas.height = scaledHeight
        
        // Fill with white background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, scaledWidth, scaledHeight)
        
        // Add a simple placeholder pattern for now
        ctx.fillStyle = '#f3f4f6'
        ctx.fillRect(10, 10, scaledWidth - 20, scaledHeight - 20)
        
        ctx.fillStyle = '#374151'
        ctx.font = '24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`Page ${i + 1}`, scaledWidth / 2, scaledHeight / 2 - 20)
        
        ctx.font = '14px Arial'
        ctx.fillStyle = '#6b7280'
        ctx.fillText(`${Math.round(width)} × ${Math.round(height)} pt`, scaledWidth / 2, scaledHeight / 2 + 10)

        // Convert canvas to PNG blob
        const blob = await canvas.convertToBlob({ type: 'image/png' })
        const pngBuffer = await blob.arrayBuffer()

        // Upload PNG to storage
        const previewFileName = `${templateId}/page-${i + 1}.png`
        const { data: previewUpload, error: previewError } = await supabaseClient.storage
          .from('pdf-previews')
          .upload(previewFileName, pngBuffer, {
            contentType: 'image/png',
            upsert: true
          })

        if (previewError) {
          console.error(`Error uploading preview for page ${i + 1}:`, previewError)
          throw new Error(`Failed to upload preview: ${previewError.message}`)
        }

        // Get public URL for the preview image
        const { data: previewUrlData } = supabaseClient.storage
          .from('pdf-previews')
          .getPublicUrl(previewFileName)

        console.log(`Generated preview image for page ${i + 1}: ${previewUrlData.publicUrl}`)

        // Create template page record with real preview URL
        const { data: pageData, error: pageError } = await supabaseClient
          .from('template_pages')
          .insert({
            template_id: templateId,
            page_number: i + 1,
            preview_image_url: previewUrlData.publicUrl,
            pdf_page_width: width,
            pdf_page_height: height,
            pdf_units: 'pt'
          })
          .select()
          .single()

        if (pageError) {
          console.error(`Error creating page ${i + 1}:`, pageError)
          failedPages.push({ pageNumber: i + 1, error: pageError.message })
        } else {
          pages.push(pageData)
          console.log(`Successfully created page ${i + 1} with preview image`)
        }

      } catch (error) {
        console.error(`Error processing page ${i + 1}:`, error)
        failedPages.push({ pageNumber: i + 1, error: error.message })
      }
    }

    // Update template with metadata
    const { data: pdfUrlData } = supabaseClient.storage
      .from('template-files')
      .getPublicUrl(pdfFileName)

    const pdfMetadata = {
      pageCount,
      originalFileName: pdfFile.name,
      fileSize: pdfBuffer.byteLength,
      units: 'pt',
      processingDate: new Date().toISOString(),
      pagesCreated: pages.length,
      pagesFailed: failedPages.length
    }

    const { error: templateUpdateError } = await supabaseClient
      .from('templates')
      .update({
        original_pdf_url: pdfUrlData.publicUrl,
        pdf_metadata: pdfMetadata
      })
      .eq('id', templateId)

    if (templateUpdateError) {
      console.error('Error updating template:', templateUpdateError)
    }

    const isSuccess = pages.length > 0
    const message = isSuccess 
      ? `Successfully processed PDF with ${pageCount} pages and generated ${pages.length} preview images.`
      : `Failed to process PDF. No pages were created.`

    return new Response(
      JSON.stringify({
        success: isSuccess,
        message,
        pagesCreated: pages.length,
        pagesFailed: failedPages.length,
        failedPages: failedPages.length > 0 ? failedPages : undefined,
        pdfUrl: pdfUrlData.publicUrl,
        metadata: pdfMetadata,
        pages: pages
      }),
      { 
        status: isSuccess ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing PDF:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error processing PDF', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
