
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container p-6 mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
