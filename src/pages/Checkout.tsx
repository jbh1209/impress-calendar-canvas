import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { formatZAR } from "@/utils/currency";
import { useToast } from "@/hooks/use-toast";
import { Check, Edit3, Package, CreditCard, FileText } from "lucide-react";

interface CartItemView {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

const shippingSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  line1: z.string().min(5, "Address line 1 must be at least 5 characters"),
  line2: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().optional(),
  postal: z.string().min(4, "Postal code must be at least 4 characters"),
  country: z.string().min(2, "Country is required"),
  phone: z.string().optional(),
  shippingMethod: z.enum(["standard", "express"]),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

const Checkout = () => {
  const [items, setItems] = useState<CartItemView[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>("shipping");
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal: "",
      country: "South Africa",
      phone: "",
      shippingMethod: "standard",
    },
  });

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
        toast({
          title: "Please sign in to checkout",
          variant: "destructive",
        });
        navigate("/auth/signin");
        return;
      }

      // Pre-fill email
      form.setValue("email", user.email || "");

      // Load cart summary
      const { data: carts } = await supabase
        .from('carts' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);

      const cart = carts?.[0];
      if (!cart) {
        toast({
          title: "No active cart found",
          description: "Please add items to your cart before checkout",
          variant: "destructive",
        });
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

  const shippingMethod = form.watch("shippingMethod");
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const shipping = shippingMethod === "express" ? 150 : 65;
  const vat = (subtotal + shipping) * 0.15;
  const total = subtotal + shipping + vat;

  const handleSubmit = async (data: ShippingFormData) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      // Save address
      const { data: address, error: addrErr } = await supabase
        .from('addresses' as any)
        .insert([{ 
          user_id: user.id,
          full_name: `${data.firstName} ${data.lastName}`,
          line1: data.line1,
          line2: data.line2 || null,
          city: data.city,
          state: data.state || null,
          postal_code: data.postal,
          country: data.country,
          phone: data.phone || null,
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
      toast({
        title: "Checkout Failed",
        description: err.message || 'Something went wrong during checkout',
        variant: "destructive",
      });
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
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(() => setStep('payment'))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="line1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 1</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="line2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 2 (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (optional)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="shippingMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Shipping Method</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid gap-3"
                            >
                              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                <RadioGroupItem value="standard" id="standard" />
                                <Label htmlFor="standard" className="flex-1 cursor-pointer">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <div className="font-medium">Standard Shipping</div>
                                      <div className="text-sm text-muted-foreground">5-7 business days</div>
                                    </div>
                                    <span className="font-medium">{formatZAR(65)}</span>
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
                                    <span className="font-medium">{formatZAR(150)}</span>
                                  </div>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-4">
                      <Button type="submit" size="lg">Continue to Payment</Button>
                    </div>
                  </form>
                </Form>
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
                    <p className="font-medium text-foreground">{form.getValues("firstName")} {form.getValues("lastName")}</p>
                    <p>{form.getValues("line1")}{form.getValues("line2") ? `, ${form.getValues("line2")}` : ''}</p>
                    <p>{form.getValues("city")}{form.getValues("state") ? `, ${form.getValues("state")}` : ''} {form.getValues("postal")}</p>
                    <p>{form.getValues("country")}</p>
                    {form.getValues("phone") && <p>{form.getValues("phone")}</p>}
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
                  <Button onClick={form.handleSubmit(handleSubmit)} disabled={submitting} size="lg">
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
                        {formatZAR(item.price)} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatZAR(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatZAR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatZAR(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (15%)</span>
                  <span>{formatZAR(vat)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatZAR(total)}</span>
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
