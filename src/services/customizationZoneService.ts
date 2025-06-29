
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CustomizationZone } from "./types/templateTypes";

export const getCustomizationZonesByTemplateId = async (
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

export const saveCustomizationZone = async (
  zone: Omit<CustomizationZone, 'id'>
): Promise<CustomizationZone | null> => {
  try {
    const { data, error } = await supabase
      .from("customization_zones")
      .insert([zone])
      .select()
      .single();

    if (error) {
      console.error("Error saving customization zone:", error);
      toast.error("Failed to save customization zone");
      return null;
    }
    return data as CustomizationZone;
  } catch (error) {
    console.error("Unexpected error saving customization zone:", error);
    toast.error("An unexpected error occurred");
    return null;
  }
};

export const deleteCustomizationZone = async (
  zoneId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("customization_zones")
      .delete()
      .eq("id", zoneId);

    if (error) {
      console.error("Error deleting customization zone:", error);
      toast.error("Failed to delete customization zone");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Unexpected error deleting customization zone:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
};
