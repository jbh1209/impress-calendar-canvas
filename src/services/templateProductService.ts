
// Handles product-template relationships.

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const getTemplateProductAssociations = async (templateId: string) => {
  try {
    const { data, error } = await supabase
      .from("product_templates")
      .select("product_id, is_default, products(name)")
      .eq("template_id", templateId);

    if (error) {
      console.error("Error fetching template product associations:", error);
      toast.error("Failed to load template associations");
      return [];
    }
    return data;
  } catch (error) {
    console.error("Unexpected error fetching associations:", error);
    toast.error("An unexpected error occurred");
    return [];
  }
};
