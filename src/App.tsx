
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import ShutterstockPage from "@/pages/ShutterstockPage";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import TemplateManagement from "@/pages/admin/TemplateManagement";
import TemplateEditor from "@/pages/admin/TemplateEditor";
import ProductCatalog from "@/pages/admin/ProductCatalog";
import ProductManagement from "@/pages/admin/ProductManagement";
import AdminLayout from "@/layouts/AdminLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Update routes to include product management
const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <NotFound />,
  },
  {
    path: "shutterstock",
    element: <ShutterstockPage />,
  },
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      {
        path: "signin",
        element: <SignIn />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
    ],
  },
  {
    path: "admin",
    element: <AdminLayout />,
    children: [
      {
        path: "",
        element: <AdminDashboard />,
      },
      {
        path: "templates",
        element: <TemplateManagement />,
      },
      {
        path: "templates/:templateId",
        element: <TemplateEditor />,
      },
      {
        path: "products",
        element: <ProductCatalog />,
      },
      {
        path: "products/new",
        element: <ProductManagement />,
      },
      {
        path: "products/:productId",
        element: <ProductManagement />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
