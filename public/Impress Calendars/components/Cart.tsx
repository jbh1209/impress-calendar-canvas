import { Trash2, Plus, Minus, X, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CartItem } from '../App';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
  isSidebar?: boolean;
  onClose?: () => void;
}

export function Cart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onContinueShopping,
  isSidebar = false,
  onClose
}: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className={`${isSidebar ? 'p-6' : 'container mx-auto px-4 py-8'}`}>
        {isSidebar && onClose && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl">Shopping Cart</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-6">
            Add some products to get started
          </p>
          <Button onClick={onContinueShopping}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isSidebar ? 'p-6 h-full flex flex-col' : 'container mx-auto px-4 py-8'}`}>
      {isSidebar && onClose && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Shopping Cart ({items.length})</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {!isSidebar && (
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">{items.length} items in your cart</p>
        </div>
      )}

      <div className={`${isSidebar ? 'flex-1 overflow-auto' : ''}`}>
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`} className="p-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                  <ImageWithFallback
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm line-clamp-2">{item.product.name}</h3>
                      <div className="text-xs text-muted-foreground space-x-2">
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(index)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                        className="h-8 w-8"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                        className="h-8 w-8"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-sm">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      <div className={`${isSidebar ? 'mt-6 border-t pt-6' : 'mt-8'}`}>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {shipping > 0 && (
              <p className="text-xs text-muted-foreground">
                Add ${(50 - subtotal).toFixed(2)} more for free shipping
              </p>
            )}
          </div>

          <div className="space-y-3 mt-6">
            <Button onClick={onCheckout} className="w-full" size="lg">
              Proceed to Checkout
            </Button>
            <Button variant="outline" onClick={onContinueShopping} className="w-full">
              Continue Shopping
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}