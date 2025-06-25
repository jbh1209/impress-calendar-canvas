
import { useState } from "react";
import { toast } from "sonner";
import TemplateDetailsSection from "./TemplateDetailsSection";
import TemplateDimensionsSection from "./TemplateDimensionsSection";
import TemplateBleedSection from "./TemplateBleedSection";
import TemplateStatusAndCategorySection from "./TemplateStatusAndCategorySection";
import SectionPanel from "./SectionPanel";
import { saveTemplate } from "@/services/templateService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    
    console.log("[TemplateSettings] Starting save with template:", template);
    
    const validationErr = validateTemplate(template);
    setErrorMsg(validationErr || null);
    if (validationErr) {
      toast.error(validationErr);
      return;
    }

    setIsSaving(true);
    try {
      // Prepare template data for saving (exclude UI-only fields)
      const templateToSave = {
        ...template,
        id: templateId,
      };
      
      console.log("[TemplateSettings] Saving template:", templateToSave);
      
      const result = await saveTemplate(templateToSave);
      if (result) {
        console.log("[TemplateSettings] Save successful:", result);
        // Set template ID for new templates
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
    <Card className="h-fit sticky top-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold">
          {template.name || "New Template"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSaveTemplate} autoComplete="off">
          {/* Save Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSaving || isLoading}
          >
            {isSaving || isLoading ? (
              <>
                <svg className="mr-2 animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path d="M12 2a10 10 0 1 1-8.246 4.905" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
                Saving...
              </>
            ) : (
              "Save Template"
            )}
          </Button>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">
              {errorMsg}
            </div>
          )}

          <div className="space-y-6">
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
      </CardContent>
    </Card>
  );
}
