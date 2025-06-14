
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { TemplatePage, ZonePageAssignment } from "./types/templateTypes";

// --- TEMPLATE PAGES ---

export const getTemplatePages = async (template_id: string): Promise<TemplatePage[]> => {
  const { data, error } = await supabase
    .from("template_pages")
    .select("*")
    .eq("template_id", template_id)
    .order("page_number", { ascending: true });

  if (error) {
    console.error("Error fetching template pages:", error);
    toast.error("Failed to load template pages");
    return [];
  }
  return (data as TemplatePage[]) || [];
};

export const addTemplatePage = async (
  page: Omit<TemplatePage, "id" | "created_at" | "updated_at">
): Promise<TemplatePage | null> => {
  const { data, error } = await supabase
    .from("template_pages")
    .insert([page])
    .select()
    .single();

  if (error) {
    console.error("Error adding template page:", error);
    toast.error("Failed to add template page");
    return null;
  }
  return data as TemplatePage;
};

export const updateTemplatePage = async (
  id: string,
  updates: Partial<Omit<TemplatePage, "id" | "created_at" | "updated_at">>
): Promise<TemplatePage | null> => {
  const { data, error } = await supabase
    .from("template_pages")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating template page:", error);
    toast.error("Failed to update template page");
    return null;
  }
  return data as TemplatePage;
};

export const deleteTemplatePage = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("template_pages")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Error deleting template page:", error);
    toast.error("Failed to delete template page");
    return false;
  }
  return true;
};

// --- ZONE PAGE ASSIGNMENTS ---

export const getZonePageAssignments = async (page_id: string): Promise<ZonePageAssignment[]> => {
  const { data, error } = await supabase
    .from("zone_page_assignments")
    .select("*")
    .eq("page_id", page_id)
    .order("z_index", { ascending: true });

  if (error) {
    console.error("Error fetching zone assignments:", error);
    toast.error("Failed to load page assignments");
    return [];
  }
  return (data as ZonePageAssignment[]) || [];
};

export const addZonePageAssignment = async (
  assignment: Omit<ZonePageAssignment, "id">
): Promise<ZonePageAssignment | null> => {
  const { data, error } = await supabase
    .from("zone_page_assignments")
    .insert([assignment])
    .select()
    .single();

  if (error) {
    console.error("Error adding zone-page assignment:", error);
    toast.error("Failed to add zone-to-page assignment");
    return null;
  }
  return data as ZonePageAssignment;
};

export const updateZonePageAssignment = async (
  id: string,
  updates: Partial<Omit<ZonePageAssignment, "id">>
): Promise<ZonePageAssignment | null> => {
  const { data, error } = await supabase
    .from("zone_page_assignments")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("Error updating zone-page assignment:", error);
    toast.error("Failed to update zone-page assignment");
    return null;
  }
  return data as ZonePageAssignment;
};

export const deleteZonePageAssignment = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("zone_page_assignments")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Error deleting zone-page assignment:", error);
    toast.error("Failed to delete assignment");
    return false;
  }
  return true;
};
