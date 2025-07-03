import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker with CDN URL matching our version
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js`;

export interface PDFLoadResult {
  success: boolean;
  document?: pdfjsLib.PDFDocumentProxy;
  error?: string;
  pageCount?: number;
}

export class PDFService {
  private static instance: PDFService;
  private loadedDocuments = new Map<string, pdfjsLib.PDFDocumentProxy>();

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  async loadPDF(url: string): Promise<PDFLoadResult> {
    try {
      console.log('[PDFService] Loading PDF:', url);
      
      // Check cache first
      if (this.loadedDocuments.has(url)) {
        const document = this.loadedDocuments.get(url)!;
        return {
          success: true,
          document,
          pageCount: document.numPages
        };
      }

      const loadingTask = pdfjsLib.getDocument({
        url,
        verbosity: 0,
        withCredentials: false,
        httpHeaders: {},
        maxImageSize: 1024 * 1024 * 10, // 10MB
        cMapUrl: 'https://unpkg.com/pdfjs-dist@4.4.168/cmaps/',
        cMapPacked: true,
        disableFontFace: false,
        disableAutoFetch: false,
        disableStream: false,
      });

      // Add timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('PDF loading timeout')), 30000);
      });

      const document = await Promise.race([loadingTask.promise, timeoutPromise]);
      
      // Cache the document
      this.loadedDocuments.set(url, document);
      
      console.log('[PDFService] PDF loaded successfully, pages:', document.numPages);
      
      return {
        success: true,
        document,
        pageCount: document.numPages
      };
    } catch (error) {
      console.error('[PDFService] Failed to load PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async renderPageToCanvas(
    document: pdfjsLib.PDFDocumentProxy,
    pageNumber: number,
    canvas: HTMLCanvasElement,
    scale: number = 1
  ): Promise<boolean> {
    try {
      console.log(`[PDFService] Rendering page ${pageNumber} at scale ${scale}`);
      
      const page = await document.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      // Clear canvas
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      const renderTask = page.render({
        canvasContext: context,
        viewport
      });

      await renderTask.promise;
      console.log(`[PDFService] Page ${pageNumber} rendered successfully`);
      return true;
    } catch (error) {
      console.error(`[PDFService] Error rendering page ${pageNumber}:`, error);
      return false;
    }
  }

  async getPageDimensions(
    document: pdfjsLib.PDFDocumentProxy,
    pageNumber: number
  ): Promise<{ width: number; height: number }> {
    const page = await document.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    return {
      width: viewport.width,
      height: viewport.height
    };
  }

  cleanup(url?: string): void {
    if (url && this.loadedDocuments.has(url)) {
      const document = this.loadedDocuments.get(url);
      document?.destroy();
      this.loadedDocuments.delete(url);
    } else {
      // Clean up all documents
      for (const [key, document] of this.loadedDocuments) {
        document.destroy();
      }
      this.loadedDocuments.clear();
    }
  }
}