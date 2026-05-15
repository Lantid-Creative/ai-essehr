import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { CheckCircle2, Clock, XCircle, Send, RefreshCw, AlertTriangle, Globe2, ShieldCheck, Building2, Timer, BellRing } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { toast } from "sonner";

interface CaseReport {
  id: string;
  external_uuid: string;
  disease: string;
  case_classification: string;
  status: string;
  facility_id: string;
  patient_id: string;
  onset_date: string | null;
  outcome: string | null;
  facility_validated_at: string | null;
  lga_validated_at: string | null;
  state_validated_at: string | null;
  sla_facility_due_at: string | null;
  sla_lga_due_at: string | null;
  sla_state_due_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  symptoms: any;
}
interface Dispatch {
  id: string;
  case_report_id: string;
  target: "SORMAS" | "DHIS2";
  status: string;
  retry_count: number;
  external_id: string | null;
  last_error: string | null;
  dispatched_at: string | null;
  next_retry_at: string | null;
}

const STATUS_BADGE: Record<string, string> = {
  pending_facility: "bg-muted text-muted-foreground",
  facility_validated: "bg-blue-500/15 text-blue-700",
  pending_lga: "bg-amber-500/15 text-amber-700",
  lga_validated: "bg-amber-500/15 text-amber-700",
  pending_state: "bg-orange-500/15 text-orange-700",
  state_validated: "bg-emerald-500/15 text-emerald-700",
  dispatched: "bg-emerald-500/15 text-emerald-700",
  partially_dispatched: "bg-amber-500/15 text-amber-700",
  failed: "bg-destructive/15 text-destructive",
  rejected: "bg-destructive/15 text-destructive",
};

const DISP_BADGE: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  sending: "bg-blue-500/15 text-blue-700",
  success: "bg-emerald-500/15 text-emerald-700",
  failed: "bg-amber-500/15 text-amber-700",
  dead_letter: "bg-destructive/15 text-destructive",
};

function slaInfo(c: CaseReport): { label: string; due: string | null; overdue: boolean } | null {
  let due: string | null = null;
  let label = "";
  if (c.status === "pending_facility") { due = c.sla_facility_due_at; label = "Facility validation"; }
  else if (c.status === "facility_validated" || c.status === "pending_lga") { due = c.sla_lga_due_at; label = "LGA validation"; }
  else if (c.status === "lga_validated" || c.status === "pending_state") { due = c.sla_state_due_at; label = "State validation"; }
  else return null;
  if (!due) return { label, due: null, overdue: false };
  return { label, due, overdue: new Date(due) < new Date() };
}

