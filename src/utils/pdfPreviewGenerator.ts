
import * as pdfjsLib from 'pdfjs-dist';
import { supabase } from '@/integrations/supabase/client';

// Configure PDF.js worker with proper fallback
const configurePdfWorker = () => {
  try {
    // Try to use the worker from node_modules
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.js',
      import.meta.url
    ).toString();
  } catch (error) {
    console.warn('[PDFPreviewGenerator] Local worker failed, using CDN fallback:', error);
    // Fallback to CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
};

// Initialize worker configuration
configurePdfWorker();

export interface PDFPreviewResult {
  success: boolean;
  previewUrl?: string;
  error?: string;
  debugInfo?: {
    step: string;
    timestamp: number;
    details?: any;
  };
}

interface DebugLogger {
  log: (step: string, details?: any) => void;
  getDebugInfo: () => any[];
}

const createDebugLogger = (templateId: string, pageNumber: number): DebugLogger => {
  const logs: any[] = [];
  
  return {
    log: (step: string, details?: any) => {
      const logEntry = {
        step,
        timestamp: Date.now(),
        templateId,
        pageNumber,
        details
      };
      logs.push(logEntry);
      console.log(`[PDFPreviewGenerator] ${step}:`, details || '');
    },
    getDebugInfo: () => logs
  };
};

const createCanvas = (width: number, height: number): { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D } => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Could not get 2D rendering context');
  }
  
  // Set canvas dimensions with reasonable limits
  const maxDimension = 4096; // Prevent memory issues
  const actualWidth = Math.min(width, maxDimension);
  const actualHeight = Math.min(height, maxDimension);
  
  canvas.width = actualWidth;
  canvas.height = actualHeight;
  
  // Set white background
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, actualWidth, actualHeight);
  
  return { canvas, context };
};

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Canvas to blob conversion timed out'));
    }, 30000); // 30 second timeout
    
    canvas.toBlob((blob) => {
      clearTimeout(timeout);
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create blob from canvas'));
      }
    }, 'image/png', 0.85); // Reduced quality for better performance
  });
};

