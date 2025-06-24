
// Core template CRUD with clean data mapping and proper error handling

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Template, TemplateRow } from "./types/templateTypes";
import { transformUIToDatabase, transformDatabaseToUI, UITemplateState } from "./utils/templateDataTransformer";

/**
 * Get template by ID ONLY
 */
export const getTemplateById = async (id: string): Promise<Template | null> => {
  try {
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (templateError) {
      console.error('Error fetching template:', templateError);
      toast.error('Failed to load template');
      return null;
    }
    if (!template) return null;

    return template as TemplateRow;
  } catch (error) {
    console.error('Unexpected error fetching template:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
};

export const getAllTemplates = async (): Promise<TemplateRow[]> => {
  try {
    const { data: templates, error } = await supabase
      .from("templates")
      .select("*")
      .order("name", { ascending: true });
    if (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
      return [];
    }
    return (templates as TemplateRow[]) || [];
  } catch (error) {
    console.error("Unexpected error fetching templates:", error);
    toast.error("An unexpected error occurred");
    return [];
  }
};

/**
 * Save a template with clean data mapping
 */
export const saveTemplate = async (
  uiTemplate: UITemplateState & { id?: string }
): Promise<Template | null> => {
  try {
    console.log("[saveTemplate] Input UI template:", uiTemplate);

    // Check authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.id) {
      console.error("[saveTemplate] Auth error:", authError);
      toast.error("You must be logged in to save a template.");
      return null;
    }

    // Validate required fields
    if (!uiTemplate.name?.trim()) {
      toast.error("Template name is required.");
      return null;
    }

    if (!uiTemplate.dimensions?.trim()) {
      toast.error("Template dimensions are required.");
      return null;
    }

    const isNewTemplate = !uiTemplate.id;

    // Transform UI data to database format
    const dbData = transformUIToDatabase(uiTemplate);
    
    // Add created_by for new templates
    if (isNewTemplate) {
      (dbData as any).created_by = user.id;
    }

    console.log("[saveTemplate] Database data to save:", dbData);

    let templateResult;
    if (isNewTemplate) {
      templateResult = await supabase
        .from("templates")
        .insert([dbData])
        .select()
        .maybeSingle();
    } else {
      templateResult = await supabase
        .from("templates")
        .update(dbData)
        .eq("id", uiTemplate.id!)
        .select()
        .maybeSingle();
    }

    const { data, error } = templateResult;

    if (error) {
      console.error("[saveTemplate] Database error:", error);
      toast.error(`Failed to save template: ${error.message}`);
      return null;
    }

    if (!data) {
      console.error("[saveTemplate] No data returned after save");
      toast.error("No data returned after saving template");
      return null;
    }

    console.log("[saveTemplate] Successfully saved:", data);
    toast.success(isNewTemplate ? "Template created successfully!" : "Template updated successfully!");
    return data as Template;
  } catch (error) {
    console.error("[saveTemplate] Unexpected error:", error);
    toast.error("An unexpected error occurred while saving");
    return null;
  }
};

export const deleteTemplate = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
      return false;
    }
    return true;
  } catch (err) {
    console.error("Unexpected error deleting template:", err);
    toast.error("An unexpected error occurred");
    return false;
  }
};

export const exportTemplateAsJson = async (id: string): Promise<string | null> => {
  try {
    const template = await getTemplateById(id);
    if (!template) {
      toast.error("Template not found");
      return null;
    }
    return JSON.stringify(template, null, 2);
  } catch (error) {
    console.error("Error exporting template:", error);
    toast.error("Failed to export template");
    return null;
  }
};

export type { Template, CustomizationZone } from "./types/templateTypes";
