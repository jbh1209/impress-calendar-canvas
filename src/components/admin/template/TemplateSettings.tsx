import { useState } from "react";
import { toast } from "sonner";
import TemplateSettingsPanelFrame from "./TemplateSettingsPanelFrame";
import TemplateDetailsSection from "./TemplateDetailsSection";
import TemplateDimensionsSection from "./TemplateDimensionsSection";
import TemplateBleedSection from "./TemplateBleedSection";
import TemplateStatusAndCategorySection from "./TemplateStatusAndCategorySection";
import SectionPanel from "./SectionPanel";

const DEFAULT_BLEED = { top: 0.125, right: 0.125, bottom: 0.125, left: 0.125, units: "in" };

export default function TemplateSettings({
  template,
  setTemplate,
  isLoading = false,
  templateId,
  setTemplateId
}) {
  // Responsive units state lives here, but can be refactored to context if needed.
  const [units, setUnits] = useState(template.units || "in");
  const [bleed, setBleed] = useState(template.bleed || { ...DEFAULT_BLEED });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Apply units to template and bleed
  function handleUnitChange(u: string) {
    setUnits(u);
    setBleed({ ...bleed, units: u });
    setTemplate({ ...template, units: u, bleed: { ...bleed, units: u } });
    toast("Unit updated: " + u);
  }

  function validateTemplate(tmpl) {
    if (!tmpl.name?.trim()) return "Template name is required.";
    if (!tmpl.dimensions?.trim()) return "Dimensions are required.";
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
      // NOTE: saveTemplate must be imported from your service layer!
      const { saveTemplate } = await import("@/services/templateService");
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

  // Main stylish professional layout: full-width, breathable, grouped panels
  return (
    <TemplateSettingsPanelFrame>
      <form className="w-full flex flex-col gap-8" onSubmit={handleSaveTemplate} autoComplete="off">
        {/* Fixed sticky save header */}
        <div className="flex items-center gap-2 justify-between sticky top-0 z-20 bg-white/95 backdrop-blur-xl rounded-2xl px-3 py-3 mb-2 border-b shadow-sm transition">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight truncate">
            {template.name || "Untitled Template"}
          </h1>
          <button
            type="submit"
            className="gold-button flex gap-2 items-center"
            disabled={isSaving || isLoading}
          >
            {isSaving || isLoading ? (
              <svg className="mr-1 animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path d="M12 2a10 10 0 1 1-8.246 4.905" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            ) : (
              <span className="font-medium">Save</span>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-2 mb-2 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-8">
          <SectionPanel
            title="Template Details"
            description="Name your template and optionally provide a description for users."
          >
            <TemplateDetailsSection template={template} setTemplate={setTemplate} />
          </SectionPanel>

          <SectionPanel
            title="Visibility & Category"
            description="Control whether your template appears to customers and assign a suitable category."
          >
            <TemplateStatusAndCategorySection template={template} setTemplate={setTemplate} />
          </SectionPanel>

          <SectionPanel
            title="Page Dimensions"
            description="Set the printable area, choose a preset, and update units used for measurements (excluding bleed)."
          >
            <TemplateDimensionsSection
              template={template}
              setTemplate={setTemplate}
              units={units}
              setUnits={handleUnitChange}
            />
          </SectionPanel>

          <SectionPanel
            title="Bleed Settings"
            description="Adjust the print bleed for all edges. This prevents unprinted edges."
          >
            <TemplateBleedSection
              bleed={template.bleed || bleed}
              setBleed={b => setTemplate({ ...template, bleed: b })}
              units={units}
              setUnits={handleUnitChange}
            />
          </SectionPanel>
        </div>
      </form>
    </TemplateSettingsPanelFrame>
  );
}
