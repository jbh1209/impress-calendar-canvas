
import { supabase } from "@/integrations/supabase/client";

export async function getUsersWithRoles() {
  // Join users (auth.users) with user_roles and profiles
  let { data, error } = await supabase
    .from("user_roles")
    .select("user_id,role,profiles:profiles(id,full_name,avatar_url,username),users:auth.users(email)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function assignRole(userId: string, role: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .insert({ user_id: userId, role });
  if (error) throw error;
  return data;
}

export async function removeRole(roleId: string) {
  const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
  if (error) throw error;
}

// More advanced: admin invite user via email
export async function inviteAdmin(email: string) {
  // Supabase admin invites require you to send a password reset link after invite.  
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
  if (error) throw error;
  return data;
}
