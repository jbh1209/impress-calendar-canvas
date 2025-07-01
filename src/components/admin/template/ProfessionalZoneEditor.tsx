
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Trash2, Save, AlertTriangle } from "lucide-react";
import { CoordinateSystem, type PrintUnit } from "@/utils/coordinateSystem";

interface ZoneProperties {
  id?: string;
  name: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

interface ProfessionalZoneEditorProps {
  selectedZone: any | null;
  coordinateSystem?: CoordinateSystem;
  onZoneUpdate: (properties: ZoneProperties) => void;
  onZoneDelete: () => void;
  onZoneSave: () => void;
}

const ProfessionalZoneEditor: React.FC<ProfessionalZoneEditorProps> = ({
  selectedZone,
  coordinateSystem,
  onZoneUpdate,
  onZoneDelete,
  onZoneSave
}) => {
  const [properties, setProperties] = useState<ZoneProperties>({
    name: '',
    type: 'image',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    zIndex: 0
  });
  
  const [displayUnit, setDisplayUnit] = useState<PrintUnit>('mm');
  const [showPhysicalUnits, setShowPhysicalUnits] = useState(true);

  useEffect(() => {
    if (selectedZone) {
      const customProps = selectedZone.get('customProps');
      setProperties({
        id: customProps?.zoneId,
        name: customProps?.name || 'Unnamed Zone',
        type: customProps?.zoneType || 'image',
        x: Math.round(selectedZone.left || 0),
        y: Math.round(selectedZone.top || 0),
        width: Math.round(selectedZone.width || 100),
        height: Math.round(selectedZone.height || 100),
        zIndex: customProps?.zIndex || 0
      });
    }
  }, [selectedZone]);

  const handlePropertyChange = (key: keyof ZoneProperties, value: any) => {
    const updatedProperties = { ...properties, [key]: value };
    setProperties(updatedProperties);
    
    // Apply changes to the selected zone immediately
    if (selectedZone) {
      if (key === 'x') selectedZone.set('left', parseFloat(value) || 0);
      if (key === 'y') selectedZone.set('top', parseFloat(value) || 0);
      if (key === 'width') selectedZone.set('width', parseFloat(value) || 100);
      if (key === 'height') selectedZone.set('height', parseFloat(value) || 100);
      if (key === 'name') {
        const customProps = selectedZone.get('customProps') || {};
        selectedZone.set('customProps', { ...customProps, name: value });
      }
      
      selectedZone.canvas?.renderAll();
      onZoneUpdate(updatedProperties);
    }
  };

  const getPhysicalCoordinates = () => {
    if (!coordinateSystem) return null;
    
    const physical = coordinateSystem.canvasToPhysical(properties.x, properties.y, displayUnit);
    const physicalSize = coordinateSystem.canvasToPhysical(properties.width, properties.height, displayUnit);
    
    return {
      x: physical.x.toFixed(2),
      y: physical.y.toFixed(2),
      width: physicalSize.x.toFixed(2),
      height: physicalSize.y.toFixed(2),
      unit: displayUnit
    };
  };

  const getDimensionWarnings = () => {
    const warnings: string[] = [];
    
    if (properties.width < 10) warnings.push('Zone width is very small');
    if (properties.height < 10) warnings.push('Zone height is very small');
    if (properties.x < 0 || properties.y < 0) warnings.push('Zone extends outside canvas');
    
    return warnings;
  };

  if (!selectedZone) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Professional Zone Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 text-center py-4">
            Select a zone to edit its properties
          </div>
        </CardContent>
      </Card>
    );
  }

  const physicalCoords = getPhysicalCoordinates();
  const warnings = getDimensionWarnings();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Professional Zone Editor
          <Badge variant="outline" className="ml-2">
            {properties.type}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800 text-sm font-medium mb-1">
              <AlertTriangle className="h-4 w-4" />
              Warnings
            </div>
            {warnings.map((warning, index) => (
              <div key={index} className="text-xs text-amber-700">
                • {warning}
              </div>
            ))}
          </div>
        )}

        {/* Zone Name */}
        <div>
          <Label htmlFor="zone-name" className="text-xs">Zone Name</Label>
          <Input
            id="zone-name"
            value={properties.name}
            onChange={(e) => handlePropertyChange('name', e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Zone Type */}
        <div>
          <Label className="text-xs">Content Type</Label>
          <Select 
            value={properties.type} 
            onValueChange={(value: 'image' | 'text') => handlePropertyChange('type', value)}
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

        <Separator />

        {/* Unit Selection */}
        <div className="flex items-center justify-between">
          <Label className="text-xs">Display Units</Label>
          <Select value={displayUnit} onValueChange={(value: PrintUnit) => setDisplayUnit(value)}>
            <SelectTrigger className="w-20 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mm">mm</SelectItem>
              <SelectItem value="in">in</SelectItem>
              <SelectItem value="pt">pt</SelectItem>
              <SelectItem value="px">px</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Canvas Coordinates (Pixels) */}
        <div>
          <Label className="text-xs font-medium">Canvas Position (pixels)</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <Label htmlFor="canvas-x" className="text-xs text-gray-600">X</Label>
              <Input
                id="canvas-x"
                type="number"
                value={properties.x}
                onChange={(e) => handlePropertyChange('x', e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="canvas-y" className="text-xs text-gray-600">Y</Label>
              <Input
                id="canvas-y"
                type="number"
                value={properties.y}
                onChange={(e) => handlePropertyChange('y', e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <Label htmlFor="canvas-width" className="text-xs text-gray-600">Width</Label>
              <Input
                id="canvas-width"
                type="number"
                value={properties.width}
                onChange={(e) => handlePropertyChange('width', e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="canvas-height" className="text-xs text-gray-600">Height</Label>
              <Input
                id="canvas-height"
                type="number"
                value={properties.height}
                onChange={(e) => handlePropertyChange('height', e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Physical Coordinates */}
        {physicalCoords && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Label className="text-xs font-medium text-blue-800">Print Dimensions ({physicalCoords.unit})</Label>
            <div className="grid grid-cols-2 gap-2 mt-1 text-xs text-blue-700">
              <div>X: {physicalCoords.x} {physicalCoords.unit}</div>
              <div>Y: {physicalCoords.y} {physicalCoords.unit}</div>
              <div>W: {physicalCoords.width} {physicalCoords.unit}</div>
              <div>H: {physicalCoords.height} {physicalCoords.unit}</div>
            </div>
          </div>
        )}

        {/* Z-Index */}
        <div>
          <Label htmlFor="zone-zindex" className="text-xs">Layer Order (Z-Index)</Label>
          <Input
            id="zone-zindex"
            type="number"
            value={properties.zIndex}
            onChange={(e) => handlePropertyChange('zIndex', parseInt(e.target.value) || 0)}
            className="h-7 text-xs"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" onClick={onZoneSave} className="flex-1">
            <Save className="h-3 w-3 mr-1" />
            Save Zone
          </Button>
          <Button size="sm" variant="destructive" onClick={onZoneDelete}>
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalZoneEditor;
