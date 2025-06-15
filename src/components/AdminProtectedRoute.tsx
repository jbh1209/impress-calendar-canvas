
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUserRoles, anyAdminExists, assignRole } from "@/services/userService";
import { Button } from "@/components/ui/button";

export default function AdminProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [noAdmins, setNoAdmins] = useState(false);
  const queryClient = useQueryClient();

  // Check if any admins exist
  useEffect(() => {
    async function checkAdmins() {
      if (user && !loading) {
        const exists = await anyAdminExists();
        setNoAdmins(!exists);
      }
    }
    checkAdmins();
  }, [user, loading]);

  // Get current user roles if logged in
  const { data: roles, isLoading: rolesLoading, refetch } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: () => (user ? getCurrentUserRoles(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  // Mutation to assign admin to oneself
  const assignSelfAdmin = useMutation({
    mutationFn: async () => {
      // @ts-ignore
      return assignRole(user.id, "admin");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user-roles", user?.id] });
      await queryClient.invalidateQueries({ queryKey: ["user_roles"] });
      refetch();
    },
  });

  if (loading || rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-goldAccent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  // --- No admins exist: allow self-promotion if logged in and not admin already
  if (noAdmins && !(roles || []).includes("admin")) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-center">
        <div className="bg-blue-100 text-blue-700 rounded p-6 shadow animate-in fade-in">
          <div className="text-lg font-bold mb-2">Bootstrap Admin Access Needed</div>
          <div className="mb-4">No administrators exist yet for this project.<br />You can promote yourself as the first admin.</div>
          <Button
            onClick={() => assignSelfAdmin.mutate()}
            disabled={assignSelfAdmin.isLoading}
            className="mt-2"
          >
            {assignSelfAdmin.isLoading ? "Promoting..." : "Make me the first Admin"}
          </Button>
          {assignSelfAdmin.isError && (
            <div className="text-red-600 mt-2 text-sm">
              Failed: {(assignSelfAdmin.error as Error)?.message}
            </div>
          )}
          {assignSelfAdmin.isSuccess && (
            <div className="text-green-600 mt-2 text-sm">
              Success! Please refresh or retry admin actions.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Not admin and admins already exist
  if (!noAdmins && !(roles || []).includes("admin")) {
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
