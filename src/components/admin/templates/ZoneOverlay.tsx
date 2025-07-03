import React, { useRef, useEffect } from 'react';

interface Zone {
  id?: string;
  name: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  is_repeating: boolean;
}

interface ZoneOverlayProps {
  zones: Zone[];
  currentZone: Zone | null;
  selectedZone: Zone | null;
  scale: number;
  pageWidth: number;
  pageHeight: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  isDrawing: boolean;
}

export const ZoneOverlay: React.FC<ZoneOverlayProps> = ({
  zones,
  currentZone,
  selectedZone,
  scale,
  pageWidth,
  pageHeight,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  isDrawing
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the overlay
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing zones
    zones.forEach(zone => {
      const isSelected = selectedZone?.id === zone.id;
      
      ctx.strokeStyle = isSelected ? '#3b82f6' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      
      const x = zone.x * scale;
      const y = zone.y * scale;
      const width = zone.width * scale;
      const height = zone.height * scale;
      
      ctx.strokeRect(x, y, width, height);

      // Zone label background
      ctx.fillStyle = isSelected ? '#3b82f6' : '#ef4444';
      ctx.globalAlpha = 0.8;
      
      const labelText = zone.name;
      ctx.font = '12px Arial';
      const textMetrics = ctx.measureText(labelText);
      const labelWidth = textMetrics.width + 8;
      const labelHeight = 20;
      
      ctx.fillRect(x, y - labelHeight, labelWidth, labelHeight);
      
      // Zone label text
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 1;
      ctx.fillText(labelText, x + 4, y - 6);

      // Zone type indicator
      const typeIndicator = zone.type === 'image' ? '🖼️' : '📝';
      ctx.fillText(typeIndicator, x + width - 20, y + 15);
    });

    // Draw current zone being created
    if (currentZone && isDrawing) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      const x = currentZone.x * scale;
      const y = currentZone.y * scale;
      const width = currentZone.width * scale;
      const height = currentZone.height * scale;
      
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
      
      // Show dimensions
      ctx.fillStyle = '#10b981';
      ctx.font = '11px Arial';
      ctx.fillText(
        `${Math.round(currentZone.width)} × ${Math.round(currentZone.height)}px`,
        x,
        y + height + 15
      );
    }
  }, [zones, currentZone, selectedZone, scale, isDrawing]);

  return (
    <canvas
      ref={canvasRef}
      width={pageWidth * scale}
      height={pageHeight * scale}
      className="absolute top-0 left-0 cursor-crosshair"
      style={{ 
        width: pageWidth * scale,
        height: pageHeight * scale
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    />
  );
};