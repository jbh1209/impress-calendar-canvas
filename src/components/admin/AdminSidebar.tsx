
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
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
      isActive 
        ? "bg-blue-600 text-white shadow-sm" 
        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
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
    <div className="flex h-screen flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-64">
      <div className="p-4 text-xl font-semibold border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
        Admin Dashboard
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-3 text-sm font-medium gap-2">
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
          <SidebarLink
            to="/admin/users"
            icon={<Users className="h-4 w-4" />}
            label="User Management"
            isActive={path.includes("/admin/users")}
          />
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
