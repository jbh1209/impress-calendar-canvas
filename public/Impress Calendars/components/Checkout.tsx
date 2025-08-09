import { useState } from 'react';
import { ArrowLeft, CreditCard, Lock, Package, Truck } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CartItem } from '../App';

interface CheckoutProps {
  items: CartItem[];
  total: number;
  onBack: () => void;
}

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'complete';

export function Checkout({ items, total, onBack }: CheckoutProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    shippingMethod: 'standard',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingAddressSame: true,
  });

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = formData.shippingMethod === 'express' ? 15 : (subtotal > 50 ? 0 : 10);
  const tax = subtotal * 0.08;
  const finalTotal = subtotal + shipping + tax;

  const steps = [
    { id: 'shipping', label: 'Shipping', icon: Package },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'review', label: 'Review', icon: Truck },
  ];

  const handleNext = () => {
    if (currentStep === 'shipping') {
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      setCurrentStep('review');
    } else if (currentStep === 'review') {
      setCurrentStep('complete');
    }
  };

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('shipping');
    } else if (currentStep === 'review') {
      setCurrentStep('payment');
    } else {
      onBack();
    }
  };

  if (currentStep === 'complete') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Package className="h-8 w-8 text-green-600" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. We've received your order and will start processing it right away.
            </p>
          </div>

          <Card className="p-6 text-left">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Order Number:</span>
                <span className="font-mono">#SF-{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery:</span>
                <span>
                  {formData.shippingMethod === 'express' ? '1-2 business days' : '3-5 business days'}
                </span>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setCurrentStep('shipping')} variant="outline">
              View Order Details
            </Button>
            <Button onClick={() => window.location.reload()}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={handleBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-8 mb-8">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-2 ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-primary text-primary-foreground' : 
                    isCompleted ? 'bg-green-600 text-white' : 
                    'bg-muted'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:block">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-px ml-4 ${isCompleted ? 'bg-green-600' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 'shipping' && (
              <Card className="p-6">
                <h2 className="text-xl mb-6">Shipping Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select value={formData.state} onValueChange={(value) => updateFormData('state', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => updateFormData('zipCode', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Shipping Method</Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <input
                          type="radio"
                          id="standard"
                          name="shipping"
                          checked={formData.shippingMethod === 'standard'}
                          onChange={() => updateFormData('shippingMethod', 'standard')}
                        />
                        <div className="flex-1 flex justify-between">
                          <div>
                            <Label htmlFor="standard" className="cursor-pointer">Standard Shipping</Label>
                            <p className="text-sm text-muted-foreground">3-5 business days</p>
                          </div>
                          <span>{subtotal > 50 ? 'Free' : '$10.00'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <input
                          type="radio"
                          id="express"
                          name="shipping"
                          checked={formData.shippingMethod === 'express'}
                          onChange={() => updateFormData('shippingMethod', 'express')}
                        />
                        <div className="flex-1 flex justify-between">
                          <div>
                            <Label htmlFor="express" className="cursor-pointer">Express Shipping</Label>
                            <p className="text-sm text-muted-foreground">1-2 business days</p>
                          </div>
                          <span>$15.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 'payment' && (
              <Card className="p-6">
                <h2 className="text-xl mb-6 flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Payment Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) => updateFormData('cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        value={formData.expiryDate}
                        onChange={(e) => updateFormData('expiryDate', e.target.value)}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        value={formData.cvv}
                        onChange={(e) => updateFormData('cvv', e.target.value)}
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="nameOnCard">Name on Card</Label>
                    <Input
                      id="nameOnCard"
                      value={formData.nameOnCard}
                      onChange={(e) => updateFormData('nameOnCard', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="billingAddressSame"
                      checked={formData.billingAddressSame}
                      onCheckedChange={(checked) => updateFormData('billingAddressSame', checked as boolean)}
                    />
                    <Label htmlFor="billingAddressSame" className="text-sm">
                      Billing address is same as shipping address
                    </Label>
                  </div>
                </div>
              </Card>
            )}

            {currentStep === 'review' && (
              <Card className="p-6">
                <h2 className="text-xl mb-6">Review Your Order</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3">Shipping Address</h3>
                    <div className="text-sm text-muted-foreground">
                      <p>{formData.firstName} {formData.lastName}</p>
                      <p>{formData.address}</p>
                      <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-3">Payment Method</h3>
                    <div className="text-sm text-muted-foreground">
                      <p>**** **** **** {formData.cardNumber.slice(-4)}</p>
                      <p>{formData.nameOnCard}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-3">Shipping Method</h3>
                    <div className="text-sm text-muted-foreground">
                      <p>{formData.shippingMethod === 'express' ? 'Express Shipping (1-2 days)' : 'Standard Shipping (3-5 days)'}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h3 className="mb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-lg">
                      <ImageWithFallback
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm line-clamp-2">{item.product.name}</h4>
                      <div className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                        {item.selectedColor && ` • ${item.selectedColor}`}
                        {item.selectedSize && ` • ${item.selectedSize}`}
                      </div>
                      <div className="text-sm">${(item.product.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={handleNext} className="w-full mt-6" size="lg">
                {currentStep === 'review' ? 'Place Order' : 'Continue'}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}