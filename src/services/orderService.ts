
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Order {
  id: string;
  user_id: string;
  template_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_amount: number;
  customization_data: any;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

/**
 * Create a new order
 */
export const createOrder = async (orderData: {
  templateId: string;
  customizationData: any;
  totalAmount: number;
}): Promise<Order | null> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      toast.error("You must be logged in to place an order");
      return null;
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        user_id: user.id,
        template_id: orderData.templateId,
        status: 'pending',
        total_amount: orderData.totalAmount,
        customization_data: orderData.customizationData
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
      return null;
    }

    toast.success("Order created successfully!");
    return data as Order;
  } catch (error) {
    console.error("Unexpected error creating order:", error);
    toast.error("An unexpected error occurred");
    return null;
  }
};

/**
 * Get user's orders
 */
export const getUserOrders = async (): Promise<Order[]> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
      return [];
    }

    return (data as Order[]) || [];
  } catch (error) {
    console.error("Unexpected error fetching orders:", error);
    return [];
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string, 
  status: Order['status'],
  pdfUrl?: string
): Promise<boolean> => {
  try {
    const updateData: any = { status };
    if (pdfUrl) {
      updateData.pdf_url = pdfUrl;
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      console.error("Error updating order status:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error updating order:", error);
    return false;
  }
};
