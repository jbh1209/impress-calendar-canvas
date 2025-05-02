
import { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute = ({ 
  redirectPath = "/auth/sign-in" 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
        variant: "destructive",
      });
      navigate(redirectPath);
    }
  }, [loading, user, navigate, redirectPath, toast]);
  
  // While checking auth state, show loading spinner
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
