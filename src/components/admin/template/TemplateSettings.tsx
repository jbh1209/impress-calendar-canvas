
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { saveTemplate } from "@/services/templateService";
import { Loader2, Save } from "lucide-react";

const DIM_PRESETS = [
  { label: `Letter (8.5" x 11")`, value: "8.5x11", width: 8.5, height: 11, units: "in" },
  { label: `A4 (210 x 297mm)`, value: "210x297", width: 210, height: 297, units: "mm" },
  { label: `Square (12" x 12")`, value: "12x12", width: 12, height: 12, units: "in" },
  { label: `Poster (11" x 14")`, value: "11x14", width: 11, height: 14, units: "in" },
];

const DEFAULT_BLEED = { top: 0.125, right: 0.125, bottom: 0.125, left: 0.125, units: "in" };

function parseDims(dimStr: string) {
  const m = /^([0-9.]+)x([0-9.]+)$/.exec(dimStr);
  if (!m) return null;
  return { width: parseFloat(m[1]), height: parseFloat(m[2]), units: "in" };
}

export default function TemplateSettings({ template, setTemplate, isLoading=false, templateId, setTemplateId }) {
  const [units, setUnits] = useState(template.units || "in");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    setTemplate({ ...template, units: u });
    toast("Unit updated: " + u);
  }

  function validateTemplate(template) {
    if (!template.name?.trim()) return "Template name is required.";
    if (!template.dimensions?.trim()) return "Dimensions are required.";
    // Could add more
    return null;
  }

  async function handleSaveTemplate(e) {
    e?.preventDefault?.();
    const validationErr = validateTemplate(template);
    setErrorMsg(validationErr || null);
    if (validationErr) {
      toast.error(validationErr);
      return;
    }
    setIsSaving(true);
    try {
      const result = await saveTemplate({ ...template, id: templateId });
      if (result) {
        toast.success("Template saved!");
        if (!templateId && setTemplateId) {
          setTemplateId(result.id);
        }
      } else {
        toast.error("Failed to save template.");
      }
    } catch (e) {
      toast.error("Error saving template.");
    }
    setIsSaving(false);
  }

  // UX: visually organized, max-w-3xl, white background, lots of vertical spacing
  return (
    <form
      className="w-full flex flex-col items-center"
      onSubmit={handleSaveTemplate}
      autoComplete="off"
    >
      {/* Modern sticky header bar */}
      <div className="w-full bg-white/80 border-b sticky top-0 z-20 flex items-center px-8 py-2 gap-4 shadow-sm mb-8" style={{ backdropFilter: "blur(6px)" }}>
        <h1 className="text-2xl md:text-3xl font-bold flex-1 truncate">{template.name || "Untitled Template"}</h1>
        <button
          type="submit"
          className="gold-button flex gap-2 items-center"
          disabled={isSaving || isLoading}
        >
          {isSaving || isLoading ? <Loader2 className="animate-spin" /> : <Save />}
          Save
        </button>
      </div>
      {/* Main form area, lots of whitespace */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-10 mb-20">
        {/* Error at top if exists */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-2 mb-2 text-sm text-center">
            {errorMsg}
          </div>
        )}
        {/* Template Details */}
        <section className="flex flex-col gap-4">
          <div>
            <Label htmlFor="template-name" className="font-semibold text-base text-gray-800 mb-1 inline-block">Template Name <span className="text-red-500">*</span></Label>
            <Input
              id="template-name"
              value={template.name}
              onChange={e => setTemplate({ ...template, name: e.target.value })}
              maxLength={60}
              placeholder="e.g. Modern Wall Calendar"
              className="h-12 bg-white border border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-primary text-base w-full"
              required
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="description" className="font-semibold text-base text-gray-800 mb-1 inline-block">Description</Label>
            <Textarea
              id="description"
              value={template.description}
              onChange={e => setTemplate({ ...template, description: e.target.value })}
              placeholder="Describe your template (optional)"
              maxLength={250}
              className="min-h-[80px] bg-white border border-gray-200 rounded-lg text-base focus-visible:ring-2 focus-visible:ring-primary w-full"
            />
          </div>
        </section>
        {/* Category and Active */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="category" className="font-semibold text-base text-gray-800 mb-1 inline-block">Category</Label>
            <Select
              value={template.category}
              onValueChange={value => setTemplate({ ...template, category: value })}
            >
              <SelectTrigger id="category" className="bg-white border border-gray-200 rounded-lg h-12 text-base" >
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
          <div>
            <Label htmlFor="active-status" className="font-semibold text-base text-gray-800 mb-1 inline-block">Active</Label>
            <div className="flex items-center gap-3 h-12">
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
          <h2 className="text-lg font-semibold mb-2 text-gray-900">Dimensions</h2>
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
        {/* Bleed Section */}
        <section>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Bleed Settings</h3>
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
              <Select value={bleed.units || units} onValueChange={handleUnitChange}>
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
        {/* Future: Progressive disclosure/advanced settings? */}
      </div>
    </form>
  );
}
