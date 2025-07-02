import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ProfessionalPdfViewerProps {
  pdfUrl: string | null;
  onPageChange?: (pageInfo: { pageNumber: number; width: number; height: number }) => void;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  className?: string;
}

const ProfessionalPdfViewer: React.FC<ProfessionalPdfViewerProps> = ({
  pdfUrl,
  onPageChange,
  onCanvasReady,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load PDF document
  useEffect(() => {
    if (!pdfUrl) {
      setPdfDoc(null);
      setTotalPages(0);
      setCurrentPage(1);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    pdfjsLib.getDocument(pdfUrl)
      .promise
      .then((pdf) => {
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF document');
        setIsLoading(false);
      });
  }, [pdfUrl]);

  // Render current page
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      // Calculate scale to fit container
      const container = containerRef.current;
      if (!container) return;

      const viewport = page.getViewport({ scale: 1 });
      const containerWidth = container.clientWidth - 40; // Account for padding
      const containerHeight = container.clientHeight - 100; // Account for controls
      
      const scaleX = containerWidth / viewport.width;
      const scaleY = containerHeight / viewport.height;
      const autoScale = Math.min(scaleX, scaleY, 2); // Max scale of 2
      
      const finalScale = scale * autoScale;
      const scaledViewport = page.getViewport({ scale: finalScale });

      // Set canvas dimensions
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      canvas.style.width = `${scaledViewport.width}px`;
      canvas.style.height = `${scaledViewport.height}px`;

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Render PDF page
      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };

      await page.render(renderContext).promise;

      // Notify parent of page info
      onPageChange?.({
        pageNumber: pageNum,
        width: viewport.width,
        height: viewport.height
      });

      // Notify parent canvas is ready
      onCanvasReady?.(canvas);

    } catch (err) {
      console.error('Error rendering page:', err);
      setError('Failed to render PDF page');
    }
  }, [pdfDoc, scale, onPageChange, onCanvasReady]);

  // Render page when dependencies change
  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale, renderPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  if (!pdfUrl) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-96 text-muted-foreground">
          Upload a PDF to begin template creation
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">PDF Preview</CardTitle>
          {totalPages > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="border-l border-border pl-2 ml-2 flex gap-1">
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleResetZoom}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading PDF...</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-96 text-destructive">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div 
            ref={containerRef}
            className="relative border rounded-lg bg-background overflow-auto"
            style={{ height: '600px' }}
          >
            <div className="flex items-center justify-center p-4">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full shadow-lg"
                style={{ border: '1px solid hsl(var(--border))' }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfessionalPdfViewer;