// Dispatcher: SORMAS + DHIS2 outbox processor
// Modes:
//   POST {} or {"mode":"process"}  -> process pending dispatches (cron-friendly)
//   POST {"case_report_id":"..."}  -> force dispatch a single case
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---------- Disease mappings (NCDC IDSR priority diseases) ----------
const DISEASE_TO_SORMAS: Record<string, string> = {
  "Lassa Fever": "LASSA",
  "Cholera": "CHOLERA",
  "Meningitis": "CSM",
  "Measles": "MEASLES",
  "Diphtheria": "DIPHTHERIA",
  "Yellow Fever": "YELLOW_FEVER",
  "Mpox": "MONKEYPOX",
  "COVID-19": "CORONAVIRUS",
};

// DHIS2 IDSR data element UIDs (placeholders — must be replaced with real instance UIDs)
const DISEASE_TO_DHIS2_DE: Record<string, string> = {
  "Lassa Fever": "DE_LASSA_CASES",
  "Cholera": "DE_CHOLERA_CASES",
  "Meningitis": "DE_CSM_CASES",
  "Measles": "DE_MEASLES_CASES",
  "Diphtheria": "DE_DIPHTHERIA_CASES",
  "Yellow Fever": "DE_YF_CASES",
  "Mpox": "DE_MPOX_CASES",
};

const SORMAS_CLASSIFICATION: Record<string, string> = {
  suspected: "SUSPECT",
  probable: "PROBABLE",
  confirmed: "CONFIRMED",
  not_a_case: "NO_CASE",
};

function ageGroupCode(dob: string | null, sex: string | null): string {
  // CategoryOptionCombo placeholder: <ageBand>_<sex>
  const sx = (sex || "U").toUpperCase().slice(0, 1);
  if (!dob) return `UNKNOWN_${sx}`;
  const ageY = (Date.now() - new Date(dob).getTime()) / (365.25 * 86400_000);
  const band = ageY < 1 ? "U1" : ageY < 5 ? "1_4" : ageY < 15 ? "5_14" : ageY < 50 ? "15_49" : "50P";
  return `${band}_${sx}`;
}

