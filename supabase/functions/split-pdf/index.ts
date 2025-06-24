
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
        JSON.stringify({ error: 'PDF file and template_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing PDF for template ${templateId}`)

    // Step 1: Store original PDF in storage
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
        JSON.stringify({ error: 'Failed to upload PDF' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 2: Extract PDF metadata using PDF-lib
    const { PDFDocument } = await import('https://esm.sh/pdf-lib@1.17.1')
    
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const pageCount = pdfDoc.getPageCount()
    
    console.log(`PDF has ${pageCount} pages`)

    // Step 3: Extract each page as preview image using pdf2pic or similar
    // For now, we'll create placeholder preview images and store page metadata
    const pages = []
    
    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i)
      const { width, height } = page.getSize()
      
      // Generate a simple preview image (placeholder for now)
      // In production, you'd use a proper PDF-to-image conversion
      const previewImageUrl = `https://placehold.co/${Math.round(width)}x${Math.round(height)}/e5e7eb/6b7280?text=Page+${i + 1}`
      
      // Create template page record
      const { data: pageData, error: pageError } = await supabaseClient
        .from('template_pages')
        .insert({
          template_id: templateId,
          page_number: i + 1,
          preview_image_url: previewImageUrl,
          pdf_page_width: width,
          pdf_page_height: height,
          pdf_units: 'pt'
        })
        .select()
        .single()

      if (pageError) {
        console.error(`Error creating page ${i + 1}:`, pageError)
        continue
      }

      pages.push(pageData)
      console.log(`Created page ${i + 1} with dimensions ${width}x${height}pt`)
    }

    // Step 4: Update template with PDF metadata
    const { data: pdfUrlData } = supabaseClient.storage
      .from('template-files')
      .getPublicUrl(pdfFileName)

    const pdfMetadata = {
      pageCount,
      originalFileName: pdfFile.name,
      fileSize: pdfBuffer.byteLength,
      units: 'pt',
      processingDate: new Date().toISOString()
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
      return new Response(
        JSON.stringify({ error: 'Failed to update template metadata' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed PDF with ${pageCount} pages`,
        pagesCreated: pages.length,
        pdfUrl: pdfUrlData.publicUrl,
        metadata: pdfMetadata
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing PDF:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error processing PDF' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
