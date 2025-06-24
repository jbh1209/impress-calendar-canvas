
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ZonePageAssignment } from "./types/templateTypes";

/**
 * Get zone page assignments for a specific page
 */
export const getZoneAssignmentsByPageId = async (pageId: string): Promise<ZonePageAssignment[]> => {
  try {
    const { data, error } = await supabase
      .from('zone_page_assignments')
      .select('*')
      .eq('page_id', pageId)
      .order('z_index', { ascending: true });
      
    if (error) {
      console.error('Error fetching zone page assignments:', error);
      toast.error('Failed to load page zones');
      return [];
    }
    
    return (data as ZonePageAssignment[]) || [];
  } catch (error) {
    console.error('Unexpected error fetching zone assignments:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
};

/**
 * Save zone page assignments for a specific page
 */
export const saveZoneAssignments = async (
  assignments: Omit<ZonePageAssignment, 'id'>[],
  pageId: string
): Promise<boolean> => {
  try {
    // First, delete existing assignments for this page
    const { error: deleteError } = await supabase
      .from('zone_page_assignments')
      .delete()
      .eq('page_id', pageId);
      
    if (deleteError) {
      console.error('Error deleting existing zone assignments:', deleteError);
      toast.error('Failed to update zone assignments');
      return false;
    }
    
    // Then insert new assignments
    if (assignments.length > 0) {
      const { error: insertError } = await supabase
        .from('zone_page_assignments')
        .insert(assignments);
        
      if (insertError) {
        console.error('Error inserting zone assignments:', insertError);
        toast.error('Failed to save zone assignments');
        return false;
      }
    }
    
    toast.success(`Saved ${assignments.length} zone assignments for page`);
    return true;
  } catch (error) {
    console.error('Unexpected error saving zone assignments:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
};

/**
 * Create a zone assignment from canvas object
 */
export const createZoneAssignmentFromCanvas = (
  canvasObject: any,
  zoneId: string,
  pageId: string,
  zIndex: number = 0
): Omit<ZonePageAssignment, 'id'> => {
  return {
    zone_id: zoneId,
    page_id: pageId,
    x: canvasObject.left || 0,
    y: canvasObject.top || 0,
    width: canvasObject.width || 100,
    height: canvasObject.height || 100,
    z_index: zIndex,
    is_repeating: false
  };
};
