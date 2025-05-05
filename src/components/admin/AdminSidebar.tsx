
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileImage,
  CalendarRange,
  ShoppingBag,
  Package,
  Settings,
  Users,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  to,
  icon,
  label,
  isActive,
}) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
      isActive ? "bg-accent" : "transparent"
    )}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const AdminSidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="flex h-screen flex-col border-r">
      <div className="p-4 text-xl font-semibold">Admin Dashboard</div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          <SidebarLink
            to="/admin"
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Overview"
            isActive={path === "/admin"}
          />
          <SidebarLink
            to="/admin/products"
            icon={<ShoppingBag className="h-4 w-4" />}
            label="Products"
            isActive={path.includes("/admin/products")}
          />
          <SidebarLink
            to="/admin/templates"
            icon={<FileImage className="h-4 w-4" />}
            label="Templates"
            isActive={path.includes("/admin/templates")}
          />
          <SidebarLink
            to="/admin/orders"
            icon={<Package className="h-4 w-4" />}
            label="Orders"
            isActive={path.includes("/admin/orders")}
          />
          <SidebarLink
            to="/admin/customers"
            icon={<Users className="h-4 w-4" />}
            label="Customers"
            isActive={path.includes("/admin/customers")}
          />
          <SidebarLink
            to="/admin/analytics"
            icon={<BarChart3 className="h-4 w-4" />}
            label="Analytics"
            isActive={path.includes("/admin/analytics")}
          />
          <SidebarLink
            to="/admin/settings"
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
            isActive={path.includes("/admin/settings")}
          />
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
