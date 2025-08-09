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

  const formatZAR = useCallback((n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n), []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );
  const vat = useMemo(() => subtotal * 0.15, [subtotal]);
  const total = useMemo(() => subtotal + vat, [subtotal]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-[420px] sm:w-[480px] p-0">
        <SheetHeader className="p-6 border-b sticky top-0 bg-background z-10">
          <SheetTitle>
            Your Cart {items.length > 0 && (
              <span className="text-muted-foreground font-normal">({items.length})</span>
            )}
          </SheetTitle>
        </SheetHeader>

          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-auto p-4">
              {loading ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : items.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  Your cart is empty.
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((i) => (
                    <li key={i.id} className="flex gap-3 items-center">
                      <div className="h-18 w-18 sm:h-20 sm:w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        {i.image ? (
                          <ImageWithFallback src={i.image} alt={i.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{i.name}</div>
                        {i.project_id && (
                          <div className="text-xs text-muted-foreground">Customized</div>
                        )}
                        <div className="text-sm text-muted-foreground">Qty {i.quantity} • {formatZAR(i.price)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatZAR(i.price * i.quantity)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t p-4 space-y-3 bg-background sticky bottom-0">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-medium">{formatZAR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>VAT (15%)</span>
                <span>{formatZAR(vat)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-1">
                <span>Total</span>
                <span>{formatZAR(total)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link to="/cart" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">View Cart</Button>
                </Link>
                <Link to="/checkout" onClick={() => setOpen(false)}>
                  <Button className="w-full">Checkout</Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground text-center">Free shipping on orders over R500</p>
            </div>
          </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
