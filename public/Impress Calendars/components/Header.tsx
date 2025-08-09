import { Search, ShoppingBag, User, Menu, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface HeaderProps {
  cartItemCount: number;
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onNavigateCart: () => void;
  onOpenCart: () => void;
}

export function Header({ 
  cartItemCount, 
  onNavigateHome, 
  onNavigateProducts, 
  onNavigateCart,
  onOpenCart 
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-border sticky top-0 z-40">
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm">
        Free shipping on orders over $50 • 30-day returns
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <button onClick={onNavigateHome} className="text-2xl tracking-tight hover:opacity-80 transition-opacity">
              STOREFRONT
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={onNavigateHome} className="hover:text-primary transition-colors">
              Home
            </button>
            <button onClick={onNavigateProducts} className="hover:text-primary transition-colors">
              Shop
            </button>
            <button className="hover:text-primary transition-colors">
              Collections
            </button>
            <button className="hover:text-primary transition-colors">
              About
            </button>
            <button className="hover:text-primary transition-colors">
              Contact
            </button>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 bg-input-background border-0"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Search className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="relative" onClick={onOpenCart}>
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-10 bg-input-background border-0"
          />
        </div>
      </div>
    </header>
  );
}