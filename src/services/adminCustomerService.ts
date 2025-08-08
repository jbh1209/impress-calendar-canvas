
import { supabase } from "@/integrations/supabase/client";

export type AdminCustomer = {
  id: string;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  user_metadata?: Record<string, any> | null;
};

export async function adminListCustomers(params: { page?: number; limit?: number }) {
  const { page = 1, limit = 20 } = params || {};
  const { data, error } = await supabase.functions.invoke("admin-list-customers", {
    body: { page, limit },
  });
  if (error) throw error;
  return data as { items: AdminCustomer[]; page: number; limit: number; hasMore: boolean };
}
