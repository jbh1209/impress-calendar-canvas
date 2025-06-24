
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import NotFound from "@/pages/NotFound";
import ShutterstockPage from "@/pages/ShutterstockPage";
import CalendarCustomizer from "@/pages/CalendarCustomizer";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import TemplateManagement from "@/pages/admin/TemplateManagement";
import ProductManagement from "@/pages/admin/ProductManagement";
import ProductCatalog from "@/pages/admin/ProductCatalog";
import UserManagement from "@/pages/admin/UserManagement";
import TemplateEditor from "@/pages/admin/TemplateEditor";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminLayout from "@/layouts/AdminLayout";
import AuthLayout from "@/layouts/AuthLayout";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/customize/:templateId" element={<CalendarCustomizer />} />
            
            {/* Auth Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="signin" element={<SignIn />} />
              <Route path="signup" element={<SignUp />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
            </Route>
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/shutterstock" element={<ShutterstockPage />} />
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
                path="templates"
                element={
                  <AdminProtectedRoute>
                    <TemplateManagement />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="templates/:id"
                element={
                  <AdminProtectedRoute>
                    <TemplateEditor />
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
    </QueryClientProvider>
  );
}

export default App;
