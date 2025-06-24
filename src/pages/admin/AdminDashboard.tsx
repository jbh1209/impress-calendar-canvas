
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FilePlus, ShoppingCart, Users } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-3 text-gray-900 dark:text-white">
              <FilePlus size={24} className="text-blue-600" />
              Templates Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">Create and manage calendar templates for customers.</p>
            <Button onClick={() => navigate("/admin/templates")} className="w-full">
              Manage Templates
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-3 text-gray-900 dark:text-white">
              <ShoppingCart size={24} className="text-green-600" />
              Order Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">View and manage customer orders.</p>
            <Button onClick={() => navigate("/admin/orders")} className="w-full">
              View Orders
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-3 text-gray-900 dark:text-white">
              <Users size={24} className="text-purple-600" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">Manage user accounts and permissions.</p>
            <Button onClick={() => navigate("/admin/users")} className="w-full">
              Manage Users
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
