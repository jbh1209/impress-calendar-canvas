import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ImageWithFallback from "@/components/ImageWithFallback";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateActiveCart } from "@/services/cartService";

interface CartItemView {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  project_id?: string;
}

interface CartSheetProps {
  children: React.ReactNode; // Trigger
}

const CartSheet: React.FC<CartSheetProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItemView[]>([]);
  const [loading, setLoading] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const cart = await getOrCreateActiveCart();
      if (!cart) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data: cartItemsRaw } = await supabase
        .from('cart_items' as any)
        .select('*')
        .eq('cart_id', cart.id);

      const cartItems = (cartItemsRaw as unknown as any[]) || [];
      const result: CartItemView[] = [];

      for (const ci of cartItems) {
        const { data: productRaw } = await supabase
          .from('products' as any)
          .select('*')
          .eq('id', ci.product_id)
          .maybeSingle();
        const product = productRaw as unknown as any;
        let image: string | null = null;
        if (product) {
          const { data: imagesRaw } = await supabase
            .from('product_images' as any)
            .select('*')
            .eq('product_id', product.id)
            .order('display_order', { ascending: true });
          const images = (imagesRaw as unknown as any[]) || [];
          image = images?.[0]?.image_url ?? null;
        }

        const { data: pp } = await supabase
          .from('pitchprint_projects' as any)
          .select('project_id, preview_url')
          .eq('cart_item_id', ci.id)
          .maybeSingle();
        if ((pp as any)?.preview_url) {
          image = (pp as any).preview_url as string;
        }

        result.push({
          id: ci.id,
          product_id: ci.product_id,
          name: product?.name ?? 'Product',
          price: Number(ci.unit_price),
          quantity: ci.quantity,
          image,
          project_id: (pp as any)?.project_id ?? undefined,
        });
      }

      setItems(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadItems();
    }
  }, [open, loadItems]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="sm:max-w-md w-full p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>

        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {loading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-muted-foreground">Your cart is empty.</div>
            ) : (
              items.map((i) => (
                <div key={i.id} className="flex gap-3 items-center">
                  <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {i.image ? (
                      <ImageWithFallback src={i.image} alt={i.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{i.name}</div>
                    <div className="text-sm text-muted-foreground">Qty: {i.quantity}</div>
                  </div>
                  <div className="font-semibold">R {(i.price * i.quantity).toFixed(2)}</div>
                </div>
              ))
            )}
          </div>

          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-semibold">R {subtotal.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/cart" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">View Cart</Button>
              </Link>
              <Link to="/checkout" onClick={() => setOpen(false)}>
                <Button className="w-full">Checkout</Button>
              </Link>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
