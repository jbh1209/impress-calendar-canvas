
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CustomizationZone, ZonePageAssignment } from "./types/templateTypes";

export interface ZoneWithAssignment extends CustomizationZone {
  pageAssignment?: ZonePageAssignment;
}

export const saveZoneToDatabase = async (
  zone: Omit<CustomizationZone, 'id'> & { template_id: string },
  pageId: string
): Promise<string | null> => {
  try {
    console.log('[ZonePersistence] Saving zone to database:', zone);
    
    // First, save the customization zone
    const { data: zoneData, error: zoneError } = await supabase
      .from('customization_zones')
      .insert({
        template_id: zone.template_id,
        name: zone.name,
        type: zone.type,
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
        z_index: zone.z_index || 0
      })
      .select()
      .single();

    if (zoneError) {
      console.error('[ZonePersistence] Error saving zone:', zoneError);
      toast.error(`Failed to save zone: ${zoneError.message}`);
      return null;
    }

    // Then create the page assignment
    const assignment: Omit<ZonePageAssignment, 'id'> = {
      zone_id: zoneData.id!,
      page_id: pageId,
      x: zone.x,
      y: zone.y,
      width: zone.width,
      height: zone.height,
      z_index: zone.z_index || 0,
      is_repeating: false
    };

    const { error: assignmentError } = await supabase
      .from('zone_page_assignments')
      .insert(assignment);

    if (assignmentError) {
      console.error('[ZonePersistence] Error saving zone assignment:', assignmentError);
      // Try to clean up the zone if assignment failed
      await supabase.from('customization_zones').delete().eq('id', zoneData.id!);
      toast.error(`Failed to save zone assignment: ${assignmentError.message}`);
      return null;
    }

    console.log('[ZonePersistence] Zone saved successfully:', zoneData.id);
    toast.success(`Zone "${zone.name}" saved successfully`);
    return zoneData.id!;
  } catch (error) {
    console.error('[ZonePersistence] Unexpected error:', error);
    toast.error('Failed to save zone');
    return null;
  }
};

export const loadZonesForPage = async (pageId: string): Promise<ZoneWithAssignment[]> => {
  try {
    console.log('[ZonePersistence] Loading zones for page:', pageId);
    
    const { data, error } = await supabase
      .from('zone_page_assignments')
      .select(`
        *,
        customization_zones (*)
      `)
      .eq('page_id', pageId)
      .order('z_index');

    if (error) {
      console.error('[ZonePersistence] Error loading zones:', error);
      toast.error(`Failed to load zones: ${error.message}`);
      return [];
    }

    const zones: ZoneWithAssignment[] = (data || []).map((assignment: any) => ({
      id: assignment.customization_zones.id,
      template_id: assignment.customization_zones.template_id,
      name: assignment.customization_zones.name,
      type: assignment.customization_zones.type,
      x: assignment.x,
      y: assignment.y,
      width: assignment.width,
      height: assignment.height,
      z_index: assignment.z_index,
      pageAssignment: {
        id: assignment.id,
        zone_id: assignment.zone_id,
        page_id: assignment.page_id,
        x: assignment.x,
        y: assignment.y,
        width: assignment.width,
        height: assignment.height,
        z_index: assignment.z_index,
        is_repeating: assignment.is_repeating
      }
    }));

    console.log(`[ZonePersistence] Loaded ${zones.length} zones for page`);
    return zones;
  } catch (error) {
    console.error('[ZonePersistence] Unexpected error loading zones:', error);
    toast.error('Failed to load zones');
    return [];
  }
};

export const updateZoneAssignment = async (
  assignmentId: string,
  updates: Partial<ZonePageAssignment>
): Promise<boolean> => {
  try {
    console.log('[ZonePersistence] Updating zone assignment:', assignmentId, updates);
    
    const { error } = await supabase
      .from('zone_page_assignments')
      .update(updates)
      .eq('id', assignmentId);

    if (error) {
      console.error('[ZonePersistence] Error updating zone assignment:', error);
      toast.error(`Failed to update zone: ${error.message}`);
      return false;
    }

    console.log('[ZonePersistence] Zone assignment updated successfully');
    return true;
  } catch (error) {
    console.error('[ZonePersistence] Unexpected error updating zone:', error);
    toast.error('Failed to update zone');
    return false;
  }
};

export const deleteZone = async (zoneId: string, assignmentId?: string): Promise<boolean> => {
  try {
    console.log('[ZonePersistence] Deleting zone:', zoneId);
    
    // Delete assignment first if provided
    if (assignmentId) {
      const { error: assignmentError } = await supabase
        .from('zone_page_assignments')
        .delete()
        .eq('id', assignmentId);

      if (assignmentError) {
        console.error('[ZonePersistence] Error deleting assignment:', assignmentError);
        toast.error(`Failed to delete zone assignment: ${assignmentError.message}`);
        return false;
      }
    }

    // Then delete the zone
    const { error: zoneError } = await supabase
      .from('customization_zones')
      .delete()
      .eq('id', zoneId);

    if (zoneError) {
      console.error('[ZonePersistence] Error deleting zone:', zoneError);
      toast.error(`Failed to delete zone: ${zoneError.message}`);
      return false;
    }

    console.log('[ZonePersistence] Zone deleted successfully');
    toast.success('Zone deleted successfully');
    return true;
  } catch (error) {
    console.error('[ZonePersistence] Unexpected error deleting zone:', error);
    toast.error('Failed to delete zone');
    return false;
  }
};
