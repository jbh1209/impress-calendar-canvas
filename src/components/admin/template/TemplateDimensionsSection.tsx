
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Info } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const DIM_PRESETS = [
  { label: `Letter (8.5" x 11")`, value: "8.5x11", width: 8.5, height: 11, units: "in" },
  { label: `A4 (210 x 297mm)`, value: "210x297", width: 210, height: 297, units: "mm" },
  { label: `Square (12" x 12")`, value: "12x12", width: 12, height: 12, units: "in" },
  { label: `Poster (11" x 14")`, value: "11x14", width: 11, height: 14, units: "in" },
];

function parseDims(dimStr: string) {
  const m = /^([0-9.]+)x([0-9.]+)$/.exec(dimStr);
  if (!m) return null;
  return { width: parseFloat(m[1]), height: parseFloat(m[2]) };
}

export default function TemplateDimensionsSection({ template, setTemplate, units, setUnits }) {
  const dims = parseDims(template.dimensions) || { width: 11, height: 8.5 };

  function handlePreset(value: string) {
    const p = DIM_PRESETS.find((d) => d.value === value);
    if (p) {
      setTemplate({ ...template, dimensions: p.value, units: p.units });
      setUnits(p.units);
    }
  }
  function handleCustomDims(field, v) {
    const newValue = Math.max(0, parseFloat(v) || 0);
    const other = field === "width" ? dims.height : dims.width;
    const stringDims =
      field === "width"
        ? `${newValue}x${other}`
        : `${other}x${newValue}`;
    setTemplate({ ...template, dimensions: stringDims, units });
  }
  function handleUnitChange(u) {
    setUnits(u);
    setTemplate({ ...template, units: u });
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-semibold text-gray-900">Page Dimensions</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent side="top" align="center" className="max-w-xs">
              <span>Choose a preset or enter custom width/height for your printable area (excluding bleed). Changing units auto-converts if feasible.</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-5">
        <div className="flex-1">
          <Label className="font-semibold text-base mb-1 inline-block">Preset Sizes</Label>
          <Select value={DIM_PRESETS.find(p => p.value === template.dimensions)?.value || ""} onValueChange={handlePreset}>
            <SelectTrigger className="bg-white border border-gray-200 rounded-lg h-12 text-base">
              <SelectValue placeholder="Select a preset..." />
            </SelectTrigger>
            <SelectContent>
              {DIM_PRESETS.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-2xl font-light hidden md:block">|</span>
        <div className="flex gap-2 items-end">
          <div>
            <Label htmlFor="custom-width" className="font-semibold text-base mb-1 inline-block">Width</Label>
            <Input
              id="custom-width"
              type="number"
              min={1}
              step={0.01}
              value={dims.width}
              onChange={e => handleCustomDims("width", e.target.value)}
              className="bg-white border border-gray-200 rounded-lg w-24 h-10 text-base"
            />
          </div>
          <span className="text-lg pb-2">×</span>
          <div>
            <Label htmlFor="custom-height" className="font-semibold text-base mb-1 inline-block">Height</Label>
            <Input
              id="custom-height"
              type="number"
              min={1}
              step={0.01}
              value={dims.height}
              onChange={e => handleCustomDims("height", e.target.value)}
              className="bg-white border border-gray-200 rounded-lg w-24 h-10 text-base"
            />
          </div>
          <div>
            <Label htmlFor="units" className="font-semibold text-base mb-1 inline-block">Unit</Label>
            <Select value={units} onValueChange={handleUnitChange}>
              <SelectTrigger id="units" className="bg-white border border-gray-200 rounded-lg w-16 h-10 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">in</SelectItem>
                <SelectItem value="mm">mm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </section>
  );
}
