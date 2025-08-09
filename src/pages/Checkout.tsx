import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CartItemView {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const Checkout = () => {
  const [items, setItems] = useState<CartItemView[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Address state
  const [fullName, setFullName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postal, setPostal] = useState("");
  const [country, setCountry] = useState("South Africa");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<'shipping' | 'review'>("shipping");

  useEffect(() => {
    document.title = "Checkout | Impress";
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to checkout");
        navigate("/auth/signin");
        return;
      }

      // Load cart summary
      const { data: carts } = await supabase
        .from('carts' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);

      const cart = carts?.[0];
      if (!cart) {
        toast.error("No active cart");
        navigate("/cart");
        return;
      }

      const { data: cartItems } = await supabase
        .from('cart_items' as any)
        .select('*')
        .eq('cart_id', (cart as any).id);

      const summary: CartItemView[] = [];
      const itemsRaw = (cartItems as unknown as any[]) || [];
      for (const ci of itemsRaw) {
        const { data: product } = await supabase
          .from('products' as any)
          .select('name')
          .eq('id', (ci as any).product_id)
          .maybeSingle();
        summary.push({
          id: (ci as any).id,
          name: (product as any)?.name || 'Product',
          price: Number((ci as any).unit_price),
          quantity: (ci as any).quantity,
        });
      }

      setItems(summary);
      setLoading(false);
    })();
  }, [navigate]);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      // Save address
      const { data: address, error: addrErr } = await supabase
        .from('addresses' as any)
        .insert([{ 
          user_id: user.id,
          full_name: fullName,
          line1,
          line2: line2 || null,
          city,
          state: state || null,
          postal_code: postal,
          country,
          phone: phone || null,
          type: 'shipping'
        }])
        .select()
        .single();

      if (addrErr) throw addrErr;

      // Create order from active cart
      const { data: orderData, error: orderErr } = await supabase.functions.invoke('create-order', {
        body: { shipping_address_id: (address as any)?.id }
      });

      if (orderErr || !orderData?.order_id) {
        throw new Error(orderErr?.message || 'Failed to create order');
      }

      // Initialize PayFast
      const { data: pfData, error: pfErr } = await supabase.functions.invoke('payfast-initiate', {
        body: { order_id: orderData.order_id }
      });

      if (pfErr || !pfData?.process_url || !pfData?.params) {
        throw new Error(pfErr?.message || 'Failed to initiate payment');
      }

      // Build and submit a POST form to PayFast
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = pfData.process_url;
      form.target = '_self';
      Object.entries(pfData.params as Record<string, string>).forEach(([k, v]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = String(v);
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Checkout failed');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container mx-auto p-6">Loading checkout...</div>;

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl lg:text-4xl mb-2">Checkout</h1>
      <p className="text-muted-foreground mb-6">Secure PayFast payment after shipping details</p>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          {step === 'shipping' ? (
            <Card>
              <CardContent className="p-6">
                <form onSubmit={(e) => { e.preventDefault(); setStep('review'); }} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="line1">Address Line 1</Label>
                    <Input id="line1" value={line1} onChange={(e) => setLine1(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="line2">Address Line 2 (optional)</Label>
                    <Input id="line2" value={line2} onChange={(e) => setLine2(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="postal">Postal Code</Label>
                      <Input id="postal" value={postal} onChange={(e) => setPostal(e.target.value)} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" className="mt-2">Continue</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl">Review Your Order</h2>
                <div>
                  <h3 className="mb-2">Shipping Address</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{fullName}</p>
                    <p>{line1}{line2 ? `, ${line2}` : ''}</p>
                    <p>{city}{state ? `, ${state}` : ''} {postal}</p>
                    <p>{country}</p>
                    {phone && <p>{phone}</p>}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('shipping')}>Back</Button>
                  <Button onClick={handleSubmit}>Pay with PayFast</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">R {subtotal.toFixed(2)}</span>
            </div>
            <div className="text-sm text-muted-foreground">Shipping calculated after payment</div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Checkout;
