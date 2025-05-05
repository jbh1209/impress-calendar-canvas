
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Template, TemplateRow } from "./types/templateTypes";
import { getZonesByTemplateId, saveZones } from "./customizationZoneService";

/**
 * Get template by ID with its associated customization zones
 */
export const getTemplateById = async (id: string): Promise<Template | null> => {
  try {
    // Fetch the template
    const { data: template, error: templateError } = await supabase
      .from('templates' as any)
      .select('*')
      .eq('id', id)
      .single();
      
    if (templateError) {
      console.error('Error fetching template:', templateError);
      toast.error('Failed to load template');
      return null;
    }
    
    if (!template) {
      return null;
    }
    
    // Fetch the customization zones for this template
    const zones = await getZonesByTemplateId(id);
    
    // Fetch product associations
    const { data: productAssociations, error: assocError } = await supabase
      .from('product_templates' as any)
      .select('product_id, is_default, products(name)')
      .eq('template_id', id);
    
    if (assocError) {
      console.error('Error fetching template product associations:', assocError);
    }
    
    // Convert the database rows to our type
    const templateData: Template = {
      ...(template as unknown as TemplateRow),
      customization_zones: zones,
      products: productAssociations || []
    };
    
    // Return the template with its zones
    return templateData;
  } catch (error) {
    console.error('Unexpected error fetching template:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
};

/**
 * Get all templates with optional customization zones
 */
export const getAllTemplates = async (includeZones = false, includeProducts = false): Promise<Template[]> => {
  try {
    const { data: templates, error: templatesError } = await supabase
      .from('templates' as any)
      .select('*')
      .order('name', { ascending: true });
      
    if (templatesError) {
      console.error('Error fetching templates:', templatesError);
      toast.error('Failed to load templates');
      return [];
    }
    
    if (!templates || templates.length === 0) {
      return [];
    }
    
    // If no additional data is requested, return templates as is
    if (!includeZones && !includeProducts) {
      return templates as unknown as TemplateRow[];
    }
    
    // If additional data is requested, fetch it for all templates
    const templatesWithData: Template[] = [];
    
    for (const template of templates as unknown as TemplateRow[]) {
      let zones = undefined;
      let products = undefined;
      
      if (includeZones) {
        zones = await getZonesByTemplateId(template.id);
      }
      
      if (includeProducts) {
        const { data: productAssociations } = await supabase
          .from('product_templates' as any)
          .select('product_id, is_default, products(name)')
          .eq('template_id', template.id);
        
        products = productAssociations;
      }
      
      templatesWithData.push({
        ...template,
        customization_zones: zones,
        products: products
      });
    }
    
    return templatesWithData;
  } catch (error) {
    console.error('Unexpected error fetching templates:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
};

/**
 * Save a template and its customization zones
 */
export const saveTemplate = async (template: Partial<Template>): Promise<Template | null> => {
  try {
    const user = supabase.auth.getUser();
    const userId = (await user).data.user?.id;
    
    const isNewTemplate = !template.id;
    const customizationZones = template.customization_zones || [];
    const templateWithoutZones = { ...template };
    delete templateWithoutZones.customization_zones; // Remove zones from template object for insert/update
    delete templateWithoutZones.products; // Remove product associations from template object
    
    // For new templates, add created_by field
    if (isNewTemplate && userId) {
      templateWithoutZones.created_by = userId;
    }
    
    // Insert or update the template
    let templateResult;
    
    if (isNewTemplate) {
      templateResult = await supabase
        .from('templates' as any)
        .insert([templateWithoutZones])
        .select()
        .single();
    } else {
      templateResult = await supabase
        .from('templates' as any)
        .update(templateWithoutZones)
        .eq('id', template.id!)
        .select()
        .single();
    }
    
    const { data, error } = templateResult;
    
    if (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
      return null;
    }
    
    if (!data) {
      toast.error('No data returned after saving template');
      return null;
    }
    
    // Save customization zones if they exist
    const success = await saveZones(customizationZones, data.id, isNewTemplate);
    
    if (!success) {
      toast.error('Template saved but some zones may not have been saved correctly');
    }
    
    // Reload the template with its zones
    return await getTemplateById(data.id);
  } catch (error) {
    console.error('Unexpected error saving template:', error);
    toast.error('An unexpected error occurred while saving');
    return null;
  }
};

/**
 * Delete a template (and its zones via cascade)
 */
export const deleteTemplate = async (id: string): Promise<boolean> => {
  try {
    // First check if template is associated with any products
    const { data: associations, error: checkError } = await supabase
      .from('product_templates' as any)
      .select('product_id')
      .eq('template_id', id);
    
    if (checkError) {
      console.error('Error checking template associations:', checkError);
      toast.error('Failed to check template associations');
      return false;
    }
    
    if (associations && associations.length > 0) {
      toast.error('Cannot delete template that is associated with products. Please remove the template from all products first.');
      return false;
    }
    
    const { error } = await supabase
      .from('templates' as any)
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting template:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
};

/**
 * Export template as JSON
 */
export const exportTemplateAsJson = async (id: string): Promise<string | null> => {
  try {
    const template = await getTemplateById(id);
    
    if (!template) {
      toast.error('Template not found');
      return null;
    }
    
    return JSON.stringify(template, null, 2);
  } catch (error) {
    console.error('Error exporting template:', error);
    toast.error('Failed to export template');
    return null;
  }
};

// Re-export types from templateTypes.ts
export type { Template, CustomizationZone } from "./types/templateTypes";
