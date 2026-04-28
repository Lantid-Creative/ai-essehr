import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Encounter {
  id: string;
  facility_id: string | null;
  encounter_date: string;
  chief_complaint: string | null;
  symptoms: any;
  diagnosis: string | null;
  syndromic_flags: any;
  is_syndromic_alert: boolean;
}

interface Cluster {
  key: string;
  facility_id: string | null;
  facility_name?: string;
  region?: string;
  district?: string;
  syndrome: string;
  recent_count: number;
  baseline_mean: number;
  baseline_stddev: number;
  z_score: number;
  sample_complaints: string[];
}

const SYNDROME_PATTERNS: Record<string, RegExp> = {
  "Acute Hemorrhagic Fever": /\b(bleed|haemorrhag|hemorrhag|blood\s*(in|from)|epistaxis|hematem|melena|lassa)\b/i,
  "Acute Watery Diarrhea": /\b(watery\s*diarr|cholera|rice\s*water|profuse\s*diarr|loose\s*stool)\b/i,
  "Acute Bloody Diarrhea": /\b(bloody\s*diarr|dysentery|blood\s*in\s*stool)\b/i,
  "Acute Febrile Illness with Rash": /\b(rash.*(fever|febrile)|fever.*rash|measles|mpox|monkeypox|chicken\s*pox)\b/i,
  "Acute Neurological Syndrome": /\b(stiff\s*neck|neck\s*stiff|meningit|convuls|seizure|altered\s*mental|unconscious|coma)\b/i,
  "Severe Acute Respiratory Infection": /\b(severe.*cough|breathless|dyspn|difficulty\s*breathing|pneumon|sari)\b/i,
  "Acute Jaundice Syndrome": /\b(jaundice|yellow\s*eye|yellow\s*skin|yellow\s*fever)\b/i,
  "Unexplained Cluster Deaths": /\b(sudden\s*death|cluster\s*death|multiple\s*deaths)\b/i,
};

function classifySyndrome(enc: Encounter): string | null {
  const haystack = [
    enc.chief_complaint || "",
    enc.diagnosis || "",
    Array.isArray(enc.symptoms) ? enc.symptoms.join(" ") : JSON.stringify(enc.symptoms || ""),
    Array.isArray(enc.syndromic_flags) ? enc.syndromic_flags.join(" ") : "",
  ].join(" ");
  for (const [name, re] of Object.entries(SYNDROME_PATTERNS)) {
    if (re.test(haystack)) return name;
  }
  return null;
}

