
// Core template CRUD (get/save/delete/export), NO zone/product logic

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Template, TemplateRow } from "./types/templateTypes";

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

    // Just a simple cast.
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
 * Save a template row (NO zones here)
 */
export const saveTemplate = async (
  template: Partial<Template>
): Promise<Template | null> => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    const isNewTemplate = !template.id;

    // Only core template fields, default as needed
    const dataToSave: any = {
      name: template.name?.trim() || "Untitled Template",
      category: template.category || "Corporate",
      is_active:
        typeof (template as any).isActive === "boolean"
          ? (template as any).isActive
          : typeof template.is_active === "boolean"
            ? template.is_active
            : false,
      description: template.description || "",
      dimensions: template.dimensions || "11x8.5",
      base_image_url: template.base_image_url || null,
      isActive: undefined,
    };

    if (isNewTemplate) {
      if (!userId) {
        toast.error("You must be logged in to create a template.");
        return null;
      }
      dataToSave.created_by = userId;
    }

    let templateResult;
    if (isNewTemplate) {
      templateResult = await supabase
        .from("templates")
        .insert([dataToSave])
        .select()
        .maybeSingle();
    } else {
      templateResult = await supabase
        .from("templates")
        .update(dataToSave)
        .eq("id", template.id!)
        .select()
        .maybeSingle();
    }
    const { data, error } = templateResult;

    if (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template: " + error.message);
      return null;
    }
    if (!data) {
      toast.error("No data returned after saving template");
      return null;
    }
    return data as Template;
  } catch (error) {
    console.error("Unexpected error saving template:", error);
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

