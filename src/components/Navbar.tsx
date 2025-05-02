
import { ShoppingCart, User, LogOut, Menu, X, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="bg-darkBg border-b border-darkBorder py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-white font-semibold text-xl">
            Impress Web
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/products">Products</NavLink>
          <NavLink href="/templates">Templates</NavLink>
          <NavLink href="/about">About Us</NavLink>
          <NavLink href="/contact">Contact</NavLink>
          {user && <NavLink href="/shutterstock">Stock Images</NavLink>}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            className="text-white p-2" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <button className="p-1 text-gray-300 hover:text-white transition-colors">
            <ShoppingCart className="h-5 w-5" />
          </button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-1 text-gray-300 hover:text-white transition-colors">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-darkSecondary border-darkBorder text-white">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">Signed in as</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-darkBorder" />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer hover:bg-darkBg focus:bg-darkBg">
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="cursor-pointer hover:bg-darkBg focus:bg-darkBg">
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/shutterstock" className="cursor-pointer hover:bg-darkBg focus:bg-darkBg">
                    <Image className="mr-2 h-4 w-4" /> Stock Images
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-darkBorder" />
                <DropdownMenuItem 
                  onClick={() => signOut()} 
                  className="cursor-pointer hover:bg-darkBg focus:bg-darkBg"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="gold-button">
              <Link to="/auth/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-darkSecondary mt-2 py-4 px-4 border-t border-darkBorder">
          <div className="flex flex-col space-y-4">
            <NavLink href="/" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
            <NavLink href="/products" onClick={() => setMobileMenuOpen(false)}>Products</NavLink>
            <NavLink href="/templates" onClick={() => setMobileMenuOpen(false)}>Templates</NavLink>
            <NavLink href="/about" onClick={() => setMobileMenuOpen(false)}>About Us</NavLink>
            <NavLink href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</NavLink>
            {user && <NavLink href="/shutterstock" onClick={() => setMobileMenuOpen(false)}>Stock Images</NavLink>}
            
            <div className="pt-2 border-t border-darkBorder">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white transition-colors">
                    Profile Settings
                  </Link>
                  <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white transition-colors">
                    My Orders
                  </Link>
                  <button 
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }} 
                    className="flex items-center py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Button asChild className="w-full gold-button">
                  <Link to="/auth/sign-in" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => {
  return (
    <Link 
      to={href} 
      className="text-gray-300 hover:text-white transition-colors"
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default Navbar;
