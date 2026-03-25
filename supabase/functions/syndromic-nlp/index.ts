import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYNDROMIC_PROFILES = {
  cholera: {
    keywords: ["watery stool", "watery diarrhea", "diarrhea", "vomiting", "dehydration", "rice water stool"],
    pidgin: ["belle dey run", "water dey comot", "body dey weak", "watery stool"],
    threshold: 2,
  },
  lassa_fever: {
    keywords: ["hemorrhagic", "bleeding", "high fever", "sore throat", "muscle pain", "chest pain", "facial swelling"],
    pidgin: ["blood dey comot", "nose dey bleed", "body hot well well", "throat dey pain"],
    threshold: 2,
  },
  meningitis: {
    keywords: ["neck stiffness", "stiff neck", "severe headache", "high fever", "photophobia", "confusion", "rash"],
    pidgin: ["neck stiff", "head dey pain well well", "pikin dey breathe hard"],
    threshold: 2,
  },
  measles: {
    keywords: ["rash", "fever", "cough", "runny nose", "red eyes", "conjunctivitis", "koplik spots"],
    pidgin: ["rash full body", "body hot", "eye red", "pikin body dey scratch"],
    threshold: 2,
  },
  diphtheria: {
    keywords: ["sore throat", "swollen neck", "bull neck", "gray membrane", "difficulty breathing", "fever"],
    pidgin: ["throat dey pain", "neck don swell", "no fit breathe well"],
    threshold: 2,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { clinical_notes, symptoms, chief_complaint } = await req.json();

    if (!clinical_notes && !chief_complaint) {
      return new Response(
        JSON.stringify({ error: "clinical_notes or chief_complaint required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const combinedText = [clinical_notes, chief_complaint, ...(symptoms || [])].filter(Boolean).join(". ");

    // Step 1: Quick keyword-based pre-screening
    const keywordMatches: Record<string, string[]> = {};
    for (const [disease, profile] of Object.entries(SYNDROMIC_PROFILES)) {
      const allKeywords = [...profile.keywords, ...profile.pidgin];
      const matched = allKeywords.filter(kw => combinedText.toLowerCase().includes(kw.toLowerCase()));
      if (matched.length >= 1) {
        keywordMatches[disease] = matched;
      }
    }

    // Step 2: Use AI for deeper NLP analysis on the clinical text
    const systemPrompt = `You are an AI syndromic surveillance engine for Nigeria's AI-PEWS Early Warning System. 
Your task is to analyze clinical encounter notes — which may be written in English, Nigerian Pidgin, or a mix — and extract disease surveillance signals.

You MUST analyze for these 5 priority diseases:
1. Cholera - watery diarrhea, vomiting, dehydration
2. Lassa Fever - hemorrhagic signs, high fever, bleeding
3. Meningitis - neck stiffness, severe headache, high fever
4. Measles - rash + fever + cough in unvaccinated 
5. Diphtheria - sore throat, swollen neck, gray membrane

Be especially attentive to Pidgin expressions like:
- "body hot" = fever
- "belle dey run" = diarrhea  
- "water dey comot" = watery stool
- "blood dey comot" = bleeding
- "neck stiff" = meningeal signs
- "pikin" = child
- "no fit breathe" = respiratory distress`;

    const userPrompt = `Analyze this clinical encounter text for syndromic surveillance signals:

"${combinedText}"

${Object.keys(keywordMatches).length > 0 ? `Keyword pre-screening flagged: ${Object.keys(keywordMatches).join(', ')}` : ''}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "syndromic_analysis",
              description: "Return structured syndromic surveillance analysis of clinical notes",
              parameters: {
                type: "object",
                properties: {
                  detected_signals: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        disease: { type: "string", enum: ["cholera", "lassa_fever", "meningitis", "measles", "diphtheria"] },
                        confidence: { type: "number", description: "0-100 confidence score" },
                        matched_symptoms: { type: "array", items: { type: "string" } },
                        severity: { type: "string", enum: ["low", "moderate", "high", "critical"] },
                        reasoning: { type: "string" },
                      },
                      required: ["disease", "confidence", "matched_symptoms", "severity", "reasoning"],
                      additionalProperties: false,
                    },
                  },
                  language_detected: { type: "string", description: "Language(s) detected in the notes" },
                  additional_clinical_signals: { type: "string", description: "Any other notable clinical findings" },
                },
                required: ["detected_signals", "language_detected"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "syndromic_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited — please retry shortly" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      // Fall back to keyword-only analysis
      return new Response(
        JSON.stringify({
          source: "keyword_only",
          keyword_matches: keywordMatches,
          detected_signals: Object.entries(keywordMatches).map(([disease, matched]) => ({
            disease,
            confidence: Math.min(matched.length * 30, 90),
            matched_symptoms: matched,
            severity: matched.length >= 3 ? "high" : "moderate",
            reasoning: `Keyword match: ${matched.join(", ")}`,
          })),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    let analysis;
    if (toolCall?.function?.arguments) {
      try {
        analysis = JSON.parse(toolCall.function.arguments);
      } catch {
        analysis = { detected_signals: [], language_detected: "unknown" };
      }
    } else {
      analysis = { detected_signals: [], language_detected: "unknown" };
    }

    // Merge keyword matches with AI analysis
    analysis.keyword_pre_screen = keywordMatches;
    analysis.source = "ai_nlp";

    return new Response(
      JSON.stringify(analysis),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("NLP analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
