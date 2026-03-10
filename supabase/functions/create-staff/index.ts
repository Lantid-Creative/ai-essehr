import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    // Verify caller is facility_admin or super_admin
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: caller } } = await supabaseUser.auth.getUser();
    if (!caller) throw new Error("Unauthorized");

    const { data: callerRoles } = await supabaseUser.from("user_roles").select("role").eq("user_id", caller.id);
    const roles = (callerRoles || []).map((r: any) => r.role);
    if (!roles.includes("facility_admin") && !roles.includes("super_admin")) {
      throw new Error("Insufficient permissions");
    }

    const { email, password, full_name, role, job_title, facility_id } = await req.json();
    if (!email || !password || !full_name || !role || !facility_id) {
      throw new Error("Missing required fields");
    }

    // Use service role to create user without switching session
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });
    if (authError) throw authError;

    const newUserId = authData.user.id;

    // Update profile with facility and job title
    await supabaseAdmin.from("profiles").update({
      facility_id,
      job_title: job_title || null,
    }).eq("id", newUserId);

    // Assign role
    await supabaseAdmin.from("user_roles").insert({
      user_id: newUserId,
      role,
      facility_id,
    });

    return new Response(JSON.stringify({ success: true, user_id: newUserId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
