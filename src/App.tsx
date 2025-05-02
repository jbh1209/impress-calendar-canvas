
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import ShutterstockPage from "./pages/ShutterstockPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TemplateManagement from "./pages/admin/TemplateManagement";
import TemplateEditor from "./pages/admin/TemplateEditor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth/sign-in" element={<SignIn />} />
            <Route path="/auth/sign-up" element={<SignUp />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Index />} /> {/* Placeholder for profile page */}
              <Route path="/orders" element={<Index />} /> {/* Placeholder for orders page */}
              <Route path="/shutterstock" element={<ShutterstockPage />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="templates" element={<TemplateManagement />} />
                <Route path="templates/create" element={<TemplateEditor />} />
                <Route path="templates/edit/:id" element={<TemplateEditor />} />
              </Route>
            </Route>
            
            {/* Default placeholder routes */}
            <Route path="/templates" element={<Index />} />
            <Route path="/design" element={<Index />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
