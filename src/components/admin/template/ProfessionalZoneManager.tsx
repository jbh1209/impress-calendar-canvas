import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Image, Type, Trash2, Move, Square } from 'lucide-react';
import { CoordinateSystem } from '@/utils/coordinateSystem';

interface PrintZone {
  id: string;
  name: string;
  type: 'image' | 'text';
  x: number; // in points
  y: number; // in points
  width: number; // in points
  height: number; // in points
  z_index: number;
}

interface ProfessionalZoneManagerProps {
  zones: PrintZone[];
  onZonesChange: (zones: PrintZone[]) => void;
  selectedZone: PrintZone | null;
  onZoneSelect: (zone: PrintZone | null) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  pageInfo: { width: number; height: number } | null;
  onZoneCreate: (type: 'image' | 'text') => void;
  unit: 'mm' | 'in' | 'pt';
}

const ProfessionalZoneManager: React.FC<ProfessionalZoneManagerProps> = ({
  zones,
  onZonesChange,
  selectedZone,
  onZoneSelect,
  canvasRef,
  pageInfo,
  onZoneCreate,
  unit
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Convert between units for display
  const convertFromPoints = useCallback((value: number) => {
    return Math.round(CoordinateSystem.convertUnit(value, 'pt', unit) * 100) / 100;
  }, [unit]);

  const convertToPoints = useCallback((value: number) => {
    return CoordinateSystem.convertUnit(value, unit, 'pt');
  }, [unit]);

  // Get canvas coordinates from mouse event
  const getCanvasCoords = useCallback((e: MouseEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !pageInfo) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = pageInfo.width / rect.width;
    const scaleY = pageInfo.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, [canvasRef, pageInfo]);

  // Find zone at coordinates
  const findZoneAtPoint = useCallback((x: number, y: number) => {
    // Check zones in reverse z-index order (top to bottom)
    const sortedZones = [...zones].sort((a, b) => b.z_index - a.z_index);
    return sortedZones.find(zone => 
      x >= zone.x && x <= zone.x + zone.width &&
      y >= zone.y && y <= zone.y + zone.height
    );
  }, [zones]);

  // Handle mouse events on canvas
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    const coords = getCanvasCoords(e);
    const clickedZone = findZoneAtPoint(coords.x, coords.y);

    if (clickedZone) {
      // Start dragging existing zone
      onZoneSelect(clickedZone);
      setIsDragging(true);
      setDragOffset({
        x: coords.x - clickedZone.x,
        y: coords.y - clickedZone.y
      });
    } else {
      // Start drawing new zone
      onZoneSelect(null);
      setIsDrawing(true);
      setDrawStart(coords);
    }
  }, [getCanvasCoords, findZoneAtPoint, onZoneSelect]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!pageInfo) return;

    const coords = getCanvasCoords(e);

    if (isDragging && selectedZone) {
      // Update zone position
      const newX = Math.max(0, Math.min(coords.x - dragOffset.x, pageInfo.width - selectedZone.width));
      const newY = Math.max(0, Math.min(coords.y - dragOffset.y, pageInfo.height - selectedZone.height));

      const updatedZone = { ...selectedZone, x: newX, y: newY };
      const updatedZones = zones.map(z => z.id === selectedZone.id ? updatedZone : z);
      onZonesChange(updatedZones);
      onZoneSelect(updatedZone);
    }
  }, [isDragging, selectedZone, dragOffset, getCanvasCoords, zones, onZonesChange, onZoneSelect, pageInfo]);

  const handleCanvasMouseUp = useCallback((e: React.MouseEvent) => {
    if (isDrawing && drawStart) {
      const coords = getCanvasCoords(e);
      const width = Math.abs(coords.x - drawStart.x);
      const height = Math.abs(coords.y - drawStart.y);

      if (width > 10 && height > 10) {
        const newZone: PrintZone = {
          id: `zone-${Date.now()}`,
          name: `Zone ${zones.length + 1}`,
          type: 'image',
          x: Math.min(drawStart.x, coords.x),
          y: Math.min(drawStart.y, coords.y),
          width,
          height,
          z_index: Math.max(...zones.map(z => z.z_index), 0) + 1
        };

        onZonesChange([...zones, newZone]);
        onZoneSelect(newZone);
      }
    }

    setIsDrawing(false);
    setDrawStart(null);
    setIsDragging(false);
  }, [isDrawing, drawStart, getCanvasCoords, zones, onZonesChange, onZoneSelect]);

  // Update zone properties
  const updateZone = useCallback((updates: Partial<PrintZone>) => {
    if (!selectedZone) return;
    
    const updatedZone = { ...selectedZone, ...updates };
    const updatedZones = zones.map(z => z.id === selectedZone.id ? updatedZone : z);
    onZonesChange(updatedZones);
    onZoneSelect(updatedZone);
  }, [selectedZone, zones, onZonesChange, onZoneSelect]);

  // Delete zone
  const deleteZone = useCallback((zoneId: string) => {
    const updatedZones = zones.filter(z => z.id !== zoneId);
    onZonesChange(updatedZones);
    if (selectedZone?.id === zoneId) {
      onZoneSelect(null);
    }
  }, [zones, selectedZone, onZonesChange, onZoneSelect]);

  // Render zones overlay on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pageInfo) return;

    // Create overlay canvas if it doesn't exist
    let overlayCanvas = canvas.parentElement?.querySelector('.zone-overlay') as HTMLCanvasElement;
    if (!overlayCanvas) {
      overlayCanvas = document.createElement('canvas');
      overlayCanvas.className = 'zone-overlay';
      overlayCanvas.style.position = 'absolute';
      overlayCanvas.style.top = '0';
      overlayCanvas.style.left = '0';
      overlayCanvas.style.pointerEvents = 'none';
      overlayCanvas.style.zIndex = '10';
      canvas.parentElement?.appendChild(overlayCanvas);
    }

    // Match overlay canvas size to main canvas
    const rect = canvas.getBoundingClientRect();
    overlayCanvas.width = canvas.width;
    overlayCanvas.height = canvas.height;
    overlayCanvas.style.width = canvas.style.width;
    overlayCanvas.style.height = canvas.style.height;

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Scale for display
    const scaleX = canvas.width / pageInfo.width;
    const scaleY = canvas.height / pageInfo.height;

    // Draw zones
    zones.forEach(zone => {
      const x = zone.x * scaleX;
      const y = zone.y * scaleY;
      const width = zone.width * scaleX;
      const height = zone.height * scaleY;

      // Zone outline
      ctx.strokeStyle = selectedZone?.id === zone.id ? '#3b82f6' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Zone background
      ctx.fillStyle = selectedZone?.id === zone.id ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)';
      ctx.fillRect(x, y, width, height);

      // Zone label
      ctx.fillStyle = selectedZone?.id === zone.id ? '#3b82f6' : '#ef4444';
      ctx.font = '12px sans-serif';
      ctx.fillText(zone.name, x + 5, y + 15);

      // Zone type icon indicator
      const iconText = zone.type === 'image' ? '🖼️' : '📝';
      ctx.fillText(iconText, x + width - 20, y + 15);
    });
  }, [zones, selectedZone, canvasRef, pageInfo]);

  // Add event listeners to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleCanvasMouseDown as any);
    canvas.addEventListener('mousemove', handleCanvasMouseMove as any);
    canvas.addEventListener('mouseup', handleCanvasMouseUp as any);

    return () => {
      canvas.removeEventListener('mousedown', handleCanvasMouseDown as any);
      canvas.removeEventListener('mousemove', handleCanvasMouseMove as any);
      canvas.removeEventListener('mouseup', handleCanvasMouseUp as any);
    };
  }, [handleCanvasMouseDown, handleCanvasMouseMove, handleCanvasMouseUp]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Zone Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Zone Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onZoneCreate('image')}
            className="flex-1"
          >
            <Image className="h-4 w-4 mr-1" />
            Image
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onZoneCreate('text')}
            className="flex-1"
          >
            <Type className="h-4 w-4 mr-1" />
            Text
          </Button>
        </div>

        {/* Zone List */}
        {zones.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Zones ({zones.length})</Label>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                    selectedZone?.id === zone.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => onZoneSelect(zone)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {zone.type === 'image' ? 
                      <Image className="h-3 w-3 text-muted-foreground flex-shrink-0" /> : 
                      <Type className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    }
                    <span className="text-xs truncate">{zone.name}</span>
                    <Badge variant="outline" className="text-xs px-1">
                      {convertFromPoints(zone.width)}×{convertFromPoints(zone.height)} {unit}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteZone(zone.id);
                    }}
                    className="h-6 w-6 p-0 flex-shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zone Properties */}
        {selectedZone && (
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-xs text-muted-foreground">Zone Properties</Label>
            
            <div className="space-y-2">
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  value={selectedZone.name}
                  onChange={(e) => updateZone({ name: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Type</Label>
                <Select 
                  value={selectedZone.type} 
                  onValueChange={(value: 'image' | 'text') => updateZone({ type: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image Zone</SelectItem>
                    <SelectItem value="text">Text Zone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">X ({unit})</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={convertFromPoints(selectedZone.x)}
                  onChange={(e) => updateZone({ x: convertToPoints(parseFloat(e.target.value) || 0) })}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Y ({unit})</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={convertFromPoints(selectedZone.y)}
                  onChange={(e) => updateZone({ y: convertToPoints(parseFloat(e.target.value) || 0) })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Width ({unit})</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={convertFromPoints(selectedZone.width)}
                  onChange={(e) => updateZone({ width: convertToPoints(parseFloat(e.target.value) || 0) })}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Height ({unit})</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={convertFromPoints(selectedZone.height)}
                  onChange={(e) => updateZone({ height: convertToPoints(parseFloat(e.target.value) || 0) })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="text-xs text-muted-foreground pt-2 space-y-1">
              <div>Precise coordinates in points:</div>
              <div>Position: {Math.round(selectedZone.x * 100) / 100}, {Math.round(selectedZone.y * 100) / 100} pt</div>
              <div>Size: {Math.round(selectedZone.width * 100) / 100} × {Math.round(selectedZone.height * 100) / 100} pt</div>
            </div>
          </div>
        )}

        {zones.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Square className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No zones created yet</p>
            <p className="text-xs">Click Image or Text buttons to create zones</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfessionalZoneManager;