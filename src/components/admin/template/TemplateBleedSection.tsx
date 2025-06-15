
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Info } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function TemplateBleedSection({ bleed, setBleed, units, setUnits }) {
  function handleBleed(field, v) {
    const n = Math.max(0, parseFloat(v) || 0);
    setBleed({ ...bleed, [field]: n, units });
  }
  function handleBleedUnitChange(u) {
    setUnits(u);
    setBleed({ ...bleed, units: u });
  }
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Bleed Settings</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent side="top" align="center" className="max-w-xs">
              <span>“Bleed” is extra area beyond the page edges for backgrounds/images that go to the paper’s edge. Standard is 0.125in.</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {["top", "right", "bottom", "left"].map(side => (
          <div key={side}>
            <Label htmlFor={`bleed-${side}`} className="font-semibold text-base capitalize mb-1 inline-block">{side}</Label>
            <Input
              id={`bleed-${side}`}
              type="number"
              value={bleed[side]}
              min={0}
              step={0.001}
              onChange={e => handleBleed(side, e.target.value)}
              className="bg-white border border-gray-200 rounded-lg w-20 h-10 text-base"
            />
          </div>
        ))}
        <div className="col-span-2 md:col-span-1">
          <Label htmlFor="bleed-units" className="font-semibold text-base mb-1 inline-block">Unit</Label>
          <Select value={bleed.units || units} onValueChange={handleBleedUnitChange}>
            <SelectTrigger id="bleed-units" className="bg-white border border-gray-200 rounded-lg w-16 h-10 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in">in</SelectItem>
              <SelectItem value="mm">mm</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
