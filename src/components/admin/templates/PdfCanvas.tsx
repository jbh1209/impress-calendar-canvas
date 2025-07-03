import React, { useRef, useEffect, useState } from 'react';
import { PDFService } from '@/utils/pdfService';
import { toast } from 'sonner';

interface PdfCanvasProps {
  pdfUrl: string;
  pageNumber: number;
  onCanvasReady: (canvas: HTMLCanvasElement, scale: number) => void;
  containerWidth?: number;
  pageWidth: number;
  pageHeight: number;
}

export const PdfCanvas: React.FC<PdfCanvasProps> = ({
  pdfUrl,
  pageNumber,
  onCanvasReady,
  containerWidth,
  pageWidth,
  pageHeight
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfService] = useState(() => PDFService.getInstance());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const loadAndRenderPdf = async () => {
      if (!canvasRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log(`[PdfCanvas] Loading PDF: ${pdfUrl}, Page: ${pageNumber}`);
        
        const result = await pdfService.loadPDF(pdfUrl);
        
        if (!result.success || !result.document) {
          throw new Error(result.error || 'Failed to load PDF');
        }

        // Get actual page dimensions
        const dimensions = await pdfService.getPageDimensions(result.document, pageNumber);
        
        // Calculate optimal scale
        const calculatedScale = containerWidth ? 
          Math.min(containerWidth / dimensions.width, 1.5) : 1;
        setScale(calculatedScale);

        // Render PDF page
        const success = await pdfService.renderPageToCanvas(
          result.document,
          pageNumber,
          canvasRef.current,
          calculatedScale
        );

        if (!success) {
          throw new Error('Failed to render PDF page');
        }

        console.log(`[PdfCanvas] PDF rendered successfully at scale ${calculatedScale}`);
        onCanvasReady(canvasRef.current, calculatedScale);
        setIsLoading(false);

      } catch (err) {
        console.error('[PdfCanvas] Error loading PDF:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load PDF';
        setError(errorMessage);
        setIsLoading(false);
        toast.error(`PDF Loading Error: ${errorMessage}`);
      }
    };

    loadAndRenderPdf();

    return () => {
      // Cleanup handled by service singleton
    };
  }, [pdfUrl, pageNumber, containerWidth, pageWidth, onCanvasReady, pdfService]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg border-2 border-dashed">
        <div className="text-center">
          <p className="text-destructive font-medium">Failed to load PDF</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading PDF page {pageNumber}...</p>
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="max-w-full"
      style={{ 
        width: pageWidth * scale,
        height: pageHeight * scale
      }}
    />
  );
};