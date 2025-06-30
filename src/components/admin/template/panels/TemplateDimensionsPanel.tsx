
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UITemplateState {
  name: string;
  description: string;
  category: string;
  dimensions: string;
  is_active: boolean;
  customWidth: number;
  customHeight: number;
  units: string;
}

interface TemplateDimensionsPanelProps {
  template: UITemplateState;
  setTemplate: React.Dispatch<React.SetStateAction<UITemplateState>>;
}

const TemplateDimensionsPanel: React.FC<TemplateDimensionsPanelProps> = ({
  template,
  setTemplate
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Dimensions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Width</Label>
            <Input
              type="number"
              value={template.customWidth}
              onChange={(e) => setTemplate(prev => ({...prev, customWidth: parseFloat(e.target.value) || 0}))}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">Height</Label>
            <Input
              type="number"
              value={template.customHeight}
              onChange={(e) => setTemplate(prev => ({...prev, customHeight: parseFloat(e.target.value) || 0}))}
              className="text-sm"
            />
          </div>
        </div>
        
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Units</Label>
          <Select
            value={template.units}
            onValueChange={(value) => setTemplate(prev => ({...prev, units: value}))}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mm">mm</SelectItem>
              <SelectItem value="in">in</SelectItem>
              <SelectItem value="pt">pt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateDimensionsPanel;
