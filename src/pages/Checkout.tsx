import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Edit3, Package, CreditCard, FileText } from "lucide-react";

interface CartItemView {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

const Checkout = () => {
  const [items, setItems] = useState<CartItemView[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postal, setPostal] = useState("");
  const [country, setCountry] = useState("South Africa");
  const [phone, setPhone] = useState("");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>("shipping");

  const steps = [
    { id: 'shipping', title: 'Shipping', icon: Package },
    { id: 'payment', title: 'Payment', icon: CreditCard },
    { id: 'review', title: 'Review', icon: FileText }
  ] as const;

  useEffect(() => {
    document.title = "Checkout | Impress";
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to checkout");
        navigate("/auth/signin");
        return;
      }

      // Pre-fill email
      setEmail(user.email || "");

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
          .select('name, image_url')
          .eq('id', (ci as any).product_id)
          .maybeSingle();
        summary.push({
          id: (ci as any).id,
          name: (product as any)?.name || 'Product',
          price: Number((ci as any).unit_price),
          quantity: (ci as any).quantity,
          image_url: (product as any)?.image_url,
        });
      }

      setItems(summary);
      setLoading(false);
    })();
  }, [navigate]);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const shipping = shippingMethod === "express" ? 150 : 65;
  const vat = (subtotal + shipping) * 0.15;
  const total = subtotal + shipping + vat;

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
          full_name: `${firstName} ${lastName}`,
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
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Checkout</h1>
        
        {/* Progress Stepper */}
        <div className="flex items-center space-x-4 mt-6">
          {steps.map((stepItem, index) => {
            const stepIndex = steps.findIndex(s => s.id === step);
            const currentIndex = index;
            const isCompleted = currentIndex < stepIndex;
            const isCurrent = currentIndex === stepIndex;
            
            return (
              <div key={stepItem.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                  isCompleted ? 'bg-primary border-primary text-primary-foreground' :
                  isCurrent ? 'border-primary text-primary' : 
                  'border-muted-foreground/30 text-muted-foreground'
                }`}>
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <stepItem.icon className="w-4 h-4" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {stepItem.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-px mx-4 ${
                    isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Shipping Information */}
          {step === 'shipping' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={(e) => { e.preventDefault(); setStep('payment'); }} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
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
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div className="space-y-3">
                    <Label>Shipping Method</Label>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard" className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">Standard Shipping</div>
                              <div className="text-sm text-muted-foreground">5-7 business days</div>
                            </div>
                            <span className="font-medium">R 65.00</span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="express" id="express" />
                        <Label htmlFor="express" className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">Express Shipping</div>
                              <div className="text-sm text-muted-foreground">2-3 business days</div>
                            </div>
                            <span className="font-medium">R 150.00</span>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg">Continue to Payment</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Payment Method */}
          {step === 'payment' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">PayFast Secure Payment</div>
                      <div className="text-sm text-muted-foreground">
                        Pay securely with credit card, bank transfer, or other methods
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    You will be redirected to PayFast to complete your payment securely.
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep('shipping')}>Back</Button>
                  <Button onClick={() => setStep('review')} size="lg">Continue to Review</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review Order */}
          {step === 'review' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Review Your Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Shipping Address</h3>
                    <Button variant="ghost" size="sm" onClick={() => setStep('shipping')}>
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1 p-3 bg-muted rounded-lg">
                    <p className="font-medium text-foreground">{firstName} {lastName}</p>
                    <p>{line1}{line2 ? `, ${line2}` : ''}</p>
                    <p>{city}{state ? `, ${state}` : ''} {postal}</p>
                    <p>{country}</p>
                    {phone && <p>{phone}</p>}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Shipping Method</h3>
                    <Button variant="ghost" size="sm" onClick={() => setStep('shipping')}>
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="text-sm p-3 bg-muted rounded-lg">
                    <div className="font-medium">
                      {shippingMethod === 'express' ? 'Express Shipping' : 'Standard Shipping'}
                    </div>
                    <div className="text-muted-foreground">
                      {shippingMethod === 'express' ? '2-3 business days' : '5-7 business days'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep('payment')}>Back</Button>
                  <Button onClick={handleSubmit} disabled={submitting} size="lg">
                    {submitting ? 'Processing...' : 'Complete Order'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary - Sticky */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {item.quantity}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        R {item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>R {shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (15%)</span>
                  <span>R {vat.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>R {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
