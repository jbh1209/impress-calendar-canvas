
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import NotFound from "@/pages/NotFound";
import ShutterstockPage from "@/pages/ShutterstockPage";

import CustomerOrders from "@/pages/CustomerOrders";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ProductManagement from "@/pages/admin/ProductManagement";
import ProductCatalog from "@/pages/admin/ProductCatalog";
import TemplateManagement from "@/pages/admin/TemplateManagement";
import UserManagement from "@/pages/admin/UserManagement";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminLayout from "@/layouts/AdminLayout";
import AuthLayout from "@/layouts/AuthLayout";

function App() {
  return (
    <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            
            
            {/* Auth Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="signin" element={<SignIn />} />
              <Route path="signup" element={<SignUp />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
            </Route>
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/shutterstock" element={<ShutterstockPage />} />
              <Route path="/orders" element={<CustomerOrders />} />
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route
                index
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="products"
                element={
                  <AdminProtectedRoute>
                    <ProductManagement />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="catalog"
                element={
                  <AdminProtectedRoute>
                    <ProductCatalog />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="templates"
                element={
                  <AdminProtectedRoute>
                    <TemplateManagement />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <AdminProtectedRoute>
                    <UserManagement />
                  </AdminProtectedRoute>
                }
              />
            </Route>
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
  );
}

export default App;
