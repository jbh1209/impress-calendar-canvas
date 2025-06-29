
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface DimensionData {
  customWidth: string;
  customHeight: string;
  units: string;
  dimensions: string;
}

interface TemplateDimensionsProps {
  formData: DimensionData;
  onUpdate: (updates: Partial<DimensionData>) => void;
}

const DIMENSION_PRESETS = [
  { label: "Letter (8.5 x 11 in)", value: "letter", width: "8.5", height: "11", units: "in" },
  { label: "A4 (210 x 297 mm)", value: "a4", width: "210", height: "297", units: "mm" },
  { label: "Square (12 x 12 in)", value: "square", width: "12", height: "12", units: "in" },
  { label: "Poster (18 x 24 in)", value: "poster", width: "18", height: "24", units: "in" },
  { label: "Custom", value: "custom", width: "", height: "", units: "in" }
];

const TemplateDimensions: React.FC<TemplateDimensionsProps> = ({
  formData,
  onUpdate
}) => {
  const handlePresetChange = (presetValue: string) => {
    const preset = DIMENSION_PRESETS.find(p => p.value === presetValue);
    if (preset) {
      onUpdate({
        dimensions: presetValue,
        customWidth: preset.width,
        customHeight: preset.height,
        units: preset.units
      });
    }
  };

  const getDimensionsString = () => {
    if (!formData.customWidth || !formData.customHeight) return '';
    return `${formData.customWidth}x${formData.customHeight}${formData.units}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Dimensions & Size
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose a preset size or enter custom dimensions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Size Preset</Label>
          <Select
            value={formData.dimensions}
            onValueChange={handlePresetChange}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIMENSION_PRESETS.map(preset => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Dimensions</Label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-gray-500">Width</Label>
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={formData.customWidth}
                onChange={(e) => onUpdate({ 
                  customWidth: e.target.value,
                  dimensions: 'custom' 
                })}
                placeholder="8.5"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Height</Label>
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={formData.customHeight}
                onChange={(e) => onUpdate({ 
                  customHeight: e.target.value,
                  dimensions: 'custom'
                })}
                placeholder="11"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Units</Label>
              <Select
                value={formData.units}
                onValueChange={(value) => onUpdate({ 
                  units: value,
                  dimensions: 'custom'
                })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">in</SelectItem>
                  <SelectItem value="mm">mm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
            Current: {getDimensionsString() || 'Not set'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateDimensions;
