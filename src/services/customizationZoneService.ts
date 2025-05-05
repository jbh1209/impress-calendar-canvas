
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CustomizationZone, ZoneRow } from "./types/templateTypes";

/**
 * Get customization zones for a template
 */
export const getZonesByTemplateId = async (templateId: string): Promise<CustomizationZone[]> => {
  try {
    const { data: zones, error } = await supabase
      .from('customization_zones' as any)
      .select('*')
      .eq('template_id', templateId)
      .order('z_index', { ascending: true });
      
    if (error) {
      console.error('Error fetching customization zones:', error);
      toast.error('Failed to load template zones');
      return [];
    }
    
    return zones as unknown as ZoneRow[] || [];
  } catch (error) {
    console.error('Unexpected error fetching zones:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
};

/**
 * Save multiple customization zones for a template
 */
export const saveZones = async (
  zones: CustomizationZone[],
  templateId: string,
  isNew: boolean
): Promise<boolean> => {
  try {
    if (!zones || zones.length === 0) {
      return true; // No zones to save
    }
    
    // For each zone, set the template_id
    const zonesWithTemplateId = zones.map(zone => ({
      ...zone,
      template_id: templateId
    }));
    
    if (isNew) {
      // For new templates, insert all zones
      const { error } = await supabase
        .from('customization_zones' as any)
        .insert(zonesWithTemplateId);
        
      if (error) {
        console.error('Error saving customization zones:', error);
        toast.error('Failed to save template zones');
        return false;
      }
      
      return true;
    } 
    
    // For existing templates, handle zone updates, inserts, and deletions
    // Get existing zones to determine which to update vs insert
    const { data: existingZones, error: fetchError } = await supabase
      .from('customization_zones' as any)
      .select('*')
      .eq('template_id', templateId);
      
    if (fetchError) {
      console.error('Error fetching existing zones:', fetchError);
      toast.error('Failed to update template zones');
      return false;
    }
    
    // Determine which zones to update vs insert vs delete
    const existingZoneIds = new Set((existingZones as unknown as ZoneRow[] || []).map(z => z.id));
    const currentZoneIds = new Set(zonesWithTemplateId.map(z => z.id).filter(Boolean));
    
    // Zones to update (exist in both sets)
    const zonesToUpdate = zonesWithTemplateId.filter(z => z.id && existingZoneIds.has(z.id));
    
    // Zones to insert (don't exist in existing set)
    const zonesToInsert = zonesWithTemplateId.filter(z => !z.id || !existingZoneIds.has(z.id));
    
    // Zones to delete (exist in existing but not in current)
    const zoneIdsToDelete = [...existingZoneIds].filter(id => !currentZoneIds.has(id));
    
    // Perform updates
    if (zonesToUpdate.length > 0) {
      for (const zone of zonesToUpdate) {
        const { error: updateError } = await supabase
          .from('customization_zones' as any)
          .update(zone)
          .eq('id', zone.id!);
          
        if (updateError) {
          console.error(`Error updating zone ${zone.id}:`, updateError);
          // Continue with other zones even if one fails
        }
      }
    }
    
    // Perform inserts
    if (zonesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('customization_zones' as any)
        .insert(zonesToInsert);
        
      if (insertError) {
        console.error('Error inserting new zones:', insertError);
        // Continue with deletes even if inserts fail
      }
    }
    
    // Perform deletes
    if (zoneIdsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('customization_zones' as any)
        .delete()
        .in('id', zoneIdsToDelete);
        
      if (deleteError) {
        console.error('Error deleting zones:', deleteError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error saving zones:', error);
    toast.error('An unexpected error occurred while saving zones');
    return false;
  }
};

/**
 * Delete all zones for a template
 */
export const deleteZonesByTemplateId = async (templateId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('customization_zones' as any)
      .delete()
      .eq('template_id', templateId);
      
    if (error) {
      console.error('Error deleting zones:', error);
      toast.error('Failed to delete template zones');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting zones:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
};