export const generatePDFPreview = async (
  pdfUrl: string, 
  pageNumber: number, 
  templateId: string
): Promise<PDFPreviewResult> => {
  const debugLogger = createDebugLogger(templateId, pageNumber);
  
  try {
    debugLogger.log('Starting PDF preview generation', { pdfUrl, pageNumber, templateId });
    
    // Validate inputs
    if (!pdfUrl || !pageNumber || !templateId) {
      throw new Error('Missing required parameters: pdfUrl, pageNumber, or templateId');
    }
    
    debugLogger.log('Loading PDF document');
    
    // Load PDF with timeout and proper error handling
    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      verbosity: 0, // Reduce console noise
      maxImageSize: 1024 * 1024 * 10, // 10MB limit
      disableFontFace: false,
      disableStream: false,
      disableAutoFetch: false,
    });
    
    // Set up timeout for PDF loading
    const loadTimeout = setTimeout(() => {
      loadingTask.destroy();
    }, 60000); // 60 second timeout
    
    let pdf: pdfjsLib.PDFDocumentProxy;
    try {
      pdf = await loadingTask.promise;
      clearTimeout(loadTimeout);
    } catch (error) {
      clearTimeout(loadTimeout);
      throw new Error(`Failed to load PDF: ${error.message}`);
    }
    
    debugLogger.log('PDF loaded successfully', { pageCount: pdf.numPages });
    
    // Validate page number
    if (pageNumber < 1 || pageNumber > pdf.numPages) {
      throw new Error(`Invalid page number ${pageNumber}. PDF has ${pdf.numPages} pages.`);
    }
    
    debugLogger.log('Getting PDF page');
    const page = await pdf.getPage(pageNumber);
    
    // Calculate optimal viewport
    const baseViewport = page.getViewport({ scale: 1.0 });
    const targetWidth = 1200; // Reasonable target width
    const scale = Math.min(2.0, targetWidth / baseViewport.width); // Cap at 2x scale
    const viewport = page.getViewport({ scale });
    
    debugLogger.log('Viewport calculated', {
      originalSize: { width: baseViewport.width, height: baseViewport.height },
      scale,
      finalSize: { width: viewport.width, height: viewport.height }
    });
    
    // Create canvas
    const { canvas, context } = createCanvas(viewport.width, viewport.height);
    
    debugLogger.log('Canvas created', { width: canvas.width, height: canvas.height });
    
    // Render page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      enableWebGL: false, // Disable WebGL for better compatibility
    };
    
    debugLogger.log('Starting page render');
    await page.render(renderContext).promise;
    
    debugLogger.log('Page rendered successfully');
    
    // Convert to blob
    const blob = await canvasToBlob(canvas);
    
    debugLogger.log('Canvas converted to blob', { size: blob.size });
    
    // Clean up
    canvas.remove();
    pdf.destroy();
    
    // Upload to Supabase
    const fileName = `${templateId}/page-${pageNumber}-${Date.now()}.png`;
    
    debugLogger.log('Uploading to Supabase', { fileName, bucketName: 'pdf-previews' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdf-previews')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: true,
        cacheControl: '3600' // 1 hour cache
      });
    
    if (uploadError) {
      debugLogger.log('Upload failed', uploadError);
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('pdf-previews')
      .getPublicUrl(fileName);
    
    if (!urlData.publicUrl) {
      throw new Error('Failed to generate public URL for uploaded image');
    }
    
    debugLogger.log('Upload completed successfully', { publicUrl: urlData.publicUrl });
    
    return {
      success: true,
      previewUrl: urlData.publicUrl,
      debugInfo: {
        step: 'completed',
        timestamp: Date.now(),
        details: debugLogger.getDebugInfo()
      }
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    debugLogger.log('Error occurred', { error: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    
    console.error('[PDFPreviewGenerator] Preview generation failed:', error);
    
    return {
      success: false,
      error: errorMessage,
      debugInfo: {
        step: 'failed',
        timestamp: Date.now(),
        details: debugLogger.getDebugInfo()
      }
    };
  }
};

export const generateAllPDFPreviews = async (
  pdfUrl: string,
  pages: Array<{ id: string; page_number: number }>,
  templateId: string,
  onProgress?: (current: number, total: number, status: string) => void
): Promise<{ success: number; failed: number; results: PDFPreviewResult[]; errors: string[] }> => {
  const results: PDFPreviewResult[] = [];
  const errors: string[] = [];
  let success = 0;
  let failed = 0;
  
  console.log(`[PDFPreviewGenerator] Starting batch generation for ${pages.length} pages`);
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    
    if (onProgress) {
      onProgress(i + 1, pages.length, `Processing page ${page.page_number}...`);
    }
    
    try {
      const result = await generatePDFPreview(pdfUrl, page.page_number, templateId);
      results.push(result);
      
      if (result.success && result.previewUrl) {
        // Update the template_pages record with the preview URL
        const { error: updateError } = await supabase
          .from('template_pages')
          .update({ 
            preview_image_url: result.previewUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', page.id);
        
        if (updateError) {
          console.error(`Failed to update page ${page.page_number}:`, updateError);
          errors.push(`Failed to update database for page ${page.page_number}: ${updateError.message}`);
          failed++;
        } else {
          success++;
          console.log(`Successfully processed page ${page.page_number}`);
        }
      } else {
        failed++;
        const errorMsg = `Page ${page.page_number}: ${result.error || 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    } catch (error) {
      failed++;
      const errorMsg = `Page ${page.page_number}: ${error instanceof Error ? error.message : 'Unexpected error'}`;
      errors.push(errorMsg);
      console.error(`Unexpected error processing page ${page.page_number}:`, error);
    }
    
    // Small delay to prevent overwhelming the browser
    if (i < pages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`[PDFPreviewGenerator] Batch completed: ${success} success, ${failed} failed`);
  
  return { success, failed, results, errors };
};
