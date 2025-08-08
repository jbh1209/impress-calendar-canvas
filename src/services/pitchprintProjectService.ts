import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UpsertProjectParams {
  projectId: string;
  productId: string;
  status?: string;
  previewUrl?: string;
  pdfUrl?: string;
  payload?: any;
  cartItemId?: string;
  orderItemId?: string;
}

export const upsertPitchPrintProject = async (params: UpsertProjectParams) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to save your design");
      return { ok: false };
    }

    const { data, error } = await supabase
      .from('pitchprint_projects' as any)
      .upsert([
        {
          user_id: user.id,
          product_id: params.productId,
          project_id: params.projectId,
          status: params.status ?? 'completed',
          preview_url: params.previewUrl,
          pdf_url: params.pdfUrl,
          payload: params.payload ?? null,
          cart_item_id: params.cartItemId ?? null,
          order_item_id: params.orderItemId ?? null,
        }
      ], { onConflict: 'project_id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving PitchPrint project:', error);
      return { ok: false };
    }

    return { ok: true, project: data };
  } catch (e) {
    console.error('Unexpected error saving PitchPrint project:', e);
    return { ok: false };
  }
};
