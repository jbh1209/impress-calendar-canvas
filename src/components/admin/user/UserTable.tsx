
import React from "react";
import { RoleBadge } from "./RoleBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Enums } from "@/integrations/supabase/types";

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
  onAssignRole: (userId: string, role: Enums<"app_role">) => void;
  onRemoveRole: (roleRowId: string) => void;
  currentUserId: string;
};

export const UserTable: React.FC<UserTableProps> = ({ users, onAssignRole, onRemoveRole, currentUserId }) => (
  <div className="p-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Users</h3>
    {users.length === 0 ? (
      <div className="text-center py-8 text-gray-600 dark:text-gray-300">
        No users found
      </div>
    ) : (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 dark:border-gray-700">
              <TableHead className="font-semibold text-gray-900 dark:text-white">Name</TableHead>
              <TableHead className="text-gray-900 dark:text-white">Email</TableHead>
              <TableHead className="text-gray-900 dark:text-white">Username</TableHead>
              <TableHead className="text-gray-900 dark:text-white">Role</TableHead>
              <TableHead className="text-gray-900 dark:text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u, idx) => (
              <TableRow key={idx} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <TableCell className="text-gray-900 dark:text-white">
                  {u.profiles?.full_name || u.profiles?.username || u.users?.email}
                </TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{u.users?.email}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{u.profiles?.username || "-"}</TableCell>
                <TableCell><RoleBadge role={u.role} /></TableCell>
                <TableCell>
                  {u.user_id !== currentUserId && (
                    <div className="flex gap-2">
                      {u.role !== "admin" && (
                        <Button size="sm" variant="secondary" onClick={() => onAssignRole(u.user_id, "admin")} className="text-sm">
                          Make Admin
                        </Button>
                      )}
                      {u.role !== "user" && (
                        <Button size="sm" variant="outline" onClick={() => onAssignRole(u.user_id, "user")} className="text-sm">
                          Revoke Admin
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => onRemoveRole(u.id!)} className="text-sm">
                        Remove Role
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </div>
);
