
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FilePlus, ShoppingCart, Users } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <FilePlus size={20} />
              Templates Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Create and manage calendar templates for customers.</p>
            <Button onClick={() => navigate("/admin/templates")}>
              Manage Templates
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <ShoppingCart size={20} />
              Order Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">View and manage customer orders.</p>
            <Button onClick={() => navigate("/admin/orders")}>
              View Orders
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Users size={20} />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Manage user accounts and permissions.</p>
            <Button onClick={() => navigate("/admin/users")}>
              Manage Users
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
