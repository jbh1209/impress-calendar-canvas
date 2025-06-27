
import { supabase } from '@/integrations/supabase/client';

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

// Lazy PDF.js initialization
let pdfLibLoaded = false;
let pdfjsLib: any = null;

const initializePDFJS = async (): Promise<any> => {
  if (pdfLibLoaded && pdfjsLib) {
    return pdfjsLib;
  }

  try {
    console.log('[PDFPreviewGenerator] Loading PDF.js library...');
    
    // Dynamic import of PDF.js
    pdfjsLib = await import('pdfjs-dist');
    
    // Configure worker with CDN fallback
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      console.log('[PDFPreviewGenerator] Worker configured with CDN URL');
    } catch (workerError) {
      console.warn('[PDFPreviewGenerator] Worker configuration warning:', workerError);
    }
    
    pdfLibLoaded = true;
    console.log('[PDFPreviewGenerator] PDF.js loaded successfully');
    return pdfjsLib;
    
  } catch (error) {
    console.error('[PDFPreviewGenerator] Failed to load PDF.js:', error);
    throw new Error(`PDF.js initialization failed: ${error.message}`);
  }
};

const createCanvas = (width: number, height: number): { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D } => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Could not get 2D rendering context');
  }
  
  // Set canvas dimensions with reasonable limits
  const maxDimension = 2048; // Reduced to prevent memory issues
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
    }, 15000); // Reduced timeout
    
    canvas.toBlob((blob) => {
      clearTimeout(timeout);
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create blob from canvas'));
      }
    }, 'image/png', 0.8);
  });
};

export const generatePDFPreview = async (
  pdfUrl: string, 
  pageNumber: number, 
  templateId: string
): Promise<PDFPreviewResult> => {
  const debugLogger = createDebugLogger(templateId, pageNumber);
  let pdf: any = null;
  
  try {
    debugLogger.log('Starting PDF preview generation', { pdfUrl, pageNumber, templateId });
    
    // Validate inputs
    if (!pdfUrl || !pageNumber || !templateId) {
      throw new Error('Missing required parameters: pdfUrl, pageNumber, or templateId');
    }
    
    // Initialize PDF.js
    debugLogger.log('Initializing PDF.js');
    const pdfLib = await initializePDFJS();
    
    if (!pdfLib) {
      throw new Error('PDF.js failed to initialize');
    }
    
    debugLogger.log('Loading PDF document');
    
    // Load PDF with proper configuration
    const loadingTask = pdfLib.getDocument({
      url: pdfUrl,
      verbosity: 0,
      maxImageSize: 1024 * 1024 * 5, // 5MB limit
      disableFontFace: false,
      disableStream: false,
      disableAutoFetch: false,
    });
    
    // Set up timeout for PDF loading
    const loadTimeout = setTimeout(() => {
      if (loadingTask && typeof loadingTask.destroy === 'function') {
        loadingTask.destroy();
      }
    }, 30000); // 30 second timeout
    
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
    const targetWidth = 800; // Reasonable target width
    const scale = Math.min(1.5, targetWidth / baseViewport.width); // Cap at 1.5x scale
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
      enableWebGL: false,
    };
    
    debugLogger.log('Starting page render');
    await page.render(renderContext).promise;
    
    debugLogger.log('Page rendered successfully');
    
    // Convert to blob
    const blob = await canvasToBlob(canvas);
    
    debugLogger.log('Canvas converted to blob', { size: blob.size });
    
    // Clean up canvas
    canvas.remove();
    
    // Upload to Supabase
    const fileName = `${templateId}/page-${pageNumber}-${Date.now()}.png`;
    
    debugLogger.log('Uploading to Supabase', { fileName, bucketName: 'pdf-previews' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdf-previews')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: true,
        cacheControl: '3600'
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
  } finally {
    // Clean up PDF document
    if (pdf && typeof pdf.destroy === 'function') {
      try {
        pdf.destroy();
      } catch (cleanupError) {
        console.warn('[PDFPreviewGenerator] PDF cleanup warning:', cleanupError);
      }
    }
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
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log(`[PDFPreviewGenerator] Batch completed: ${success} success, ${failed} failed`);
  
  return { success, failed, results, errors };
};
