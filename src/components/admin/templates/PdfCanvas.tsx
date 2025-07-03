import React, { useRef, useEffect, useState } from 'react';
import { PDFRenderer } from '@/utils/pdfRenderer';
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
  const [pdfRenderer] = useState(() => new PDFRenderer());
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
        
        await pdfRenderer.loadPDF(pdfUrl);
        
        // Calculate optimal scale
        const calculatedScale = containerWidth ? 
          Math.min(containerWidth / pageWidth, 1.5) : 1;
        setScale(calculatedScale);

        // Render PDF page
        await pdfRenderer.renderPageToCanvas(
          pageNumber,
          canvasRef.current,
          { scale: calculatedScale }
        );

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
      pdfRenderer.destroy();
    };
  }, [pdfUrl, pageNumber, containerWidth, pageWidth, onCanvasReady, pdfRenderer]);

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