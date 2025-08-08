import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Cart {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export const getOrCreateActiveCart = async (): Promise<Cart | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: carts } = await supabase
    .from('carts' as any)
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1);

  if (carts && carts.length > 0) return carts[0] as unknown as Cart;

  const { data, error } = await supabase
    .from('carts' as any)
    .insert([{ user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error('Error creating cart:', error);
    toast.error('Could not create a shopping cart');
    return null;
  }

  return data as unknown as Cart;
};

export const addCartItem = async (cartId: string, productId: string, quantity: number, unitPrice: number) => {
  const { data, error } = await supabase
    .from('cart_items' as any)
    .insert([{ 
      cart_id: cartId,
      product_id: productId,
      quantity,
      unit_price: unitPrice,
      total_price: unitPrice * quantity
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding item to cart:', error);
    toast.error('Could not add item to cart');
    return null;
  }
  return data as unknown as CartItem;
};
