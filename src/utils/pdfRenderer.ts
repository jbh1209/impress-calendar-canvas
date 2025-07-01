
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

// Set up PDF.js worker
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;

export interface PDFRenderOptions {
  scale?: number;
  quality?: number;
}

export class PDFRenderer {
  private document: PDFDocumentProxy | null = null;

  async loadPDF(url: string): Promise<PDFDocumentProxy> {
    try {
      console.log('[PDFRenderer] Loading PDF from:', url);
      this.document = await getDocument(url).promise;
      console.log('[PDFRenderer] PDF loaded successfully, pages:', this.document.numPages);
      return this.document;
    } catch (error) {
      console.error('[PDFRenderer] Failed to load PDF:', error);
      throw new Error(`Failed to load PDF: ${error.message}`);
    }
  }

  async renderPageToCanvas(
    pageNumber: number, 
    canvas: HTMLCanvasElement,
    options: PDFRenderOptions = {}
  ): Promise<void> {
    if (!this.document) {
      throw new Error('PDF document not loaded');
    }

    const { scale = 1.0 } = options;

    try {
      console.log(`[PDFRenderer] Rendering page ${pageNumber} at scale ${scale}`);
      
      const page: PDFPageProxy = await this.document.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      
      // Set canvas dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const canvasContext = canvas.getContext('2d');
      if (!canvasContext) {
        throw new Error('Failed to get canvas context');
      }

      // Render the page
      await page.render({
        canvasContext,
        viewport
      }).promise;

      console.log(`[PDFRenderer] Page ${pageNumber} rendered successfully`);
    } catch (error) {
      console.error(`[PDFRenderer] Error rendering page ${pageNumber}:`, error);
      throw error;
    }
  }

  async getPageDimensions(pageNumber: number): Promise<{ width: number; height: number }> {
    if (!this.document) {
      throw new Error('PDF document not loaded');
    }

    const page = await this.document.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.0 });
    
    return {
      width: viewport.width,
      height: viewport.height
    };
  }

  getNumPages(): number {
    return this.document?.numPages || 0;
  }

  destroy(): void {
    if (this.document) {
      this.document.destroy();
      this.document = null;
    }
  }
}
