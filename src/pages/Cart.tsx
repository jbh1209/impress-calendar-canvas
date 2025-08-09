import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getOrCreateActiveCart, updateCartItemQuantity, removeCartItem } from "@/services/cartService";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { pitchprintService } from "@/services/pitchprintService";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatZAR } from "@/utils/currency";
import { toast } from "sonner";
interface CartItemView {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  project_id?: string;
}

const Cart = () => {
  const [items, setItems] = useState<CartItemView[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleEditDesign = (item: CartItemView) => {
    if (!item.project_id) return;
    const returnUrl = `${window.location.origin}/customize/callback?product_id=${item.product_id}`;
    const url = pitchprintService.generateProjectEditUrl(item.project_id, { returnUrl });
    window.open(url, "_blank");
  };

  useEffect(() => {
    document.title = "Your Cart | Impress";
    (async () => {
      const cart = await getOrCreateActiveCart();
      if (!cart) {
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

        // Try to use PitchPrint preview if associated
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
      setLoading(false);
    })();
  }, []);

  const handleQuantityChange = async (itemId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) {
      await handleRemove(itemId);
      return;
    }
    setUpdatingId(itemId);
    const updated = await updateCartItemQuantity(itemId, newQty);
    if (!updated) {
      toast.error('Could not update quantity');
      setUpdatingId(null);
      return;
    }
    setItems(prev => prev
      .map(it => it.id === itemId ? { ...it, quantity: updated.quantity } : it)
      .filter(it => it.quantity > 0)
    );
    setUpdatingId(null);
  };

  const handleRemove = async (itemId: string) => {
    setUpdatingId(itemId);
    const ok = await removeCartItem(itemId);
    if (!ok) {
      setUpdatingId(null);
      return;
    }
    setItems(prev => prev.filter(it => it.id !== itemId));
    setUpdatingId(null);
  };

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  if (loading) return <div className="container mx-auto p-6">Loading cart...</div>;

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty.</p>
            <Link to="/products">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            {items.map((i) => (
              <Card key={i.id}>
                <CardContent className="p-4 flex gap-4 items-center">
                  <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden">
                    {i.image ? (
                      <ImageWithFallback src={i.image} alt={i.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{i.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Button variant="outline" size="icon" onClick={() => handleQuantityChange(i.id, i.quantity, -1)} disabled={updatingId === i.id} aria-label="Decrease quantity">-</Button>
                      <span className="w-8 text-center">{i.quantity}</span>
                      <Button variant="outline" size="icon" onClick={() => handleQuantityChange(i.id, i.quantity, 1)} disabled={updatingId === i.id} aria-label="Increase quantity">+</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRemove(i.id)} disabled={updatingId === i.id}>Remove</Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-semibold">{formatZAR(i.price * i.quantity)}</div>
                    {i.project_id && (
                      <Button size="sm" variant="outline" onClick={() => handleEditDesign(i)}>
                        Edit Design
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">{formatZAR(subtotal)}</span>
              </div>
              <Link to="/checkout">
                <Button className="w-full">Checkout</Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" className="w-full mt-2">Continue Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
};

export default Cart;
