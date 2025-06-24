
import React, { useState, useEffect } from "react";
import { getUsersWithRoles, assignRole, removeRole, inviteAdmin } from "@/services/userService";
import { UserTable } from "./UserTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Enums } from "@/integrations/supabase/types";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const currentUserId = ""; // Could get from context if needed

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsersWithRoles();
      setUsers(data);
    } catch (e) {
      toast.error("Failed to load users");
    }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleInvite = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await inviteAdmin(email);
      toast.success("User invited! They will get an email with instructions.");
      setEmail("");
      loadUsers();
    } catch (e) {
      toast.error("Failed to invite: " + (e as Error).message);
    }
    setLoading(false);
  };

  const handleAssignRole = async (userId: string, role: Enums<"app_role">) => {
    setLoading(true);
    try {
      await assignRole(userId, role);
      toast.success("Role assigned");
      loadUsers();
    } catch (e) {
      toast.error("Assign failed: " + (e as Error).message);
    }
    setLoading(false);
  };

  const handleRemoveRole = async (roleId: string) => {
    setLoading(true);
    try {
      await removeRole(roleId);
      toast.success("Role removed");
      loadUsers();
    } catch (e) {
      toast.error("Remove failed: " + (e as Error).message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h2>
      
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invite New Admin</h3>
        <div className="flex gap-3 items-center">
          <Input
            type="email"
            placeholder="Enter email address"
            className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Button onClick={handleInvite} disabled={loading || !email}>
            {loading ? "Inviting..." : "Invite Admin"}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        {loading && !users.length ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-300">Loading users...</div>
        ) : (
          <UserTable
            users={users}
            onAssignRole={handleAssignRole}
            onRemoveRole={handleRemoveRole}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  );
};

export default UserManagement;
