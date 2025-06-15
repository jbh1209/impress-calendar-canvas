
// Purely handles UI state for creating or editing templates.
// NO side-effect (DB) calls for new templates until user saves.

import { useState, useEffect } from "react";
import { getTemplateById } from "@/services/templateService";

const DEFAULT_TEMPLATE = {
  name: "",
  description: "",
  category: "Corporate",
  isActive: false,
  dimensions: "11x8.5",
};

export type TemplateEditorMode = "create" | "edit";

export function useTemplateEditor(templateIdFromParams?: string | null) {
  const [mode, setMode] = useState<TemplateEditorMode>(templateIdFromParams ? "edit" : "create");
  const [isLoading, setIsLoading] = useState(!!templateIdFromParams);
  const [templateId, setTemplateId] = useState<string | null>(templateIdFromParams || null);

  // Unified form state for changes BEFORE save
  const [template, setTemplate] = useState({
    ...DEFAULT_TEMPLATE,
  });

  // Holds original DB row for edit mode only
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
    // Edit mode: fetch the row and initialize
    setIsLoading(true);
    getTemplateById(templateIdFromParams)
      .then((data) => {
        if (!data) {
          setErrorMsg("Template not found.");
          setIsLoading(false);
          return;
        }
        setMode("edit");
        setTemplateData(data);
        setTemplate({
          name: data.name,
          description: data.description || "",
          category: data.category,
          isActive: data.is_active,
          dimensions: data.dimensions || "11x8.5",
        });
        setTemplateId(data.id);
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

