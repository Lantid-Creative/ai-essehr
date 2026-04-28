import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, AlertOctagon, TrendingUp, Activity, Sparkles, ShieldAlert, MapPin, Stethoscope } from "lucide-react";
import { toast } from "sonner";

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

interface ClusterAssessment {
  cluster_key: string;
  likely_disease: string;
  confidence: "low" | "medium" | "high";
  urgency: "routine" | "elevated" | "urgent" | "emergency";
  rationale: string;
  recommended_actions: string[];
}

interface AIAssessment {
  overall_risk: "low" | "moderate" | "high" | "critical";
  executive_summary: string;
  cluster_assessments: ClusterAssessment[];
  escalation_required: boolean;
  notify_ncdc: boolean;
}

interface Result {
  analyzed_encounters: number;
  clusters: Cluster[];
  ai_assessment: AIAssessment | null;
  generated_at: string;
}

const RISK_COLORS: Record<string, string> = {
  low: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  moderate: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  high: "bg-orange-500/10 text-orange-700 border-orange-500/30",
  critical: "bg-destructive/10 text-destructive border-destructive/30",
};

const URGENCY_COLORS: Record<string, string> = {
  routine: "bg-muted text-muted-foreground",
  elevated: "bg-amber-500/15 text-amber-700",
  urgent: "bg-orange-500/15 text-orange-700",
  emergency: "bg-destructive/15 text-destructive",
};

export default function AIAnomalyDetectionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-anomaly-detection");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as Result);
      toast.success(`Analyzed ${data.analyzed_encounters} encounters · ${data.clusters.length} clusters detected`);
    } catch (e: any) {
      const msg = e?.message || "Analysis failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const findAssessment = (key: string) =>
    result?.ai_assessment?.cluster_assessments.find((c) => c.cluster_key === key);

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            AI Anomaly Detection
          </h1>
          <p className="text-muted-foreground mt-1">
            Statistical clustering + AI epidemiological reasoning over 60 days of encounters
          </p>
        </div>
        <Button onClick={runAnalysis} disabled={loading} size="lg">
          <Sparkles className="h-4 w-4 mr-2" />
          {loading ? "Analyzing..." : "Run AI Analysis"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>• Pulls 60 days of encounter data and classifies symptoms into 8 IDSR syndromes</p>
          <p>• Computes z-scores comparing the last 7 days to a 53-day baseline per facility × syndrome</p>
          <p>• Sends top suspicious clusters to Lovable AI (Gemini) for outbreak risk interpretation</p>
          <p>• Returns structured assessment: likely disease, urgency, recommended actions</p>
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {result && !loading && (
        <>
          {result.ai_assessment && (
            <Alert className={RISK_COLORS[result.ai_assessment.overall_risk]}>
              <ShieldAlert className="h-5 w-5" />
              <AlertTitle className="flex items-center gap-2">
                Overall Risk: {result.ai_assessment.overall_risk.toUpperCase()}
                {result.ai_assessment.notify_ncdc && (
                  <Badge variant="destructive">NCDC Notification Recommended</Badge>
                )}
                {result.ai_assessment.escalation_required && (
                  <Badge variant="destructive">Escalation Required</Badge>
                )}
              </AlertTitle>
              <AlertDescription className="mt-2">{result.ai_assessment.executive_summary}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-6">
              <div className="text-2xl font-bold">{result.analyzed_encounters}</div>
              <p className="text-xs text-muted-foreground">Encounters analyzed (60d)</p>
            </CardContent></Card>
            <Card><CardContent className="pt-6">
              <div className="text-2xl font-bold">{result.clusters.length}</div>
              <p className="text-xs text-muted-foreground">Suspicious clusters</p>
            </CardContent></Card>
            <Card><CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {result.clusters.filter((c) => c.z_score >= 3).length}
              </div>
              <p className="text-xs text-muted-foreground">Z-score ≥ 3 (high signal)</p>
            </CardContent></Card>
            <Card><CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {result.ai_assessment?.cluster_assessments.filter((c) => c.urgency === "emergency" || c.urgency === "urgent").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Urgent/Emergency clusters</p>
            </CardContent></Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" /> Detected Clusters
            </h2>
            {result.clusters.length === 0 && (
              <Card><CardContent className="pt-6 text-center text-muted-foreground">
                No anomalous clusters detected. All facility syndrome rates are within expected baselines.
              </CardContent></Card>
            )}
            {result.clusters.map((c) => {
              const a = findAssessment(c.key);
              return (
                <Card key={c.key}>
                  <CardHeader>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertOctagon className="h-5 w-5 text-orange-500" />
                          {c.syndrome}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.facility_name}</span>
                          {c.region && <span>· {c.region}{c.district ? ` / ${c.district}` : ""}</span>}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge variant="outline" className="gap-1">
                          <TrendingUp className="h-3 w-3" /> Z = {c.z_score}
                        </Badge>
                        <Badge variant="secondary">{c.recent_count} cases / 7d</Badge>
                        {a && <Badge className={URGENCY_COLORS[a.urgency]}>{a.urgency.toUpperCase()}</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div><div className="text-muted-foreground text-xs">7-day count</div><div className="font-semibold">{c.recent_count}</div></div>
                      <div><div className="text-muted-foreground text-xs">Baseline mean</div><div className="font-semibold">{c.baseline_mean}/day</div></div>
                      <div><div className="text-muted-foreground text-xs">Baseline σ</div><div className="font-semibold">{c.baseline_stddev}</div></div>
                      <div><div className="text-muted-foreground text-xs">Z-score</div><div className="font-semibold">{c.z_score}</div></div>
                    </div>

                    {a && (
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Stethoscope className="h-4 w-4 text-primary" />
                          <span className="font-medium">AI assessment:</span>
                          <span>{a.likely_disease}</span>
                          <Badge variant="outline" className="text-xs">{a.confidence} confidence</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{a.rationale}</p>
                        {a.recommended_actions.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-muted-foreground mb-1">RECOMMENDED ACTIONS</div>
                            <ul className="text-sm space-y-1 list-disc list-inside">
                              {a.recommended_actions.map((act, i) => <li key={i}>{act}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {c.sample_complaints.length > 0 && (
                      <div className="border-t pt-3">
                        <div className="text-xs font-semibold text-muted-foreground mb-1">SAMPLE COMPLAINTS</div>
                        <ul className="text-sm space-y-0.5 text-muted-foreground">
                          {c.sample_complaints.map((s, i) => <li key={i}>• {s}</li>)}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Generated {new Date(result.generated_at).toLocaleString()} · Analysis runs server-side via Lovable AI Gateway
          </p>
        </>
      )}
    </div>
  );
}
