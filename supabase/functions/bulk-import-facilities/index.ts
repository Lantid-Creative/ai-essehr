import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FacilityRow {
  name: string;
  facility_type?: string;
  facility_code?: string;
  region?: string;
  district?: string;
  address?: string;
  phone?: string;
  email?: string;
  bed_count?: number;
  latitude?: number;
  longitude?: number;
  auto_approve?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user: caller } } = await supabaseUser.auth.getUser();
    if (!caller) throw new Error("Unauthorized");

    const { data: roles } = await supabaseUser.from("user_roles").select("role").eq("user_id", caller.id);
    const isSuperAdmin = (roles || []).some((r: any) => r.role === "super_admin");
    if (!isSuperAdmin) throw new Error("Only super admins can bulk import facilities");

    const { facilities }: { facilities: FacilityRow[] } = await req.json();
    if (!Array.isArray(facilities) || facilities.length === 0) throw new Error("No facilities provided");
    if (facilities.length > 1000) throw new Error("Maximum 1000 facilities per import");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results: any[] = [];
    let inserted = 0;
    let failed = 0;

    for (const [idx, row] of facilities.entries()) {
      try {
        if (!row.name?.trim()) {
          results.push({ row: idx + 1, name: row.name, status: "error", error: "Missing name" });
          failed++; continue;
        }
        const payload: any = {
          name: row.name.trim(),
          facility_type: row.facility_type || "primary",
          facility_code: row.facility_code || null,
          region: row.region || null,
          district: row.district || null,
          address: row.address || null,
          phone: row.phone || null,
          email: row.email || null,
          bed_count: row.bed_count ? Number(row.bed_count) : 0,
          latitude: row.latitude ? Number(row.latitude) : null,
          longitude: row.longitude ? Number(row.longitude) : null,
          status: row.auto_approve ? "active" : "pending",
        };
        if (row.auto_approve) {
          payload.approved_at = new Date().toISOString();
          payload.approved_by = caller.id;
        }
        const { data, error } = await admin.from("facilities").insert(payload).select("id, name").single();
        if (error) throw error;
        results.push({ row: idx + 1, name: data.name, status: "success", id: data.id });
        inserted++;
      } catch (err: any) {
        results.push({ row: idx + 1, name: row.name, status: "error", error: err.message });
        failed++;
      }
    }

    return new Response(JSON.stringify({ inserted, failed, total: facilities.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
