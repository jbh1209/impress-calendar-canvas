import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { TemplatePage } from "@/services/types/templateTypes";

interface BleedSettings {
  top: number;
  right: number;
  bottom: number;
  left: number;
  units: string;
}

interface Template {
  id?: string;
  name: string;
  description: string;
  category: string;
  dimensions: string;
  is_active: boolean;
  bleed_settings: BleedSettings;
  original_pdf_url?: string;
  pdf_metadata?: any;
}

export const useTemplateData = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [template, setTemplate] = useState<Template>({
    name: "",
    description: "",
    category: "calendar",
    dimensions: "210x297mm",
    is_active: false,
    bleed_settings: {
      top: 3,
      right: 3,
      bottom: 3,
      left: 3,
      units: "mm"
    }
  });
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const isCreateMode = !id || id === 'create';
  const currentPage = pages[currentPageIndex];

  useEffect(() => {
    if (id && id !== 'create') {
      loadTemplate(id);
      loadPages(id);
    }
  }, [id]);

  const loadTemplate = async (templateId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error('Template not found');
        return;
      }

      const defaultBleedSettings: BleedSettings = {
        top: 3,
        right: 3,
        bottom: 3,
        left: 3,
        units: "mm"
      };

      let bleedSettings: BleedSettings = defaultBleedSettings;
      
      if (data.bleed_settings && typeof data.bleed_settings === 'object' && data.bleed_settings !== null) {
        const settings = data.bleed_settings as any;
        bleedSettings = {
          top: typeof settings.top === 'number' ? settings.top : 3,
          right: typeof settings.right === 'number' ? settings.right : 3,
          bottom: typeof settings.bottom === 'number' ? settings.bottom : 3,
          left: typeof settings.left === 'number' ? settings.left : 3,
          units: typeof settings.units === 'string' ? settings.units : "mm"
        };
      }

      setTemplate({
        id: data.id,
        name: data.name,
        description: data.description || "",
        category: data.category,
        dimensions: data.dimensions || "210x297mm",
        is_active: data.is_active,
        bleed_settings: bleedSettings,
        original_pdf_url: data.original_pdf_url,
        pdf_metadata: data.pdf_metadata
      });
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Failed to load template');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPages = async (templateId: string) => {
    try {
      const { data, error } = await supabase
        .from('template_pages')
        .select('*')
        .eq('template_id', templateId)
        .order('page_number');

      if (error) throw error;
      
      // Use the data directly as it already matches the TemplatePage type from templateTypes.ts
      setPages((data as TemplatePage[]) || []);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('Failed to load template pages');
    }
  };

  const saveTemplate = async () => {
    if (!template.name.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error("You must be logged in to save templates");
        return;
      }

      const templateData = {
        name: template.name.trim(),
        description: template.description.trim() || null,
        category: template.category,
        dimensions: template.dimensions,
        is_active: template.is_active,
        bleed_settings: template.bleed_settings as any,
        created_by: user.id
      };

      let result;
      if (isCreateMode) {
        result = await supabase
          .from('templates')
          .insert([templateData])
          .select()
          .single();
      } else {
        result = await supabase
          .from('templates')
          .update(templateData)
          .eq('id', template.id!)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast.success(isCreateMode ? "Template created successfully!" : "Template updated successfully!");
      
      if (isCreateMode && result.data) {
        setTemplate(prev => ({ ...prev, id: result.data.id }));
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    template,
    setTemplate,
    pages,
    setPages,
    currentPageIndex,
    setCurrentPageIndex,
    currentPage,
    isCreateMode,
    isLoading,
    saveTemplate,
    loadPages
  };
};