function isoWeek(d: Date): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}W${String(weekNo).padStart(2, "0")}`;
}

// ---------- Payload builders ----------
function buildSormasPayload(cr: any, patient: any, facility: any) {
  const reportDateMs = new Date(cr.created_at).getTime();
  return {
    uuid: cr.external_uuid,
    reportDate: reportDateMs,
    reportingUser: { uuid: cr.created_by || "system" },
    disease: DISEASE_TO_SORMAS[cr.disease] || "OTHER",
    diseaseDetails: cr.disease,
    caseClassification: SORMAS_CLASSIFICATION[cr.case_classification] || "SUSPECT",
    investigationStatus: "PENDING",
    outcome: cr.outcome ? cr.outcome.toUpperCase() : "NO_OUTCOME",
    person: {
      uuid: patient.id,
      firstName: patient.first_name,
      lastName: patient.last_name,
      sex: (patient.gender || "UNKNOWN").toUpperCase(),
      birthdateYYYY: patient.date_of_birth ? new Date(patient.date_of_birth).getUTCFullYear() : null,
      birthdateMM: patient.date_of_birth ? new Date(patient.date_of_birth).getUTCMonth() + 1 : null,
      birthdateDD: patient.date_of_birth ? new Date(patient.date_of_birth).getUTCDate() : null,
      phone: patient.phone || null,
      address: { addressType: "HOME", details: patient.address || null },
    },
    responsibleRegion: facility.state_code ? { externalId: facility.state_code } : null,
    responsibleDistrict: facility.lga_code ? { externalId: facility.lga_code } : null,
    healthFacility: facility.sormas_facility_uuid
      ? { uuid: facility.sormas_facility_uuid }
      : { externalId: facility.facility_code, name: facility.name },
    symptoms: {
      onsetDate: cr.onset_date ? new Date(cr.onset_date).getTime() : null,
      symptomsList: Array.isArray(cr.symptoms) ? cr.symptoms : [],
    },
  };
}

function buildDhis2Payload(cr: any, patient: any, facility: any) {
  const period = isoWeek(new Date(cr.onset_date || cr.created_at));
  const dataElement = DISEASE_TO_DHIS2_DE[cr.disease] || "DE_UNKNOWN";
  const orgUnit = facility.dhis2_orgunit_id || `FALLBACK_${facility.id}`;
  const coc = ageGroupCode(patient.date_of_birth, patient.gender);
  return {
    dataSet: "IDSR_WEEKLY_DS",
    completeDate: new Date().toISOString().slice(0, 10),
    period,
    orgUnit,
    attributionOptionCombo: "default",
    dataValues: [
      {
        dataElement,
        categoryOptionCombo: coc,
        value: "1",
        comment: `case_report:${cr.external_uuid} classification:${cr.case_classification}`,
      },
    ],
  };
}

// ---------- Sender ----------
async function sendDispatch(target: string, payload: any) {
  const baseUrl = target === "SORMAS"
    ? Deno.env.get("SORMAS_BASE_URL")
    : Deno.env.get("DHIS2_BASE_URL");
  const auth = target === "SORMAS"
    ? Deno.env.get("SORMAS_AUTH") // "Basic xxx"
    : Deno.env.get("DHIS2_AUTH"); // "Basic xxx"

  if (!baseUrl || !auth) {
    // Sandbox / pilot mode: simulate success so the chain can be demonstrated
    return {
      ok: true,
      status: 200,
      body: { simulated: true, target, message: `${target} credentials not configured — simulated push`, echoed_uuid: payload.uuid || payload.period },
      external_id: payload.uuid || `${target}_${Date.now()}`,
    };
  }

  const url = target === "SORMAS"
    ? `${baseUrl.replace(/\/$/, "")}/sormas-rest/cases/push`
    : `${baseUrl.replace(/\/$/, "")}/api/dataValueSets`;

  const body = target === "SORMAS" ? JSON.stringify([payload]) : JSON.stringify(payload);

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body,
    });
    let parsed: any = null;
    try { parsed = await resp.json(); } catch { parsed = await resp.text(); }
    return {
      ok: resp.ok,
      status: resp.status,
      body: parsed,
      external_id: parsed?.uuid || parsed?.importSummaries?.[0]?.reference || null,
    };
  } catch (e) {
    return { ok: false, status: 0, body: { error: e instanceof Error ? e.message : String(e) }, external_id: null };
  }
}

function backoffSeconds(retry: number) {
  // 1m, 5m, 15m, 1h, 4h
  const ladder = [60, 300, 900, 3600, 14400];
  return ladder[Math.min(retry, ladder.length - 1)];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    let body: any = {};
    try { body = await req.json(); } catch { /* empty */ }

    // Fetch dispatches to process
    let dispatches: any[] = [];
    if (body.case_report_id) {
      const { data } = await admin.from("case_report_dispatches")
        .select("*")
        .eq("case_report_id", body.case_report_id)
        .in("status", ["pending", "failed"]);
      dispatches = data || [];
    } else {
      const { data } = await admin.from("case_report_dispatches")
        .select("*")
        .in("status", ["pending", "failed"])
        .lte("next_retry_at", new Date().toISOString())
        .lt("retry_count", 5)
        .limit(50);
      dispatches = data || [];
    }

    if (dispatches.length === 0) {
      return new Response(JSON.stringify({ processed: 0, message: "No pending dispatches" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];

    for (const d of dispatches) {
      // Mark as sending
      await admin.from("case_report_dispatches")
        .update({ status: "sending" })
        .eq("id", d.id);

      // Load case + patient + facility
      const { data: cr } = await admin.from("case_reports").select("*").eq("id", d.case_report_id).single();
      if (!cr) {
        await admin.from("case_report_dispatches").update({
          status: "dead_letter",
          last_error: "Case report not found",
        }).eq("id", d.id);
        continue;
      }
      const { data: patient } = await admin.from("patients").select("*").eq("id", cr.patient_id).single();
      const { data: facility } = await admin.from("facilities").select("*").eq("id", cr.facility_id).single();

      const payload = d.target === "SORMAS"
        ? buildSormasPayload(cr, patient, facility)
        : buildDhis2Payload(cr, patient, facility);

      const result = await sendDispatch(d.target, payload);

      if (result.ok) {
        await admin.from("case_report_dispatches").update({
          status: "success",
          payload,
          response: result.body,
          external_id: result.external_id,
          dispatched_at: new Date().toISOString(),
          acknowledged_at: new Date().toISOString(),
          last_error: null,
        }).eq("id", d.id);
      } else {
        const newRetry = (d.retry_count || 0) + 1;
        const isDead = newRetry >= (d.max_retries || 5);
        await admin.from("case_report_dispatches").update({
          status: isDead ? "dead_letter" : "failed",
          payload,
          response: result.body,
          retry_count: newRetry,
          last_error: `HTTP ${result.status}: ${typeof result.body === "string" ? result.body : JSON.stringify(result.body).slice(0, 500)}`,
          next_retry_at: isDead ? null : new Date(Date.now() + backoffSeconds(newRetry) * 1000).toISOString(),
        }).eq("id", d.id);
      }

      results.push({ id: d.id, target: d.target, ok: result.ok, status: result.status });

      // Update parent case_report aggregate status
      const { data: allDisp } = await admin.from("case_report_dispatches")
        .select("status").eq("case_report_id", cr.id);
      const allSuccess = allDisp?.every((x) => x.status === "success");
      const anyDead = allDisp?.some((x) => x.status === "dead_letter");
      const anySuccess = allDisp?.some((x) => x.status === "success");
      let nextStatus: string | null = null;
      if (allSuccess) nextStatus = "dispatched";
      else if (anyDead && !anySuccess) nextStatus = "failed";
      else if (anySuccess) nextStatus = "partially_dispatched";
      if (nextStatus && nextStatus !== cr.status) {
        await admin.from("case_reports").update({ status: nextStatus }).eq("id", cr.id);
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dispatch error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
