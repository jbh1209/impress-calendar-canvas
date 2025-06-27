
import * as pdfjsLib from 'pdfjs-dist';
import { supabase } from '@/integrations/supabase/client';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface PDFPreviewResult {
  success: boolean;
  previewUrl?: string;
  error?: string;
}

export const generatePDFPreview = async (
  pdfUrl: string, 
  pageNumber: number, 
  templateId: string
): Promise<PDFPreviewResult> => {
  try {
    console.log(`[PDFPreviewGenerator] Generating preview for page ${pageNumber} from ${pdfUrl}`);
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    
    // Get the specific page
    const page = await pdf.getPage(pageNumber);
    
    // Calculate viewport (scale for good quality)
    const viewport = page.getViewport({ scale: 2.0 });
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Render the page
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    
    await page.render(renderContext).promise;
    
    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          throw new Error('Failed to create blob from canvas');
        }
      }, 'image/png', 0.9);
    });
    
    // Upload to Supabase storage
    const fileName = `${templateId}/page-${pageNumber}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdf-previews')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload preview: ${uploadError.message}`);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('pdf-previews')
      .getPublicUrl(fileName);
    
    console.log(`[PDFPreviewGenerator] Preview generated successfully: ${urlData.publicUrl}`);
    
    return {
      success: true,
      previewUrl: urlData.publicUrl
    };
    
  } catch (error) {
    console.error('[PDFPreviewGenerator] Error generating preview:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error generating preview'
    };
  }
};

export const generateAllPDFPreviews = async (
  pdfUrl: string,
  pages: Array<{ id: string; page_number: number }>,
  templateId: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ success: number; failed: number; results: PDFPreviewResult[] }> => {
  const results: PDFPreviewResult[] = [];
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    
    if (onProgress) {
      onProgress(i + 1, pages.length);
    }
    
    const result = await generatePDFPreview(pdfUrl, page.page_number, templateId);
    results.push(result);
    
    if (result.success && result.previewUrl) {
      // Update the template_pages record with the preview URL
      const { error: updateError } = await supabase
        .from('template_pages')
        .update({ preview_image_url: result.previewUrl })
        .eq('id', page.id);
      
      if (updateError) {
        console.error(`Failed to update page ${page.page_number}:`, updateError);
        failed++;
      } else {
        success++;
      }
    } else {
      failed++;
    }
  }
  
  return { success, failed, results };
};
