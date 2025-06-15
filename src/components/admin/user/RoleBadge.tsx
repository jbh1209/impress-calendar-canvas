
import React from "react";
import { Badge } from "@/components/ui/badge";

const colorMap: Record<string, string> = {
  admin: "bg-green-600 text-white",
  moderator: "bg-blue-600 text-white",
  user: "bg-gray-400 text-white",
};

export const RoleBadge = ({ role }: { role: string }) => (
  <Badge className={colorMap[role] || colorMap["user"]}>{role}</Badge>
);
