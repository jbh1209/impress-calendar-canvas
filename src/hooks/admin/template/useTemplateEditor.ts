
// Custom hook for handling template editor state & logic

import { useState, useEffect } from "react";
import { getTemplateById, saveTemplate } from "@/services/templateService";
import { getZonesByTemplateId, saveZones } from "@/services/templateZoneService";
import { getTemplatePages } from "@/services/templatePageService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const DEFAULT_TEMPLATE = {
  name: "Untitled Template",
  description: "",
  category: "Corporate",
  isActive: false,
  dimensions: "11x8.5",
};

export function useTemplateEditor(templateIdFromParams: string | null | undefined) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [templateId, setTemplateId] = useState<string | null>(templateIdFromParams || null);
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [templateData, setTemplateData] = useState<any>(null); // shape from DB
  const [pages, setPages] = useState([]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  // 1. Initial create/load
  useEffect(() => {
    const initOrLoadTemplate = async () => {
      setIsLoading(true);
      if (templateIdFromParams) {
        // Editing flow
        const data = await getTemplateById(templateIdFromParams);
        if (!data) {
          toast.error("Template not found");
          navigate("/admin/templates");
          return;
        }
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
      } else {
        // Creating flow: immediately create draft template
        try {
          const saved = await saveTemplate({ ...DEFAULT_TEMPLATE });
          if (!saved) throw new Error("Could not create draft template. Ensure you are logged in.");
          setTemplateData(saved);
          setTemplate({
            name: saved.name || DEFAULT_TEMPLATE.name,
            description: saved.description || "",
            category: saved.category || DEFAULT_TEMPLATE.category,
            isActive: saved.is_active,
            dimensions: saved.dimensions || DEFAULT_TEMPLATE.dimensions,
          });
          setTemplateId(saved.id);
        } catch (e: any) {
          toast.error("Could not create draft template: " + (e?.message || ""));
          navigate("/admin/templates");
        } finally {
          setIsLoading(false);
        }
      }
    };
    initOrLoadTemplate();
    // eslint-disable-next-line
  }, [templateIdFromParams]);

  // 2. Load pages
  useEffect(() => {
    if (!templateId) {
      setPages([]);
      setActivePageIndex(0);
      return;
    }
    const loadPages = async () => {
      setIsLoading(true);
      const results = await getTemplatePages(templateId);
      setPages(results);
      setIsLoading(false);
      setActivePageIndex(0);
    };
    loadPages();
  }, [templateId]);

  return {
    isLoading,
    setIsLoading,
    templateId,
    template,
    setTemplate,
    templateData,
    setTemplateData,
    pages,
    setPages,
    activePageIndex,
    setActivePageIndex,
  };
}

