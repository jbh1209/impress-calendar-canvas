
import { supabase } from "@/integrations/supabase/client";

export type PayfastConfig = {
  payfast_mode: "sandbox" | "live";
  itn_url: string;
};

export async function getAdminConfig() {
  const { data, error } = await supabase.functions.invoke("admin-get-config", {
    body: {},
  });
  if (error) throw error;
  return data as PayfastConfig;
}
