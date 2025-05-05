
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define types for template and customization zones
export interface CustomizationZone {
  id: string;
  template_id?: string;
  name: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  z_index?: number;
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
  base_image_url: string | null;
  dimensions: string | null;
  created_at: string;
  created_by?: string | null;
  customization_zones?: CustomizationZone[];
}

// Define database response types to match our tables
interface TemplateRow {
  id: string;
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
  base_image_url: string | null;
  dimensions: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

interface ZoneRow {
  id: string;
  template_id: string;
  name: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  created_at: string;
  updated_at: string;
}

// Get template by ID with its associated customization zones
export const getTemplateById = async (id: string): Promise<Template | null> => {
  try {
    // Fetch the template
    const { data: template, error: templateError } = await supabase
      .from('templates')
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
    const { data: zones, error: zonesError } = await supabase
      .from('customization_zones')
      .select('*')
      .eq('template_id', id)
      .order('z_index', { ascending: true });
      
    if (zonesError) {
      console.error('Error fetching customization zones:', zonesError);
      toast.error('Failed to load template zones');
    }
    
    // Convert the database rows to our type
    const templateData: Template = {
      ...template as TemplateRow,
      customization_zones: (zones || []) as ZoneRow[]
    };
    
    // Return the template with its zones
    return templateData;
  } catch (error) {
    console.error('Unexpected error fetching template:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
};

// Get all templates with optional customization zones
export const getAllTemplates = async (includeZones = false): Promise<Template[]> => {
  try {
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('*');
      
    if (templatesError) {
      console.error('Error fetching templates:', templatesError);
      toast.error('Failed to load templates');
      return [];
    }
    
    if (!includeZones || !templates || templates.length === 0) {
      return templates as TemplateRow[] || [];
    }
    
    // If zones are requested, fetch them for all templates
    const templatesWithZones: Template[] = [];
    
    for (const template of templates as TemplateRow[]) {
      const { data: zones, error: zonesError } = await supabase
        .from('customization_zones')
        .select('*')
        .eq('template_id', template.id)
        .order('z_index', { ascending: true });
          
      if (zonesError) {
        console.error(`Error fetching zones for template ${template.id}:`, zonesError);
      }
      
      templatesWithZones.push({
        ...template,
        customization_zones: (zones || []) as ZoneRow[]
      });
    }
    
    return templatesWithZones;
  } catch (error) {
    console.error('Unexpected error fetching templates:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
};

// Save a template and its customization zones
export const saveTemplate = async (template: Partial<Template>): Promise<Template | null> => {
  try {
    const user = supabase.auth.getUser();
    const userId = (await user).data.user?.id;
    
    const isNewTemplate = !template.id;
    let customizationZones = template.customization_zones || [];
    const templateWithoutZones = { ...template };
    delete templateWithoutZones.customization_zones; // Remove zones from template object for insert/update
    
    // For new templates, add created_by field
    if (isNewTemplate && userId) {
      templateWithoutZones.created_by = userId;
    }
    
    // Insert or update the template
    let templateResult;
    
    if (isNewTemplate) {
      templateResult = await supabase
        .from('templates')
        .insert([templateWithoutZones])
        .select()
        .single();
    } else {
      templateResult = await supabase
        .from('templates')
        .update(templateWithoutZones)
        .eq('id', template.id)
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
    if (customizationZones && customizationZones.length > 0) {
      // For each zone, set the template_id
      customizationZones = customizationZones.map(zone => ({
        ...zone,
        template_id: data.id
      }));
      
      if (isNewTemplate) {
        // For new templates, insert all zones
        const { error: zonesError } = await supabase
          .from('customization_zones')
          .insert(customizationZones);
          
        if (zonesError) {
          console.error('Error saving customization zones:', zonesError);
          toast.error('Failed to save template zones');
        }
      } else {
        // For existing templates, handle zone updates, inserts, and deletions
        
        // Get existing zones to determine which to update vs insert
        const { data: existingZones, error: fetchError } = await supabase
          .from('customization_zones')
          .select('*')
          .eq('template_id', data.id);
          
        if (fetchError) {
          console.error('Error fetching existing zones:', fetchError);
          toast.error('Failed to update template zones');
        } else {
          // Determine which zones to update vs insert vs delete
          const existingZoneIds = new Set((existingZones as ZoneRow[] || []).map(z => z.id));
          const currentZoneIds = new Set(customizationZones.map(z => z.id).filter(Boolean));
          
          // Zones to update (exist in both sets)
          const zonesToUpdate = customizationZones.filter(z => z.id && existingZoneIds.has(z.id));
          
          // Zones to insert (don't exist in existing set)
          const zonesToInsert = customizationZones.filter(z => !z.id || !existingZoneIds.has(z.id));
          
          // Zones to delete (exist in existing but not in current)
          const zoneIdsToDelete = [...existingZoneIds].filter(id => !currentZoneIds.has(id));
          
          // Perform updates
          if (zonesToUpdate.length > 0) {
            for (const zone of zonesToUpdate) {
              const { error: updateError } = await supabase
                .from('customization_zones')
                .update(zone)
                .eq('id', zone.id!);
                
              if (updateError) {
                console.error(`Error updating zone ${zone.id}:`, updateError);
              }
            }
          }
          
          // Perform inserts
          if (zonesToInsert.length > 0) {
            const { error: insertError } = await supabase
              .from('customization_zones')
              .insert(zonesToInsert);
              
            if (insertError) {
              console.error('Error inserting new zones:', insertError);
            }
          }
          
          // Perform deletes
          if (zoneIdsToDelete.length > 0) {
            const { error: deleteError } = await supabase
              .from('customization_zones')
              .delete()
              .in('id', zoneIdsToDelete);
              
            if (deleteError) {
              console.error('Error deleting zones:', deleteError);
            }
          }
        }
      }
    }
    
    // Reload the template with its zones
    return await getTemplateById(data.id);
  } catch (error) {
    console.error('Unexpected error saving template:', error);
    toast.error('An unexpected error occurred while saving');
    return null;
  }
};

// Function to delete a template (and its zones via cascade)
export const deleteTemplate = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('templates')
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

// Function to export template as JSON
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
