
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

    // Use the raw query approach to avoid TypeScript issues with the generated types
    const { data, error } = await supabase
      .rpc('create_order', {
        p_user_id: user.id,
        p_template_id: orderData.templateId,
        p_total_amount: orderData.totalAmount,
        p_customization_data: orderData.customizationData
      });

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

    // Use raw query to get orders
    const { data, error } = await supabase
      .rpc('get_user_orders', { p_user_id: user.id });

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
    const { error } = await supabase
      .rpc('update_order_status', {
        p_order_id: orderId,
        p_status: status,
        p_pdf_url: pdfUrl
      });

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
