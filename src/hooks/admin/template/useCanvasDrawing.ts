import { useCallback } from 'react';
import { Zone } from '@/components/admin/template/types/templateTypes';

interface UseCanvasDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  zones: Zone[];
  selectedZone: Zone | null;
  isDrawing: boolean;
  drawStart: { x: number; y: number } | null;
  onZoneCreate: (zone: Zone) => void;
  onZoneSelect: (zone: Zone | null) => void;
  setIsDrawing: (drawing: boolean) => void;
  setDrawStart: (start: { x: number; y: number } | null) => void;
}

export const useCanvasDrawing = ({
  canvasRef,
  zones,
  selectedZone,
  isDrawing,
  drawStart,
  onZoneCreate,
  onZoneSelect,
  setIsDrawing,
  setDrawStart
}: UseCanvasDrawingProps) => {
  
  const getCanvasCoordinates = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, [canvasRef]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setDrawStart(coords);
  }, [getCanvasCoordinates, setIsDrawing, setDrawStart]);

  const handleCanvasMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !drawStart) return;

    const coords = getCanvasCoordinates(e);
    const width = Math.abs(coords.x - drawStart.x);
    const height = Math.abs(coords.y - drawStart.y);

    if (width > 10 && height > 10) {
      const newZone: Zone = {
        id: `zone-${Date.now()}`,
        name: `Zone ${zones.length + 1}`,
        type: 'image',
        x: Math.min(drawStart.x, coords.x),
        y: Math.min(drawStart.y, coords.y),
        width,
        height
      };
      onZoneCreate(newZone);
      onZoneSelect(newZone);
    }

    setIsDrawing(false);
    setDrawStart(null);
  }, [isDrawing, drawStart, getCanvasCoordinates, zones.length, onZoneCreate, onZoneSelect, setIsDrawing, setDrawStart]);

  return {
    handleCanvasMouseDown,
    handleCanvasMouseUp
  };
};