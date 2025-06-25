
import { useState } from "react";
import { toast } from "sonner";
import TemplateDetailsSection from "./TemplateDetailsSection";
import TemplateDimensionsSection from "./TemplateDimensionsSection";
import TemplateBleedSection from "./TemplateBleedSection";
import TemplateStatusAndCategorySection from "./TemplateStatusAndCategorySection";
import SectionPanel from "./SectionPanel";
import { saveTemplate } from "@/services/templateService";
import { Button } from "@/components/ui/button";

const DEFAULT_BLEED = { top: 0.125, right: 0.125, bottom: 0.125, left: 0.125, units: "in" };

export default function TemplateSettings({
  template,
  setTemplate,
  isLoading = false,
  templateId,
  setTemplateId
}) {
  const [units, setUnits] = useState(template.units || "in");
  const [bleed, setBleed] = useState(template.bleed || { ...DEFAULT_BLEED });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      const templateToSave = {
        ...template,
        id: templateId,
      };
      
      const result = await saveTemplate(templateToSave);
      if (result) {
        if (!templateId && setTemplateId) {
          setTemplateId(result.id);
        }
      }
    } catch (error) {
      console.error("[TemplateSettings] Save error:", error);
      toast.error("Error saving template.");
    }
    setIsSaving(false);
  }

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <div className="border-b border-gray-200 p-3 bg-white">
        <h1 className="text-base font-semibold text-gray-900 truncate">
          {template.name || "New Template"}
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Template Configuration
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <form className="p-3 space-y-3" onSubmit={handleSaveTemplate} autoComplete="off">
          {/* Compact Save Button */}
          <Button
            type="submit"
            className="w-full h-8 text-xs"
            disabled={isSaving || isLoading}
          >
            {isSaving || isLoading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Saving...
              </>
            ) : (
              "Save Template"
            )}
          </Button>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded px-2 py-1.5 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3">
            <SectionPanel
              title="Details"
              description="Name and describe your template"
            >
              <TemplateDetailsSection template={template} setTemplate={setTemplate} />
            </SectionPanel>

            <SectionPanel
              title="Status & Category"
              description="Control visibility and categorization"
            >
              <TemplateStatusAndCategorySection template={template} setTemplate={setTemplate} />
            </SectionPanel>

            <SectionPanel
              title="Dimensions"
              description="Set page size and units"
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
              description="Configure print margins"
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
      </div>
    </div>
  );
}
