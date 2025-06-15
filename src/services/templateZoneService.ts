
// Handles all zone logic for templates.

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CustomizationZone } from "./types/templateTypes";

export const getZonesByTemplateId = async (
  templateId: string
): Promise<CustomizationZone[]> => {
  try {
    const { data, error } = await supabase
      .from("customization_zones")
      .select("*")
      .eq("template_id", templateId)
      .order("z_index", { ascending: true });

    if (error) {
      console.error("Error fetching customization zones:", error);
      toast.error("Failed to load customization zones");
      return [];
    }
    return (data as CustomizationZone[]) || [];
  } catch (error) {
    console.error("Unexpected error fetching customization zones:", error);
    toast.error("An unexpected error occurred");
    return [];
  }
};

export const saveZones = async (
  zones: CustomizationZone[],
  templateId: string
): Promise<boolean> => {
  try {
    // Logic for upsert/reconcile zones
    // ... to implement, refer to old service logic if needed.
    // For now, let's say zones are not handled here in detail
    return true;
  } catch (e) {
    toast.error("Error saving zones");
    return false;
  }
};

