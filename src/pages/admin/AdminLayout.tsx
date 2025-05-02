
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container p-4 mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
