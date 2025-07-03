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
    const templateName = formData.get('template_name') as string

    if (!pdfFile || !templateId) {
      return new Response(
        JSON.stringify({ error: 'PDF file and template_id are required' }),
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
      console.error('PDF upload error:', pdfUploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload PDF' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Load PDF with PDF-lib to get page count and dimensions
    const { PDFDocument } = await import('https://esm.sh/pdf-lib@1.17.1')
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const pageCount = pdfDoc.getPageCount()

    console.log(`PDF has ${pageCount} pages`)

    // Clear existing pages
    await supabaseClient
      .from('template_pages')
      .delete()
      .eq('template_id', templateId)

    // Create page records
    const pages = []
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const pdfPage = pdfDoc.getPage(pageNum - 1)
      const { width, height } = pdfPage.getSize()
      
      const { data: pageData, error: pageError } = await supabaseClient
        .from('template_pages')
        .insert({
          template_id: templateId,
          page_number: pageNum,
          pdf_page_width: width,
          pdf_page_height: height,
          pdf_units: 'pt'
        })
        .select()
        .single()

      if (pageError) {
        console.error(`Error creating page ${pageNum}:`, pageError)
      } else {
        pages.push(pageData)
      }
    }

    // Update template with PDF URL and metadata
    const { data: pdfUrlData } = supabaseClient.storage
      .from('template-files')
      .getPublicUrl(pdfFileName)

    const { error: templateUpdateError } = await supabaseClient
      .from('templates')
      .update({
        original_pdf_url: pdfUrlData.publicUrl,
        pdf_metadata: {
          pageCount,
          fileSize: pdfBuffer.byteLength,
          processedAt: new Date().toISOString()
        }
      })
      .eq('id', templateId)

    if (templateUpdateError) {
      console.error('Template update error:', templateUpdateError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${pageCount} pages`,
        pagesCreated: pages.length,
        pdfUrl: pdfUrlData.publicUrl,
        pages
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('PDF processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process PDF' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})