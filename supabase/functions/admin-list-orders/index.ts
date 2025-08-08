
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Authenticate and authorize admin
    const token = req.headers.get("Authorization")?.replace("Bearer ", "") || "";
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { data: isAdminRes, error: roleErr } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });

    if (roleErr || !isAdminRes) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const { page = 1, limit = 20, status } = await req.json().catch(() => ({ page: 1, limit: 20 }));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("orders")
      .select("id,user_id,total_amount,status,created_at,updated_at,pdf_url", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: orders, error, count } = await query;
    if (error) throw error;

    return new Response(
      JSON.stringify({ items: orders ?? [], total: count ?? 0, page, limit }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
