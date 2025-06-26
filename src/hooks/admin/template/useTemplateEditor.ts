
// Clean template editor hook with separated UI and database state

import { useState, useEffect } from "react";
import { getTemplateById } from "@/services/templateService";
import { transformDatabaseToUI, UITemplateState } from "@/services/utils/templateDataTransformer";

const DEFAULT_TEMPLATE: UITemplateState = {
  name: "",
  description: "",
  category: "Corporate",
  isActive: false,
  dimensions: "297x210",
  units: "mm",
  bleed: { top: 3, right: 3, bottom: 3, left: 3, units: "mm" },
};

export type TemplateEditorMode = "create" | "edit";

export function useTemplateEditor(templateIdFromParams?: string | null) {
  const [mode, setMode] = useState<TemplateEditorMode>(!templateIdFromParams ? "create" : "edit");
  const [isLoading, setIsLoading] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(templateIdFromParams || null);

  // UI state for the form (includes UI-only fields like units, bleed)
  const [template, setTemplate] = useState<UITemplateState>({ ...DEFAULT_TEMPLATE });

  // Database data for edit mode only
  const [templateData, setTemplateData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!templateIdFromParams) {
      console.log("[useTemplateEditor] Create mode - no template ID provided");
      setMode("create");
      setIsLoading(false);
      setTemplate({ ...DEFAULT_TEMPLATE });
      setTemplateData(null);
      setTemplateId(null);
      return;
    }

    // Validate that the templateId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(templateIdFromParams)) {
      console.error("[useTemplateEditor] Invalid UUID format:", templateIdFromParams);
      setErrorMsg("Invalid template ID format.");
      setIsLoading(false);
      return;
    }

    // Edit mode: fetch the template and transform to UI format
    console.log("[useTemplateEditor] Edit mode - loading template:", templateIdFromParams);
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
          // Add UI-only fields with defaults in mm
          units: "mm",
          bleed: { top: 3, right: 3, bottom: 3, left: 3, units: "mm" },
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