function mean(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
function stddev(xs: number[], mu: number): number {
  if (xs.length < 2) return 0;
  const v = xs.reduce((a, b) => a + (b - mu) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for cross-facility analytics (read-only aggregation)
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Fetch last 60 days of encounters (recent 7 + baseline 53 days)
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86400_000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();

    const { data: encounters, error: encErr } = await admin
      .from("encounters")
      .select("id, facility_id, encounter_date, chief_complaint, symptoms, diagnosis, syndromic_flags, is_syndromic_alert")
      .gte("encounter_date", sixtyDaysAgo)
      .limit(5000);

    if (encErr) throw encErr;

    const { data: facilities } = await admin
      .from("facilities")
      .select("id, name, region, district");
    const facMap = new Map((facilities || []).map((f: any) => [f.id, f]));

    // Classify and bucket
    type Bucket = { facility_id: string | null; syndrome: string; dailyCounts: Map<string, number>; samples: string[] };
    const buckets = new Map<string, Bucket>();

    for (const e of (encounters as Encounter[]) || []) {
      const syn = classifySyndrome(e);
      if (!syn) continue;
      const key = `${e.facility_id || "unknown"}::${syn}`;
      const day = e.encounter_date.slice(0, 10);
      let b = buckets.get(key);
      if (!b) {
        b = { facility_id: e.facility_id, syndrome: syn, dailyCounts: new Map(), samples: [] };
        buckets.set(key, b);
      }
      b.dailyCounts.set(day, (b.dailyCounts.get(day) || 0) + 1);
      if (b.samples.length < 5 && e.chief_complaint) b.samples.push(e.chief_complaint);
    }

    // Build clusters with z-scores
    const clusters: Cluster[] = [];
    const recentCutoffMs = new Date(sevenDaysAgo).getTime();
    for (const [key, b] of buckets) {
      const recent: number[] = [];
      const baseline: number[] = [];
      for (const [day, count] of b.dailyCounts) {
        if (new Date(day).getTime() >= recentCutoffMs) recent.push(count);
        else baseline.push(count);
      }
      const recentTotal = recent.reduce((a, c) => a + c, 0);
      // Pad baseline with zeros for days with no cases (53 baseline days)
      const baselinePadded = [...baseline];
      while (baselinePadded.length < 53) baselinePadded.push(0);
      const mu = mean(baselinePadded);
      const sd = stddev(baselinePadded, mu);
      const recentMean = recent.length ? recentTotal / 7 : 0;
      const z = sd > 0 ? (recentMean - mu) / sd : (recentMean > 0 && mu === 0 ? 99 : 0);

      // Only flag clusters with meaningful signal
      if (recentTotal < 2) continue;
      if (z < 1.5 && recentTotal < 5) continue;

      const fac = b.facility_id ? facMap.get(b.facility_id) : null;
      clusters.push({
        key,
        facility_id: b.facility_id,
        facility_name: fac?.name || "Unknown facility",
        region: fac?.region,
        district: fac?.district,
        syndrome: b.syndrome,
        recent_count: recentTotal,
        baseline_mean: Number(mu.toFixed(2)),
        baseline_stddev: Number(sd.toFixed(2)),
        z_score: Number(z.toFixed(2)),
        sample_complaints: b.samples,
      });
    }

    clusters.sort((a, b) => b.z_score - a.z_score);
    const topClusters = clusters.slice(0, 10);

    // No clusters? Return early
    if (topClusters.length === 0) {
      return new Response(JSON.stringify({
        analyzed_encounters: encounters?.length || 0,
        clusters: [],
        ai_assessment: null,
        generated_at: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Send to Lovable AI for interpretation
    const aiPayload = {
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are an epidemiologist for the Nigeria Centre for Disease Control (NCDC). Analyze syndromic clusters from health facilities and assess outbreak risk. Be concise, clinical, and action-oriented. Reference IDSR priority diseases (Lassa Fever, Cholera, Meningitis, Measles, Diphtheria, Yellow Fever, Mpox) where applicable.`,
        },
        {
          role: "user",
          content: `Analyze these syndromic clusters detected in the last 7 days vs 53-day baseline. For each high-risk cluster, identify likely disease, urgency level, and recommended actions.\n\n${JSON.stringify(topClusters, null, 2)}`,
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "report_outbreak_assessment",
          description: "Structured outbreak risk assessment",
          parameters: {
            type: "object",
            properties: {
              overall_risk: { type: "string", enum: ["low", "moderate", "high", "critical"] },
              executive_summary: { type: "string" },
              cluster_assessments: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    cluster_key: { type: "string" },
                    likely_disease: { type: "string" },
                    confidence: { type: "string", enum: ["low", "medium", "high"] },
                    urgency: { type: "string", enum: ["routine", "elevated", "urgent", "emergency"] },
                    rationale: { type: "string" },
                    recommended_actions: { type: "array", items: { type: "string" } },
                  },
                  required: ["cluster_key", "likely_disease", "confidence", "urgency", "rationale", "recommended_actions"],
                },
              },
              escalation_required: { type: "boolean" },
              notify_ncdc: { type: "boolean" },
            },
            required: ["overall_risk", "executive_summary", "cluster_assessments", "escalation_required", "notify_ncdc"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "report_outbreak_assessment" } },
    };

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(aiPayload),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "AI rate limit reached. Try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error", detail: t }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    let assessment: any = null;
    if (toolCall?.function?.arguments) {
      try { assessment = JSON.parse(toolCall.function.arguments); } catch { /* ignore */ }
    }

    return new Response(JSON.stringify({
      analyzed_encounters: encounters?.length || 0,
      clusters: topClusters,
      ai_assessment: assessment,
      generated_at: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("anomaly detection error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