export default function DataChainPage() {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<CaseReport[]>([]);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [processing, setProcessing] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: cs }, { data: ds }] = await Promise.all([
      supabase.from("case_reports").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("case_report_dispatches").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    setCases((cs as CaseReport[]) || []);
    setDispatches((ds as Dispatch[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const advance = async (c: CaseReport, to: "facility_validated" | "lga_validated" | "state_validated") => {
    const updates: Record<string, any> = { status: to };
    const now = new Date().toISOString();
    if (to === "facility_validated") updates.facility_validated_at = now;
    if (to === "lga_validated") updates.lga_validated_at = now;
    if (to === "state_validated") updates.state_validated_at = now;
    const { error } = await supabase.from("case_reports").update(updates).eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success(`Case advanced to ${to.replace(/_/g, " ")}`);
    load();
  };

  const reject = async (c: CaseReport) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    const { error } = await supabase.from("case_reports").update({ status: "rejected", rejection_reason: reason }).eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Case rejected");
    load();
  };

  const processQueue = async () => {
    setProcessing(true);
    const { data, error } = await supabase.functions.invoke("dispatch-case-reports", { body: { mode: "process" } });
    setProcessing(false);
    if (error) return toast.error(error.message);
    toast.success(`Processed ${data?.processed ?? 0} dispatches`);
    load();
  };

  const dispatchOne = async (caseId: string) => {
    const { data, error } = await supabase.functions.invoke("dispatch-case-reports", { body: { case_report_id: caseId } });
    if (error) return toast.error(error.message);
    toast.success(`Dispatched: ${data?.processed ?? 0} jobs`);
    load();
  };

  const dispatchesFor = (caseId: string) => dispatches.filter((d) => d.case_report_id === caseId);

  const stats = {
    total: cases.length,
    pending: cases.filter((c) => c.status.startsWith("pending")).length,
    dispatched: cases.filter((c) => c.status === "dispatched").length,
    failed: cases.filter((c) => c.status === "failed" || c.status === "partially_dispatched").length,
    sormasOk: dispatches.filter((d) => d.target === "SORMAS" && d.status === "success").length,
    dhis2Ok: dispatches.filter((d) => d.target === "DHIS2" && d.status === "success").length,
    deadLetter: dispatches.filter((d) => d.status === "dead_letter").length,
  };

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Globe2 className="h-8 w-8 text-primary" />
            Validated Data Chain
          </h1>
          <p className="text-muted-foreground mt-1">
            3-tier validation (Facility → LGA → State) with outbox dispatch to SORMAS &amp; DHIS2
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          <Button onClick={processQueue} disabled={processing}>
            <Send className="h-4 w-4 mr-2" />{processing ? "Processing..." : "Process Outbox"}
          </Button>
        </div>
      </div>

      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>How dispatch works</AlertTitle>
        <AlertDescription className="text-sm space-y-1 mt-1">
          <div>• Cases auto-enqueue to <b>SORMAS</b> (CaseDataDto) + <b>DHIS2</b> (dataValueSets) when LGA-validated.</div>
          <div>• Outbox retries with exponential backoff (1m → 5m → 15m → 1h → 4h), max 5 attempts before dead-letter.</div>
          <div>• If <code>SORMAS_BASE_URL</code>/<code>DHIS2_BASE_URL</code> secrets are unset, dispatcher runs in <b>simulation mode</b> for pilot demos.</div>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Total cases", value: stats.total, icon: Building2 },
          { label: "Pending validation", value: stats.pending, icon: Clock },
          { label: "Dispatched", value: stats.dispatched, icon: CheckCircle2 },
          { label: "Failed/Partial", value: stats.failed, icon: AlertTriangle },
          { label: "SORMAS ✓", value: stats.sormasOk, icon: Send },
          { label: "DHIS2 ✓", value: stats.dhis2Ok, icon: Send },
          { label: "Dead-letter", value: stats.deadLetter, icon: XCircle },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <s.icon className="h-4 w-4 text-muted-foreground mb-1" />
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="cases">
        <TabsList>
          <TabsTrigger value="cases">Case reports ({cases.length})</TabsTrigger>
          <TabsTrigger value="outbox">Dispatch outbox ({dispatches.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="cases" className="space-y-4">
          {loading && <Skeleton className="h-48 w-full" />}
          {!loading && cases.length === 0 && (
            <Card><CardContent className="pt-6 text-center text-muted-foreground">
              No case reports yet. Create one from a consultation by classifying it as a notifiable disease.
            </CardContent></Card>
          )}
          {cases.map((c) => {
            const ds = dispatchesFor(c.id);
            return (
              <Card key={c.id}>
                <CardHeader>
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {c.disease}
                        <Badge variant="outline">{c.case_classification}</Badge>
                        <Badge className={STATUS_BADGE[c.status]}>{c.status.replace(/_/g, " ")}</Badge>
                      </CardTitle>
                      <CardDescription className="text-xs mt-1 font-mono">UUID: {c.external_uuid}</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {c.status === "pending_facility" && (
                        <Button size="sm" onClick={() => advance(c, "facility_validated")}>Facility validate</Button>
                      )}
                      {(c.status === "facility_validated" || c.status === "pending_lga") && (
                        <Button size="sm" onClick={() => advance(c, "lga_validated")}>LGA DSNO validate</Button>
                      )}
                      {(c.status === "lga_validated" || c.status === "pending_state") && (
                        <Button size="sm" onClick={() => advance(c, "state_validated")}>State validate</Button>
                      )}
                      {(c.status === "lga_validated" || c.status === "state_validated" || c.status === "failed" || c.status === "partially_dispatched") && (
                        <Button size="sm" variant="outline" onClick={() => dispatchOne(c.id)}>Dispatch now</Button>
                      )}
                      {c.status !== "rejected" && c.status !== "dispatched" && (
                        <Button size="sm" variant="ghost" onClick={() => reject(c)}>Reject</Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><div className="text-xs text-muted-foreground">Onset</div><div>{c.onset_date || "—"}</div></div>
                    <div><div className="text-xs text-muted-foreground">Outcome</div><div>{c.outcome || "—"}</div></div>
                    <div><div className="text-xs text-muted-foreground">Reported</div><div>{format(new Date(c.created_at), "dd MMM HH:mm")}</div></div>
                    <div><div className="text-xs text-muted-foreground">LGA validated</div><div>{c.lga_validated_at ? format(new Date(c.lga_validated_at), "dd MMM HH:mm") : "—"}</div></div>
                  </div>

                  {ds.length > 0 && (
                    <div className="border-t pt-3">
                      <div className="text-xs font-semibold text-muted-foreground mb-2">DISPATCH STATUS</div>
                      <div className="space-y-1">
                        {ds.map((d) => (
                          <div key={d.id} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <Badge variant="outline">{d.target}</Badge>
                              <Badge className={DISP_BADGE[d.status]}>{d.status}</Badge>
                              {d.retry_count > 0 && <span className="text-xs text-muted-foreground">{d.retry_count} retries</span>}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {d.external_id || d.last_error?.slice(0, 60) || "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {c.rejection_reason && (
                    <Alert variant="destructive">
                      <AlertDescription className="text-sm">Rejected: {c.rejection_reason}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="outbox" className="space-y-2">
          {dispatches.length === 0 && (
            <Card><CardContent className="pt-6 text-center text-muted-foreground">No dispatches yet.</CardContent></Card>
          )}
          {dispatches.map((d) => (
            <Card key={d.id}>
              <CardContent className="pt-4 flex items-center justify-between flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{d.target}</Badge>
                  <Badge className={DISP_BADGE[d.status]}>{d.status}</Badge>
                  <span className="text-muted-foreground">retries: {d.retry_count}</span>
                </div>
                <div className="text-xs font-mono text-muted-foreground truncate max-w-md">
                  {d.dispatched_at ? `Sent ${format(new Date(d.dispatched_at), "dd MMM HH:mm")}` : d.next_retry_at ? `Next retry ${format(new Date(d.next_retry_at), "dd MMM HH:mm")}` : "—"}
                  {d.last_error && ` · ${d.last_error.slice(0, 80)}`}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
