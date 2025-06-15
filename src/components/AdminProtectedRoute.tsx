
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserRoles } from "@/services/userService";

export default function AdminProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Wait for auth to load
  const {
    data: roles,
    isLoading: rolesLoading,
    error,
  } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: () => (user ? getCurrentUserRoles(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  if (loading || rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-goldAccent" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  // Authenticated but not admin
  if (!(roles || []).includes("admin")) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-center">
        <div className="bg-red-100 text-red-600 rounded p-6 shadow">
          <div className="text-lg font-bold mb-2">Access Denied</div>
          <div>You must be an admin to access this section.</div>
        </div>
      </div>
    );
  }

  // Admin - show children or <Outlet />
  return children ? <>{children}</> : <Outlet />;
}
