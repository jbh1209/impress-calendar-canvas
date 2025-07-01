
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Trash2, Save } from "lucide-react";

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

interface ZonePropertiesPanelProps {
  selectedZone: any | null;
  templateDimensions?: {
    width: number;
    height: number;
    units: string;
  };
  onZoneUpdate: (properties: ZoneProperties) => void;
  onZoneDelete: () => void;
  onZoneSave: () => void;
}

const ZonePropertiesPanel: React.FC<ZonePropertiesPanelProps> = ({
  selectedZone,
  templateDimensions,
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

  const getPhysicalDimensions = () => {
    if (!templateDimensions) return null;
    
    // Convert pixel coordinates to physical dimensions
    const pixelsPerUnit = templateDimensions.units === 'in' ? 72 : 2.83;
    const physicalX = (properties.x / pixelsPerUnit).toFixed(2);
    const physicalY = (properties.y / pixelsPerUnit).toFixed(2);
    const physicalWidth = (properties.width / pixelsPerUnit).toFixed(2);
    const physicalHeight = (properties.height / pixelsPerUnit).toFixed(2);
    
    return {
      x: physicalX,
      y: physicalY,
      width: physicalWidth,
      height: physicalHeight,
      units: templateDimensions.units
    };
  };

  if (!selectedZone) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Zone Properties
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

  const physicalDims = getPhysicalDimensions();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Zone Properties
          <Badge variant="outline" className="ml-2">
            {properties.type}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Zone Name */}
        <div>
          <Label htmlFor="zone-name" className="text-xs">Name</Label>
          <Input
            id="zone-name"
            value={properties.name}
            onChange={(e) => handlePropertyChange('name', e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Zone Type */}
        <div>
          <Label className="text-xs">Type</Label>
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

        {/* Position */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="zone-x" className="text-xs">X Position (px)</Label>
            <Input
              id="zone-x"
              type="number"
              value={properties.x}
              onChange={(e) => handlePropertyChange('x', e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="zone-y" className="text-xs">Y Position (px)</Label>
            <Input
              id="zone-y"
              type="number"
              value={properties.y}
              onChange={(e) => handlePropertyChange('y', e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="zone-width" className="text-xs">Width (px)</Label>
            <Input
              id="zone-width"
              type="number"
              value={properties.width}
              onChange={(e) => handlePropertyChange('width', e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="zone-height" className="text-xs">Height (px)</Label>
            <Input
              id="zone-height"
              type="number"
              value={properties.height}
              onChange={(e) => handlePropertyChange('height', e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Physical Dimensions */}
        {physicalDims && (
          <div className="p-3 bg-gray-50 rounded text-xs">
            <div className="font-medium mb-2">Physical Dimensions:</div>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              <div>X: {physicalDims.x} {physicalDims.units}</div>
              <div>Y: {physicalDims.y} {physicalDims.units}</div>
              <div>W: {physicalDims.width} {physicalDims.units}</div>
              <div>H: {physicalDims.height} {physicalDims.units}</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" onClick={onZoneSave} className="flex-1">
            <Save className="h-3 w-3 mr-1" />
            Save
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

export default ZonePropertiesPanel;
