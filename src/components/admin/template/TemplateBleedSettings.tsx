
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface BleedData {
  bleedTop: string;
  bleedRight: string;
  bleedBottom: string;
  bleedLeft: string;
  bleedUnits: string;
}

interface TemplateBleedSettingsProps {
  formData: BleedData;
  onUpdate: (updates: Partial<BleedData>) => void;
}

const TemplateBleedSettings: React.FC<TemplateBleedSettingsProps> = ({
  formData,
  onUpdate
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Bleed Settings
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Extra area beyond page edges for printing. Standard is 0.125 inches.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <Label className="text-xs">Top</Label>
            <Input
              type="number"
              min="0"
              step="0.001"
              value={formData.bleedTop}
              onChange={(e) => onUpdate({ bleedTop: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Right</Label>
            <Input
              type="number"
              min="0"
              step="0.001"
              value={formData.bleedRight}
              onChange={(e) => onUpdate({ bleedRight: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Bottom</Label>
            <Input
              type="number"
              min="0"
              step="0.001"
              value={formData.bleedBottom}
              onChange={(e) => onUpdate({ bleedBottom: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Left</Label>
            <Input
              type="number"
              min="0"
              step="0.001"
              value={formData.bleedLeft}
              onChange={(e) => onUpdate({ bleedLeft: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Bleed Units</Label>
          <Select
            value={formData.bleedUnits}
            onValueChange={(value) => onUpdate({ bleedUnits: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in">inches</SelectItem>
              <SelectItem value="mm">millimeters</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateBleedSettings;
