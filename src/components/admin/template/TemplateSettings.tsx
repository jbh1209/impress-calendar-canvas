
import { useState } from "react";
import { toast } from "sonner";
import TemplateDetailsSection from "./TemplateDetailsSection";
import TemplateDimensionsSection from "./TemplateDimensionsSection";
import TemplateBleedSection from "./TemplateBleedSection";
import TemplateStatusAndCategorySection from "./TemplateStatusAndCategorySection";
import { saveTemplate } from "@/services/templateService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
      {/* Header */}
      <div className="border-b border-gray-200 p-6 bg-white">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">
          {template.name || "New Template"}
        </h1>
        <p className="text-sm text-gray-500">
          Configure template settings and properties
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <form onSubmit={handleSaveTemplate} className="space-y-6">
            {/* Save Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSaving || isLoading}
            >
              {isSaving || isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving Template...
                </>
              ) : (
                "Save Template"
              )}
            </Button>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
                {errorMsg}
              </div>
            )}

            {/* Template Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Template Details</CardTitle>
                <CardDescription>Basic information about the template</CardDescription>
              </CardHeader>
              <CardContent>
                <TemplateDetailsSection template={template} setTemplate={setTemplate} />
              </CardContent>
            </Card>

            {/* Status & Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status & Category</CardTitle>
                <CardDescription>Visibility and categorization settings</CardDescription>
              </CardHeader>
              <CardContent>
                <TemplateStatusAndCategorySection template={template} setTemplate={setTemplate} />
              </CardContent>
            </Card>

            {/* Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dimensions</CardTitle>
                <CardDescription>Page size and measurement units</CardDescription>
              </CardHeader>
              <CardContent>
                <TemplateDimensionsSection
                  template={template}
                  setTemplate={setTemplate}
                  units={units}
                  setUnits={handleUnitChange}
                />
              </CardContent>
            </Card>

            {/* Bleed Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bleed Settings</CardTitle>
                <CardDescription>Print margin settings</CardDescription>
              </CardHeader>
              <CardContent>
                <TemplateBleedSection
                  bleed={template.bleed || bleed}
                  setBleed={b => setTemplate({ ...template, bleed: b })}
                  units={units}
                  setUnits={handleUnitChange}
                />
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
