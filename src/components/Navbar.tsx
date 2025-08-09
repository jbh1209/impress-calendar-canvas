import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Search, ShoppingBag, User, Menu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import CartSheet from "@/components/cart/CartSheet";

const Navbar = () => {
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: cart } = await supabase
        .from('carts' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      if (!cart) return;
      const { count } = await supabase
        .from('cart_items' as any)
        .select('*', { count: 'exact', head: true })
        .eq('cart_id', (cart as any).id);
      setCartItemCount(count || 0);
    })();
  }, []);

  const onNavigateHome = () => navigate("/");
  const onNavigateProducts = () => navigate("/products");
  const onOpenCart = () => navigate("/cart");

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40">
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm">
        Free shipping on orders over R500 • 30-day returns
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
            <button onClick={onNavigateHome} className="text-2xl tracking-tight hover:opacity-80 transition-opacity">
              Impress Calendars
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={onNavigateHome} className="hover:text-primary transition-colors">Home</button>
            <button onClick={onNavigateProducts} className="hover:text-primary transition-colors">Shop</button>
            <Link to="/collections" className="hover:text-primary transition-colors">Collections</Link>
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </nav>

          {/* Search */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search products..." className="pl-10" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>
            <Link to="/auth/signin">
              <Button variant="ghost" size="icon" aria-label="Account">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Button>
            <CartSheet>
              <Button variant="ghost" size="icon" className="relative" aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </CartSheet>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="lg:hidden px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search products..." className="pl-10" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
