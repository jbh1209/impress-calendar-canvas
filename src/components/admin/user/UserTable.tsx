
import React from "react";
import { RoleBadge } from "./RoleBadge";
import { Button } from "@/components/ui/button";

type User = {
  user_id: string;
  role: string;
  profiles: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  users: { email: string } | null;
  id?: string; // role row id
};

type UserTableProps = {
  users: User[];
  onAssignRole: (userId: string, role: string) => void;
  onRemoveRole: (roleRowId: string) => void;
  currentUserId: string;
};

export const UserTable: React.FC<UserTableProps> = ({ users, onAssignRole, onRemoveRole, currentUserId }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm">
      <thead>
        <tr>
          <th className="font-semibold py-2">Name</th>
          <th>Email</th>
          <th>Username</th>
          <th>Role</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {users.map((u, idx) => (
          <tr key={idx} className="border-t">
            <td>{u.profiles?.full_name || u.profiles?.username || u.users?.email}</td>
            <td>{u.users?.email}</td>
            <td>{u.profiles?.username}</td>
            <td><RoleBadge role={u.role} /></td>
            <td>
              {u.user_id !== currentUserId && (
                <div className="flex gap-2">
                  {u.role !== "admin" && (
                    <Button size="sm" variant="secondary" onClick={() => onAssignRole(u.user_id, "admin")}>Make Admin</Button>
                  )}
                  {u.role !== "user" && (
                    <Button size="sm" variant="outline" onClick={() => onAssignRole(u.user_id, "user")}>Revoke Admin</Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => onRemoveRole(u.id!)}>Remove Role</Button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
