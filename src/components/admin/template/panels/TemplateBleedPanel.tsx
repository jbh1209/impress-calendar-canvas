
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, ChevronDown } from "lucide-react";

interface BleedSettings {
  top: number;
  right: number;
  bottom: number;
  left: number;
  units: string;
}

interface TemplateBleedPanelProps {
  bleed: BleedSettings;
  setBleed: React.Dispatch<React.SetStateAction<BleedSettings>>;
  isBleedOpen: boolean;
  setIsBleedOpen: (open: boolean) => void;
}

const TemplateBleedPanel: React.FC<TemplateBleedPanelProps> = ({
  bleed,
  setBleed,
  isBleedOpen,
  setIsBleedOpen
}) => {
  const handleBleedChange = (field: keyof BleedSettings, value: string) => {
    const numValue = Math.max(0, parseFloat(value) || 0);
    setBleed(prev => ({ ...prev, [field]: numValue }));
  };

  return (
    <Card>
      <Collapsible open={isBleedOpen} onOpenChange={setIsBleedOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Bleed Settings
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isBleedOpen ? 'transform rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {['top', 'right', 'bottom', 'left'].map((side) => (
                <div key={side}>
                  <Label className="text-xs text-gray-600 mb-1 block capitalize">
                    {side}
                  </Label>
                  <Input
                    type="number"
                    value={bleed[side as keyof BleedSettings]}
                    onChange={(e) => handleBleedChange(side as keyof BleedSettings, e.target.value)}
                    min={0}
                    step={0.1}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
            
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Units</Label>
              <Select
                value={bleed.units}
                onValueChange={(value) => setBleed(prev => ({...prev, units: value}))}
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
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default TemplateBleedPanel;
