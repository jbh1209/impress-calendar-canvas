import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CoordinateSystem } from '@/utils/coordinateSystem';

interface PrintDimensions {
  width: number;
  height: number;
  unit: 'mm' | 'in' | 'pt';
}

interface ProfessionalDimensionsPanelProps {
  dimensions: PrintDimensions;
  onDimensionsChange: (dimensions: PrintDimensions) => void;
}

const STANDARD_SIZES = {
  'A4': { width: 210, height: 297, unit: 'mm' as const },
  'A3': { width: 297, height: 420, unit: 'mm' as const },
  'Letter': { width: 8.5, height: 11, unit: 'in' as const },
  'Legal': { width: 8.5, height: 14, unit: 'in' as const },
  'Tabloid': { width: 11, height: 17, unit: 'in' as const },
};

const ProfessionalDimensionsPanel: React.FC<ProfessionalDimensionsPanelProps> = ({
  dimensions,
  onDimensionsChange
}) => {
  const handlePresetChange = (preset: string) => {
    if (preset === 'custom') return;
    const size = STANDARD_SIZES[preset as keyof typeof STANDARD_SIZES];
    if (size) {
      onDimensionsChange(size);
    }
  };

  const handleUnitChange = (newUnit: 'mm' | 'in' | 'pt') => {
    const convertedWidth = CoordinateSystem.convertUnit(dimensions.width, dimensions.unit, newUnit);
    const convertedHeight = CoordinateSystem.convertUnit(dimensions.height, dimensions.unit, newUnit);
    
    onDimensionsChange({
      width: Math.round(convertedWidth * 100) / 100,
      height: Math.round(convertedHeight * 100) / 100,
      unit: newUnit
    });
  };

  const formatDimension = (value: number) => {
    return Math.round(value * 100) / 100;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Print Dimensions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Standard Sizes</Label>
          <Select onValueChange={handlePresetChange}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select preset or custom" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(STANDARD_SIZES).map(size => (
                <SelectItem key={size} value={size}>{size}</SelectItem>
              ))}
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Width</Label>
            <Input
              type="number"
              step="0.1"
              value={formatDimension(dimensions.width)}
              onChange={(e) => onDimensionsChange({
                ...dimensions,
                width: parseFloat(e.target.value) || 0
              })}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Height</Label>
            <Input
              type="number"
              step="0.1"
              value={formatDimension(dimensions.height)}
              onChange={(e) => onDimensionsChange({
                ...dimensions,
                height: parseFloat(e.target.value) || 0
              })}
              className="text-sm"
            />
          </div>
        </div>
        
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Units</Label>
          <Select value={dimensions.unit} onValueChange={handleUnitChange}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mm">Millimeters (mm)</SelectItem>
              <SelectItem value="in">Inches (in)</SelectItem>
              <SelectItem value="pt">Points (pt)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div>In points: {formatDimension(CoordinateSystem.convertUnit(dimensions.width, dimensions.unit, 'pt'))} × {formatDimension(CoordinateSystem.convertUnit(dimensions.height, dimensions.unit, 'pt'))} pt</div>
          <div>In mm: {formatDimension(CoordinateSystem.convertUnit(dimensions.width, dimensions.unit, 'mm'))} × {formatDimension(CoordinateSystem.convertUnit(dimensions.height, dimensions.unit, 'mm'))} mm</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalDimensionsPanel;