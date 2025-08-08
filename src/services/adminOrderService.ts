
import { supabase } from "@/integrations/supabase/client";

export type AdminOrder = {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  pdf_url?: string | null;
};

export async function adminListOrders(params: { page?: number; limit?: number; status?: string }) {
  const { page = 1, limit = 20, status } = params || {};
  const { data, error } = await supabase.functions.invoke("admin-list-orders", {
    body: { page, limit, status },
  });
  if (error) throw error;
  return data as { items: AdminOrder[]; total: number; page: number; limit: number };
}
