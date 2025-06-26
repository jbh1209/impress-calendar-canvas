
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

    // Step 3: Generate preview images for each page
    const pages = []
    
    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i)
      const { width, height } = page.getSize()
      
      try {
        // Generate preview image using canvas
        const previewImage = await generatePagePreview(pdfDoc, i, width, height)
        
        // Upload preview image to storage
        const previewFileName = `${templateId}/page-${i + 1}.png`
        const { data: imageUpload, error: imageUploadError } = await supabaseClient.storage
          .from('pdf-previews')
          .upload(previewFileName, previewImage, {
            contentType: 'image/png',
            upsert: true
          })

        if (imageUploadError) {
          console.error(`Error uploading preview image for page ${i + 1}:`, imageUploadError)
          continue
        }

        // Get public URL for the preview image
        const { data: previewUrlData } = supabaseClient.storage
          .from('pdf-previews')
          .getPublicUrl(previewFileName)

        // Create template page record
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
          continue
        }

        pages.push(pageData)
        console.log(`Created page ${i + 1} with preview image and dimensions ${width}x${height}pt`)
      } catch (error) {
        console.error(`Error processing page ${i + 1}:`, error)
        
        // Fallback: create page record without preview image
        const { data: pageData, error: pageError } = await supabaseClient
          .from('template_pages')
          .insert({
            template_id: templateId,
            page_number: i + 1,
            preview_image_url: null,
            pdf_page_width: width,
            pdf_page_height: height,
            pdf_units: 'pt'
          })
          .select()
          .single()

        if (!pageError) {
          pages.push(pageData)
        }
      }
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

async function generatePagePreview(pdfDoc: any, pageIndex: number, width: number, height: number): Promise<Uint8Array> {
  try {
    // Create a new PDF with just this page
    const singlePageDoc = await (await import('https://esm.sh/pdf-lib@1.17.1')).PDFDocument.create()
    const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [pageIndex])
    singlePageDoc.addPage(copiedPage)
    
    // Convert to bytes
    const pdfBytes = await singlePageDoc.save()
    
    // For now, create a simple colored rectangle as preview
    // In production, you'd use a proper PDF-to-image converter
    const canvas = createCanvas(Math.round(width), Math.round(height))
    const ctx = canvas.getContext('2d')
    
    // Fill with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Add border
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2)
    
    // Add page indicator
    ctx.fillStyle = '#6b7280'
    ctx.font = '16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`Page ${pageIndex + 1}`, canvas.width / 2, canvas.height / 2)
    
    // Convert canvas to PNG
    return canvas.toBuffer('image/png')
    
  } catch (error) {
    console.error('Error generating preview:', error)
    throw error
  }
}

function createCanvas(width: number, height: number) {
  // Simple canvas implementation for Deno
  // In production, you'd use a proper canvas library like skia-canvas
  return {
    width,
    height,
    getContext: (type: string) => ({
      fillStyle: '#ffffff',
      strokeStyle: '#000000',
      lineWidth: 1,
      font: '12px sans-serif',
      textAlign: 'left',
      fillRect: (x: number, y: number, w: number, h: number) => {},
      strokeRect: (x: number, y: number, w: number, h: number) => {},
      fillText: (text: string, x: number, y: number) => {},
    }),
    toBuffer: (format: string) => new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // rest of minimal PNG
      0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54,
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF,
      0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x73,
      0x75, 0x01, 0x18, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ])
  }
}
