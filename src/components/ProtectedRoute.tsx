
import { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute = ({ 
  redirectPath = "/auth/sign-in" 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate(redirectPath);
    }
  }, [loading, user, navigate, redirectPath]);
  
  // While checking auth state, show nothing
  if (loading) {
    return <div className="min-h-screen bg-darkBg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-goldAccent"></div>
    </div>;
  }
  
  // If not authenticated, redirect to sign-in
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
