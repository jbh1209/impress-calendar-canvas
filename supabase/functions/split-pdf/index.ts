
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
    console.log('[PDF-PROCESSOR] Starting PDF processing request')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.formData()
    const pdfFile = formData.get('pdf') as File
    const templateId = formData.get('template_id') as string

    if (!pdfFile || !templateId) {
      console.error('[PDF-PROCESSOR] Missing required parameters')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'PDF file and template_id are required',
          message: 'Missing required parameters'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[PDF-PROCESSOR] Processing PDF for template ${templateId}, file size: ${pdfFile.size} bytes`)

    // Step 1: Store original PDF
    const pdfBuffer = await pdfFile.arrayBuffer()
    const pdfFileName = `${templateId}/original.pdf`
    
    console.log('[PDF-PROCESSOR] Uploading original PDF to storage')
    const { data: pdfUpload, error: pdfUploadError } = await supabaseClient.storage
      .from('template-files')
      .upload(pdfFileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (pdfUploadError) {
      console.error('[PDF-PROCESSOR] Error uploading PDF:', pdfUploadError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to upload PDF to storage',
          message: `Upload failed: ${pdfUploadError.message}`
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 2: Extract PDF metadata using PDF-lib
    console.log('[PDF-PROCESSOR] Loading PDF document')
    const { PDFDocument } = await import('https://esm.sh/pdf-lib@1.17.1')
    
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(pdfBuffer)
    } catch (error) {
      console.error('[PDF-PROCESSOR] Error loading PDF:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid or corrupted PDF file',
          message: `PDF parsing failed: ${error.message}`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const pageCount = pdfDoc.getPageCount()
    console.log(`[PDF-PROCESSOR] PDF has ${pageCount} pages`)

    if (pageCount > 50) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'PDF has too many pages (maximum 50 pages allowed)',
          message: 'PDF too large'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 3: Clean up existing pages
    console.log('[PDF-PROCESSOR] Cleaning up existing template pages')
    const { error: deleteError } = await supabaseClient
      .from('template_pages')
      .delete()
      .eq('template_id', templateId)

    if (deleteError) {
      console.warn('[PDF-PROCESSOR] Warning: Could not clean up existing pages:', deleteError)
    }

    // Step 4: Process each page - Create simple placeholder previews
    const pages = []
    const failedPages = []
    
    for (let i = 0; i < pageCount; i++) {
      try {
        console.log(`[PDF-PROCESSOR] Processing page ${i + 1}/${pageCount}`)
        
        const page = pdfDoc.getPage(i)
        const { width, height } = page.getSize()
        
        // Create a simple SVG placeholder instead of using OffscreenCanvas
        const svgContent = `
          <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
            <text x="400" y="250" text-anchor="middle" font-family="Arial" font-size="32" fill="#374151" font-weight="bold">Page ${i + 1}</text>
            <text x="400" y="300" text-anchor="middle" font-family="Arial" font-size="18" fill="#6b7280">${Math.round(width)} × ${Math.round(height)} pt</text>
            <text x="400" y="330" text-anchor="middle" font-family="Arial" font-size="16" fill="#9ca3af">${(width / 72).toFixed(1)}" × ${(height / 72).toFixed(1)}"</text>
            <text x="400" y="380" text-anchor="middle" font-family="Arial" font-size="14" fill="#9ca3af">PDF Preview Available</text>
          </svg>
        `

        // Convert SVG to blob
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })

        // Upload preview image
        const previewFileName = `${templateId}/page-${i + 1}.svg`
        console.log(`[PDF-PROCESSOR] Uploading preview for page ${i + 1}`)
        
        const { data: previewUpload, error: previewError } = await supabaseClient.storage
          .from('pdf-previews')
          .upload(previewFileName, svgBlob, {
            contentType: 'image/svg+xml',
            upsert: true
          })

        if (previewError) {
          console.error(`[PDF-PROCESSOR] Error uploading preview for page ${i + 1}:`, previewError)
          throw new Error(`Failed to upload preview: ${previewError.message}`)
        }

        // Get public URL
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
          console.error(`[PDF-PROCESSOR] Error creating page ${i + 1}:`, pageError)
          failedPages.push({ pageNumber: i + 1, error: pageError.message })
        } else {
          pages.push(pageData)
          console.log(`[PDF-PROCESSOR] Successfully processed page ${i + 1}`)
        }

      } catch (error) {
        console.error(`[PDF-PROCESSOR] Error processing page ${i + 1}:`, error)
        failedPages.push({ pageNumber: i + 1, error: error.message })
      }
    }

    // Step 5: Update template metadata
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
      pagesFailed: failedPages.length,
      avgPageWidth: pages.length > 0 ? pages.reduce((sum, p) => sum + (p.pdf_page_width || 0), 0) / pages.length : 0,
      avgPageHeight: pages.length > 0 ? pages.reduce((sum, p) => sum + (p.pdf_page_height || 0), 0) / pages.length : 0
    }

    console.log('[PDF-PROCESSOR] Updating template metadata')
    const { error: templateUpdateError } = await supabaseClient
      .from('templates')
      .update({
        original_pdf_url: pdfUrlData.publicUrl,
        pdf_metadata: pdfMetadata,
        dimensions: pages.length > 0 ? `${Math.round(pdfMetadata.avgPageWidth)} × ${Math.round(pdfMetadata.avgPageHeight)} pt` : null
      })
      .eq('id', templateId)

    if (templateUpdateError) {
      console.error('[PDF-PROCESSOR] Error updating template:', templateUpdateError)
    }

    const isSuccess = pages.length > 0
    const message = isSuccess 
      ? `Successfully processed ${pageCount} page PDF. Created ${pages.length} page previews.`
      : 'Failed to process PDF. No pages were created.'

    console.log(`[PDF-PROCESSOR] ${message}`)

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
    console.error('[PDF-PROCESSOR] Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error processing PDF', 
        message: `Processing failed: ${error.message}`
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
