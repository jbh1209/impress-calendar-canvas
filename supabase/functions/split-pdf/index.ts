
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
        JSON.stringify({ error: 'Failed to upload PDF' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract PDF metadata
    const { PDFDocument } = await import('https://esm.sh/pdf-lib@1.17.1')
    
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const pageCount = pdfDoc.getPageCount()
    
    console.log(`PDF has ${pageCount} pages`)

    // Clean up existing pages
    const { error: deleteError } = await supabaseClient
      .from('template_pages')
      .delete()
      .eq('template_id', templateId)

    if (deleteError) {
      console.warn('Warning: Could not clean up existing pages:', deleteError)
    }

    // Process each page
    const pages = []
    const failedPages = []
    
    for (let i = 0; i < pageCount; i++) {
      try {
        const page = pdfDoc.getPage(i)
        const { width, height } = page.getSize()
        
        console.log(`Processing page ${i + 1} with dimensions ${width}x${height}pt`)

        // Generate a better preview image
        const previewImage = await generateBetterPreview(i + 1, width, height)
        
        // Upload preview image
        const previewFileName = `${templateId}/page-${i + 1}.png`
        const { data: imageUpload, error: imageUploadError } = await supabaseClient.storage
          .from('pdf-previews')
          .upload(previewFileName, previewImage, {
            contentType: 'image/png',
            upsert: true
          })

        let previewUrl = null
        if (!imageUploadError) {
          const { data: previewUrlData } = supabaseClient.storage
            .from('pdf-previews')
            .getPublicUrl(previewFileName)
          previewUrl = previewUrlData.publicUrl
          console.log(`Preview URL for page ${i + 1}: ${previewUrl}`)
        } else {
          console.warn(`Could not upload preview for page ${i + 1}:`, imageUploadError)
        }

        // Create template page record
        const { data: pageData, error: pageError } = await supabaseClient
          .from('template_pages')
          .insert({
            template_id: templateId,
            page_number: i + 1,
            preview_image_url: previewUrl,
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
          console.log(`Successfully created page ${i + 1}`)
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
      ? `Successfully processed PDF with ${pageCount} pages. Created ${pages.length} pages.`
      : `Failed to process PDF. No pages were created.`

    return new Response(
      JSON.stringify({
        success: isSuccess,
        message,
        pagesCreated: pages.length,
        pagesFailed: failedPages.length,
        failedPages: failedPages.length > 0 ? failedPages : undefined,
        pdfUrl: pdfUrlData.publicUrl,
        metadata: pdfMetadata
      }),
      { 
        status: isSuccess ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing PDF:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error processing PDF', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function generateBetterPreview(pageNumber: number, width: number, height: number): Promise<Uint8Array> {
  try {
    // Create a better preview with proper dimensions
    const canvasWidth = Math.min(1200, Math.round(width * 0.8))  // Higher resolution
    const canvasHeight = Math.min(900, Math.round(height * 0.8))
    
    console.log(`Generating preview for page ${pageNumber}: ${canvasWidth}x${canvasHeight}`)
    
    // Create image data
    const imageData = createBetterImageData(canvasWidth, canvasHeight, pageNumber, width, height)
    
    return createPNGFromImageData(imageData)
    
  } catch (error) {
    console.error('Error generating preview:', error)
    return createMinimalPNG()
  }
}

function createBetterImageData(width: number, height: number, pageNumber: number, pdfWidth: number, pdfHeight: number) {
  const pixels = new Uint8Array(width * height * 4) // RGBA
  
  // Fill with white background
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 255     // R
    pixels[i + 1] = 255 // G
    pixels[i + 2] = 255 // B
    pixels[i + 3] = 255 // A
  }
  
  // Add a more detailed grid pattern
  const gridSize = Math.max(20, Math.min(width, height) / 20)
  
  // Vertical lines
  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y++) {
      if (x < width && y < height) {
        const idx = (y * width + x) * 4
        pixels[idx] = 230     // Light gray
        pixels[idx + 1] = 230
        pixels[idx + 2] = 230
        pixels[idx + 3] = 255
      }
    }
  }
  
  // Horizontal lines
  for (let y = 0; y < height; y += gridSize) {
    for (let x = 0; x < width; x++) {
      if (x < width && y < height) {
        const idx = (y * width + x) * 4
        pixels[idx] = 230     // Light gray
        pixels[idx + 1] = 230
        pixels[idx + 2] = 230
        pixels[idx + 3] = 255
      }
    }
  }
  
  // Add border
  const borderWidth = 2
  for (let i = 0; i < borderWidth; i++) {
    // Top and bottom borders
    for (let x = 0; x < width; x++) {
      // Top
      const topIdx = (i * width + x) * 4
      pixels[topIdx] = 100
      pixels[topIdx + 1] = 100
      pixels[topIdx + 2] = 100
      pixels[topIdx + 3] = 255
      
      // Bottom
      const bottomIdx = ((height - 1 - i) * width + x) * 4
      pixels[bottomIdx] = 100
      pixels[bottomIdx + 1] = 100
      pixels[bottomIdx + 2] = 100
      pixels[bottomIdx + 3] = 255
    }
    
    // Left and right borders
    for (let y = 0; y < height; y++) {
      // Left
      const leftIdx = (y * width + i) * 4
      pixels[leftIdx] = 100
      pixels[leftIdx + 1] = 100
      pixels[leftIdx + 2] = 100
      pixels[leftIdx + 3] = 255
      
      // Right
      const rightIdx = (y * width + width - 1 - i) * 4
      pixels[rightIdx] = 100
      pixels[rightIdx + 1] = 100
      pixels[rightIdx + 2] = 100
      pixels[rightIdx + 3] = 255
    }
  }
  
  return { width, height, pixels }
}

function createPNGFromImageData(imageData: any): Uint8Array {
  // Create a basic PNG structure
  const { width, height, pixels } = imageData
  
  // PNG signature
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
  
  // IHDR chunk
  const ihdrData = new Uint8Array(13)
  const ihdrView = new DataView(ihdrData.buffer)
  ihdrView.setUint32(0, width, false)
  ihdrView.setUint32(4, height, false)
  ihdrData[8] = 8  // bit depth
  ihdrData[9] = 6  // color type (RGBA)
  ihdrData[10] = 0 // compression method
  ihdrData[11] = 0 // filter method
  ihdrData[12] = 0 // interlace method
  
  const ihdrChunk = createPNGChunk('IHDR', ihdrData)
  
  // IDAT chunk (simplified - just raw pixel data)
  const idatData = new Uint8Array(pixels.length + height) // Add filter bytes
  let idatIndex = 0
  
  for (let y = 0; y < height; y++) {
    idatData[idatIndex++] = 0 // No filter
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * 4
      idatData[idatIndex++] = pixels[pixelIndex]     // R
      idatData[idatIndex++] = pixels[pixelIndex + 1] // G
      idatData[idatIndex++] = pixels[pixelIndex + 2] // B
      idatData[idatIndex++] = pixels[pixelIndex + 3] // A
    }
  }
  
  const idatChunk = createPNGChunk('IDAT', idatData)
  
  // IEND chunk
  const iendChunk = createPNGChunk('IEND', new Uint8Array(0))
  
  // Combine all parts
  const totalLength = signature.length + ihdrChunk.length + idatChunk.length + iendChunk.length
  const result = new Uint8Array(totalLength)
  let offset = 0
  
  result.set(signature, offset)
  offset += signature.length
  
  result.set(ihdrChunk, offset)
  offset += ihdrChunk.length
  
  result.set(idatChunk, offset)
  offset += idatChunk.length
  
  result.set(iendChunk, offset)
  
  return result
}

function createPNGChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type)
  const chunk = new Uint8Array(12 + data.length)
  const view = new DataView(chunk.buffer)
  
  // Length
  view.setUint32(0, data.length, false)
  
  // Type
  chunk.set(typeBytes, 4)
  
  // Data
  chunk.set(data, 8)
  
  // CRC (simplified - just use a fixed value for now)
  view.setUint32(8 + data.length, 0, false)
  
  return chunk
}

function createMinimalPNG(): Uint8Array {
  // Create a minimal 1x1 white pixel PNG
  return new Uint8Array([
    137, 80, 78, 71, 13, 10, 26, 10, // PNG signature
    0, 0, 0, 13, 73, 72, 68, 82, // IHDR chunk
    0, 0, 0, 1, 0, 0, 0, 1, // 1x1 pixel
    8, 6, 0, 0, 0, 31, 21, 196, 137, // RGBA, no interlace
    0, 0, 0, 12, 73, 68, 65, 84, // IDAT chunk
    8, 153, 1, 1, 0, 0, 0, 255,
    255, 0, 0, 0, 2, 0, 1, 115,
    117, 1, 24, 0, 0, 0, 0, 73,
    69, 78, 68, 174, 66, 96, 130 // IEND chunk
  ])
}
