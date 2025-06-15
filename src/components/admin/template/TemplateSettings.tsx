
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

// Preset sizes (in inches)
const DIM_PRESETS = [
  { label: `Letter - Portrait (8.5" x 11")`, value: "8.5x11", width: 8.5, height: 11, units: "in" },
  { label: `Letter - Landscape (11" x 8.5")`, value: "11x8.5", width: 11, height: 8.5, units: "in" },
  { label: `Square (12" x 12")`, value: "12x12", width: 12, height: 12, units: "in" },
  { label: `Poster (11" x 14")`, value: "11x14", width: 11, height: 14, units: "in" },
];

const DEFAULT_BLEED = { top: 0.125, right: 0.125, bottom: 0.125, left: 0.125, units: "in" };

function parseDims(dimStr: string) {
  const m = /^([0-9.]+)x([0-9.]+)$/.exec(dimStr);
  if (!m) return null;
  return { width: parseFloat(m[1]), height: parseFloat(m[2]), units: "in" };
}

export default function TemplateSettings({ template, setTemplate }) {
  const [activeTab, setActiveTab] = useState("general");
  const [units, setUnits] = useState(template.units || "in");
  const dims = parseDims(template.dimensions) || { width: 11, height: 8.5, units };
  const bleed = template.bleed || { ...DEFAULT_BLEED };

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
  function handleBleed(field, v) {
    const n = Math.max(0, parseFloat(v) || 0);
    setTemplate({ ...template, bleed: { ...bleed, [field]: n, units } });
  }
  function handleUnitChange(u) {
    setUnits(u);
    setTemplate({
      ...template,
      units: u,
      // Bust out current dims into new units if needed (no conversion here, assume user will set values as needed)
    });
    toast("Unit updated: " + u);
  }

  return (
    <Card className="shadow-lg border-muted animate-fade-in">
      <CardContent className="p-6">
        <form className="space-y-8">
          {/* General Info */}
          <section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">General</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name" className="font-medium">Template Name <span className="text-red-500">*</span></Label>
                <Input
                  id="template-name"
                  value={template.name}
                  onChange={e => setTemplate({ ...template, name: e.target.value })}
                  maxLength={60}
                  className="mt-1"
                  placeholder="e.g. Modern Wall Calendar"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description" className="font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={template.description}
                  onChange={e => setTemplate({ ...template, description: e.target.value })}
                  placeholder="Describe your template (optional)"
                  className="mt-1 min-h-[80px]"
                  maxLength={250}
                />
              </div>
            </div>
          </section>
          {/* Category & Status */}
          <section className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="category" className="font-medium">Category</Label>
              <Select
                value={template.category}
                onValueChange={value => setTemplate({ ...template, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Nature">Nature</SelectItem>
                  <SelectItem value="Seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="active-status" className="font-medium">Active</Label>
              <div className="flex items-center gap-3">
                <Switch
                  id="active-status"
                  checked={template.isActive}
                  onCheckedChange={checked => setTemplate({ ...template, isActive: checked })}
                />
                <span className="text-muted-foreground text-xs">Visible to customers</span>
              </div>
            </div>
          </section>
          {/* Dimensions Section */}
          <section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Dimensions</h2>
            </div>
            <div className="space-y-3">
              <Label className="font-medium">Preset Sizes</Label>
              <Select value={DIM_PRESETS.find(p => p.value === template.dimensions)?.value || ""} onValueChange={handlePreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a preset..." />
                </SelectTrigger>
                <SelectContent>
                  {DIM_PRESETS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-end gap-3">
                <div>
                  <Label htmlFor="custom-width" className="font-medium">Width</Label>
                  <Input
                    id="custom-width"
                    type="number"
                    min={1}
                    step={0.01}
                    value={dims.width}
                    onChange={e => handleCustomDims("width", e.target.value)}
                    className="mt-1 w-24"
                  />
                </div>
                <span className="pb-2"> x </span>
                <div>
                  <Label htmlFor="custom-height" className="font-medium">Height</Label>
                  <Input
                    id="custom-height"
                    type="number"
                    min={1}
                    step={0.01}
                    value={dims.height}
                    onChange={e => handleCustomDims("height", e.target.value)}
                    className="mt-1 w-24"
                  />
                </div>
                <div>
                  <Label htmlFor="units" className="font-medium">Unit</Label>
                  <Select value={units} onValueChange={handleUnitChange}>
                    <SelectTrigger id="units" className="w-16">
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
          {/* Bleed Section */}
          <section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Bleed</h2>
              <span className="text-xs text-muted-foreground">(Printed edge cutoff)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["top", "right", "bottom", "left"].map(side => (
                <div key={side}>
                  <Label htmlFor={`bleed-${side}`} className="font-medium capitalize">{side}</Label>
                  <Input
                    id={`bleed-${side}`}
                    type="number"
                    value={bleed[side]}
                    min={0}
                    step={0.001}
                    onChange={e => handleBleed(side, e.target.value)}
                    className="mt-1 w-20"
                  />
                </div>
              ))}
              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="bleed-units" className="font-medium">Unit</Label>
                <Select value={bleed.units || units} onValueChange={handleUnitChange}>
                  <SelectTrigger id="bleed-units" className="w-16">
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
        </form>
      </CardContent>
    </Card>
  );
}
