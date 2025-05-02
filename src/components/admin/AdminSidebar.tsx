
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  FilePlus, 
  ShoppingCart, 
  Users, 
  LogOut,
  Home
} from "lucide-react";

const AdminSidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/sign-in");
  };

  const navLinks = [
    { to: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { to: "/admin/templates", label: "Templates", icon: <FilePlus size={20} /> },
    { to: "/admin/orders", label: "Orders", icon: <ShoppingCart size={20} /> },
    { to: "/admin/users", label: "Users", icon: <Users size={20} /> },
  ];

  return (
    <div className="min-h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-4">
        <h1 className="text-xl font-bold text-sidebar-primary">Impress Admin</h1>
      </div>
      <div className="px-3 py-2">
        <NavLink to="/">
          <Button variant="ghost" className="w-full justify-start mb-1">
            <Home size={20} className="mr-2" />
            Back to Site
          </Button>
        </NavLink>
      </div>
      <nav className="mt-4">
        <ul className="space-y-1 px-3">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50"
                  }`
                }
                end={link.to === "/admin"}
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="absolute bottom-0 w-64 p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          onClick={handleSignOut}
        >
          <LogOut size={20} className="mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
