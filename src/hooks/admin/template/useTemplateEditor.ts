
// Clean template editor hook with separated UI and database state

import { useState, useEffect } from "react";
import { getTemplateById } from "@/services/templateService";
import { transformDatabaseToUI, UITemplateState } from "@/services/utils/templateDataTransformer";

const DEFAULT_TEMPLATE: UITemplateState = {
  name: "",
  description: "",
  category: "Corporate",
  isActive: false,
  dimensions: "11x8.5",
  units: "in",
  bleed: { top: 0.125, right: 0.125, bottom: 0.125, left: 0.125, units: "in" },
};

export type TemplateEditorMode = "create" | "edit";

export function useTemplateEditor(templateIdFromParams?: string | null) {
  const [mode, setMode] = useState<TemplateEditorMode>(templateIdFromParams ? "edit" : "create");
  const [isLoading, setIsLoading] = useState(!!templateIdFromParams);
  const [templateId, setTemplateId] = useState<string | null>(templateIdFromParams || null);

  // UI state for the form (includes UI-only fields like units, bleed)
  const [template, setTemplate] = useState<UITemplateState>({ ...DEFAULT_TEMPLATE });

  // Database data for edit mode only
  const [templateData, setTemplateData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!templateIdFromParams) {
      setMode("create");
      setIsLoading(false);
      setTemplate({ ...DEFAULT_TEMPLATE });
      setTemplateData(null);
      return;
    }

    // Edit mode: fetch the template and transform to UI format
    setIsLoading(true);
    getTemplateById(templateIdFromParams)
      .then((data) => {
        if (!data) {
          setErrorMsg("Template not found.");
          setIsLoading(false);
          return;
        }
        
        console.log("[useTemplateEditor] Loaded template data:", data);
        
        setMode("edit");
        setTemplateData(data);
        
        // Transform database format to UI format
        const uiTemplate = transformDatabaseToUI(data);
        setTemplate({
          ...uiTemplate,
          // Add UI-only fields with defaults
          units: "in",
          bleed: { top: 0.125, right: 0.125, bottom: 0.125, left: 0.125, units: "in" },
        });
        
        setTemplateId(data.id);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("[useTemplateEditor] Error loading template:", error);
        setErrorMsg("Failed to load template.");
        setIsLoading(false);
      });
  }, [templateIdFromParams]);

  return {
    mode,
    isLoading,
    setIsLoading,
    templateId,
    setTemplateId,
    template,
    setTemplate,
    templateData,
    errorMsg,
    setErrorMsg,
  };
}
