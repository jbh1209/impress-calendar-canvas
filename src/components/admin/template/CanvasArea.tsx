import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TemplatePage, Zone } from './types/templateTypes';

interface CanvasAreaProps {
  currentPage: TemplatePage | null;
  pdfUrl: string | null;
  zones: Zone[];
  selectedZone: Zone | null;
  onCanvasMouseDown: (e: React.MouseEvent) => void;
  onCanvasMouseUp: (e: React.MouseEvent) => void;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
  currentPage,
  pdfUrl,
  zones,
  selectedZone,
  onCanvasMouseDown,
  onCanvasMouseUp,
  onCanvasReady
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Redraw zones on canvas
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw zones
    zones.forEach(zone => {
      ctx.strokeStyle = selectedZone?.id === zone.id ? '#3b82f6' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(zone.x || 0, zone.y || 0, zone.width || 0, zone.height || 0);

      // Draw zone label
      ctx.fillStyle = selectedZone?.id === zone.id ? '#3b82f6' : '#ef4444';
      ctx.font = '12px sans-serif';
      ctx.fillText(zone.name, (zone.x || 0) + 5, (zone.y || 0) + 15);
    });
  };

  // Notify parent when canvas is ready
  useEffect(() => {
    if (canvasRef.current) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  // Update canvas when zones change
  useEffect(() => {
    redrawCanvas();
  }, [zones, selectedZone]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Canvas {currentPage && `- Page ${currentPage.page_number}`}</CardTitle>
      </CardHeader>
      <CardContent>
        {currentPage ? (
          <div ref={containerRef} className="relative border rounded-lg bg-white">
            <canvas
              ref={canvasRef}
              width={currentPage.pdf_page_width || 400}
              height={currentPage.pdf_page_height || 600}
              className="max-w-full h-auto cursor-crosshair"
              onMouseDown={onCanvasMouseDown}
              onMouseUp={onCanvasMouseUp}
              style={{ 
                maxHeight: '600px',
                objectFit: 'contain'
              }}
            />
            {pdfUrl && (
              <object
                data={`${pdfUrl}#page=${currentPage.page_number}`}
                type="application/pdf"
                className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
                style={{ maxHeight: '600px' }}
              />
            )}
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">Upload a PDF to start creating zones</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CanvasArea;