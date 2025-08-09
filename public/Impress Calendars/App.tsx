import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { ProductListing } from './components/ProductListing';
import { ProductDetail } from './components/ProductDetail';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  description: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  colors?: string[];
  sizes?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

type Page = 'home' | 'products' | 'product' | 'cart' | 'checkout';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product, quantity: number = 1, color?: string, size?: string) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => 
        item.product.id === product.id && 
        item.selectedColor === color && 
        item.selectedSize === size
      );

      if (existingItem) {
        return prev.map(item =>
          item === existingItem
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { product, quantity, selectedColor: color, selectedSize: size }];
    });
  };

  const removeFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }

    setCartItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity } : item
      )
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const navigateToProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage onNavigateToProducts={() => setCurrentPage('products')} onNavigateToProduct={navigateToProduct} />;
      case 'products':
        return <ProductListing onNavigateToProduct={navigateToProduct} />;
      case 'product':
        return selectedProduct ? (
          <ProductDetail 
            product={selectedProduct} 
            onAddToCart={addToCart}
            onBack={() => setCurrentPage('products')}
          />
        ) : null;
      case 'cart':
        return (
          <Cart
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onCheckout={() => setCurrentPage('checkout')}
            onContinueShopping={() => setCurrentPage('products')}
          />
        );
      case 'checkout':
        return (
          <Checkout
            items={cartItems}
            total={getTotalPrice()}
            onBack={() => setCurrentPage('cart')}
          />
        );
      default:
        return <LandingPage onNavigateToProducts={() => setCurrentPage('products')} onNavigateToProduct={navigateToProduct} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        cartItemCount={getTotalItems()}
        onNavigateHome={() => setCurrentPage('home')}
        onNavigateProducts={() => setCurrentPage('products')}
        onNavigateCart={() => setCurrentPage('cart')}
        onOpenCart={() => setIsCartOpen(true)}
      />
      
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      <Footer />

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsCartOpen(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-96 bg-white shadow-lg transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <Cart
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={() => {
                setIsCartOpen(false);
                setCurrentPage('checkout');
              }}
              onContinueShopping={() => setIsCartOpen(false)}
              isSidebar={true}
              onClose={() => setIsCartOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}