
import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/admin/AppSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <AdminHeader />
          <div className="container p-6 mx-auto">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;

