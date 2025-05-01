
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-darkBg border-b border-darkBorder py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-white font-semibold text-xl">
            Impress Web
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/products">Products</NavLink>
          <NavLink href="/templates">Templates</NavLink>
          <NavLink href="/about">About Us</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-1">
            <ShoppingCart className="h-5 w-5" />
          </button>
          <button className="gold-button">Sign In</button>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <Link to={href} className="text-gray-300 hover:text-white transition-colors">
      {children}
    </Link>
  );
};

export default Navbar;
