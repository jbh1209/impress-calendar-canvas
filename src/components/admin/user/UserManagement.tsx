
import React, { useState, useEffect } from "react";
import { getUsersWithRoles, assignRole, removeRole, inviteAdmin } from "@/services/userService";
import { UserTable } from "./UserTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

  const handleAssignRole = async (userId: string, role: string) => {
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
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <div className="flex mb-6 items-center gap-2">
        <input
          type="email"
          placeholder="Invite new admin by email"
          className="input px-2 py-1 border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Button onClick={handleInvite} disabled={loading || !email}>Invite Admin</Button>
      </div>
      {loading ? <div>Loading…</div> :
        <UserTable
          users={users}
          onAssignRole={handleAssignRole}
          onRemoveRole={handleRemoveRole}
          currentUserId={currentUserId}
        />}
    </div>
  );
};

export default UserManagement;
