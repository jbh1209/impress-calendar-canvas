
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

// Set up PDF.js worker - Updated to match package version 5.3.31
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/5.3.31/pdf.worker.min.js`;

export interface PDFPageInfo {
  pageNumber: number;
  mediaBox: [number, number, number, number]; // [x, y, width, height]
  cropBox: [number, number, number, number];
  bleedBox?: [number, number, number, number];
  trimBox?: [number, number, number, number];
  width: number;
  height: number;
  rotation: number;
}

export interface PDFProcessingResult {
  success: boolean;
  pageCount: number;
  pages: PDFPageInfo[];
  error?: string;
}

export class PDFProcessor {
  private document: PDFDocumentProxy | null = null;

  async loadPDF(url: string): Promise<PDFProcessingResult> {
    try {
      console.log('[PDFProcessor] Loading PDF from:', url);
      
      this.document = await getDocument({
        url,
        verbosity: 0,
        maxImageSize: 1024 * 1024 * 10, // 10MB limit
        disableFontFace: false,
        disableStream: false,
        disableAutoFetch: false,
      }).promise;

      const pageCount = this.document.numPages;
      const pages: PDFPageInfo[] = [];

      // Extract information from each page
      for (let i = 1; i <= pageCount; i++) {
        const page = await this.document.getPage(i);
        const pageInfo = await this.extractPageInfo(page, i);
        pages.push(pageInfo);
      }

      console.log(`[PDFProcessor] Successfully processed ${pageCount} pages`);
      
      return {
        success: true,
        pageCount,
        pages
      };
    } catch (error) {
      console.error('[PDFProcessor] Failed to load PDF:', error);
      return {
        success: false,
        pageCount: 0,
        pages: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async extractPageInfo(page: PDFPageProxy, pageNumber: number): Promise<PDFPageInfo> {
    const viewport = page.getViewport({ scale: 1.0 });
    
    // Get page boxes for print production
    const mediaBox = page.view; // The physical paper size
    const userUnit = page.userUnit || 1.0;
    
    return {
      pageNumber,
      mediaBox: mediaBox as [number, number, number, number],
      cropBox: mediaBox as [number, number, number, number], // Fallback to mediaBox
      width: viewport.width,
      height: viewport.height,
      rotation: viewport.rotation
    };
  }

  async renderPageToCanvas(
    pageNumber: number,
    canvas: HTMLCanvasElement,
    targetWidth: number,
    targetHeight: number
  ): Promise<boolean> {
    if (!this.document) {
      console.error('[PDFProcessor] No document loaded');
      return false;
    }

    try {
      const page = await this.document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.0 });
      
      // Calculate scale to fit target dimensions
      const scaleX = targetWidth / viewport.width;
      const scaleY = targetHeight / viewport.height;
      const scale = Math.min(scaleX, scaleY);
      
      const scaledViewport = page.getViewport({ scale });
      
      // Set canvas dimensions
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      // Clear canvas
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Render the page
      await page.render({
        canvasContext: context,
        viewport: scaledViewport
      }).promise;

      console.log(`[PDFProcessor] Rendered page ${pageNumber} at scale ${scale}`);
      return true;
    } catch (error) {
      console.error(`[PDFProcessor] Error rendering page ${pageNumber}:`, error);
      return false;
    }
  }

  getPageCount(): number {
    return this.document?.numPages || 0;
  }

  destroy(): void {
    if (this.document) {
      this.document.destroy();
      this.document = null;
    }
  }
}
