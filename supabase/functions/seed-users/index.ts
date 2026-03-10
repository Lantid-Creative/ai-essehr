import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const PASSWORD = "Test1234!";

  // 1. Create a demo facility
  const { data: facility, error: facErr } = await supabaseAdmin
    .from("facilities")
    .insert({
      name: "Demo General Hospital",
      facility_type: "hospital",
      facility_code: "DGH-001",
      region: "FCT",
      district: "Abuja Municipal",
      address: "123 Health Avenue, Garki, Abuja",
      phone: "+234-800-DEMO",
      email: "demo@aiess.health",
      status: "active",
      bed_count: 120,
    })
    .select()
    .single();

  if (facErr && !facErr.message.includes("duplicate")) {
    return new Response(JSON.stringify({ error: facErr.message }), { status: 500, headers: corsHeaders });
  }

  const facilityId = facility?.id;

  const seedUsers = [
    { email: "admin@aiess.test", name: "Fatima Bello", role: "facility_admin", job: "Facility Administrator", dept: "Administration" },
    { email: "doctor@aiess.test", name: "Dr. Chidi Okonkwo", role: "doctor", job: "General Practitioner", dept: "Outpatient" },
    { email: "nurse@aiess.test", name: "Amina Yusuf", role: "nurse", job: "Senior Nurse", dept: "Nursing" },
    { email: "chew@aiess.test", name: "Bala Mohammed", role: "chew", job: "Community Health Worker", dept: "Community Health" },
    { email: "labtech@aiess.test", name: "Grace Adeyemi", role: "lab_tech", job: "Laboratory Technician", dept: "Laboratory" },
    { email: "pharmacist@aiess.test", name: "Emeka Nwachukwu", role: "pharmacist", job: "Chief Pharmacist", dept: "Pharmacy" },
    { email: "clerk@aiess.test", name: "Hauwa Ibrahim", role: "data_clerk", job: "Data Entry Clerk", dept: "Records" },
    { email: "epi@aiess.test", name: "Dr. Ngozi Eze", role: "epidemiologist", job: "State Epidemiologist", dept: "Epidemiology" },
    { email: "dsno@aiess.test", name: "Dr. Yemi Adesina", role: "dsno", job: "Disease Surveillance Officer", dept: "Surveillance" },
    { email: "super@aiess.test", name: "Prof. Abdullahi Musa", role: "super_admin", job: "Platform Administrator", dept: "NCDC HQ" },
  ];

  const results: { email: string; status: string }[] = [];

  for (const u of seedUsers) {
    // Create auth user
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: u.name },
    });

    if (authErr) {
      if (authErr.message.includes("already been registered")) {
        results.push({ email: u.email, status: "already exists" });
        continue;
      }
      results.push({ email: u.email, status: `auth error: ${authErr.message}` });
      continue;
    }

    const userId = authData.user.id;

    // Update profile with facility + job info
    await supabaseAdmin
      .from("profiles")
      .update({
        full_name: u.name,
        facility_id: ["epidemiologist", "dsno", "super_admin"].includes(u.role) ? null : facilityId,
        job_title: u.job,
        department: u.dept,
      })
      .eq("id", userId);

    // Assign role
    await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      role: u.role,
      facility_id: ["epidemiologist", "dsno", "super_admin"].includes(u.role) ? null : facilityId,
    });

    results.push({ email: u.email, status: "created" });
  }

  return new Response(
    JSON.stringify({ facilityId, password: PASSWORD, users: results }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
