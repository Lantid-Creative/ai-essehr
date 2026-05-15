import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAppContext } from "@/context/AppContext";
import {
  ShieldCheck, Plus, FileText, CheckCircle2, XCircle, Clock, Send, Trash2, Upload,
} from "lucide-react";

type AppStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "expired" | "suspended";
type DocStatus = "pending" | "verified" | "rejected";

const SCHEMES = [
  "NHIA (National Health Insurance Authority)",
  "SSHIA (State Social Health Insurance)",
  "Private HMO",
  "Vulnerable Group Fund (BHCPF)",
  "Tertiary Empanelment",
];

const FACILITY_TIERS = ["Primary", "Secondary", "Tertiary"];

const REQUIRED_DOCS = [
  { type: "cac", label: "CAC / Registration certificate" },
  { type: "license", label: "Operating licence" },
  { type: "tax", label: "Tax clearance certificate" },
  { type: "facility_inspection", label: "Facility inspection report" },
  { type: "staffing_list", label: "Staffing list with credentials" },
  { type: "equipment_list", label: "Equipment & infrastructure list" },
  { type: "service_charter", label: "Service charter / scope" },
  { type: "bank_details", label: "Bank verification letter" },
];

const STATUS_META: Record<AppStatus, { label: string; color: string; icon: any }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
  submitted: { label: "Submitted", color: "bg-blue-500/15 text-blue-700 dark:text-blue-300", icon: Send },
  under_review: { label: "Under review", color: "bg-amber-500/15 text-amber-700 dark:text-amber-300", icon: Clock },
  approved: { label: "Approved", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/15 text-destructive", icon: XCircle },
  expired: { label: "Expired", color: "bg-muted text-muted-foreground", icon: Clock },
  suspended: { label: "Suspended", color: "bg-orange-500/15 text-orange-700 dark:text-orange-300", icon: XCircle },
};

interface AppRow {
  id: string;
  facility_id: string;
  scheme: string;
  application_ref: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  facility_tier: string | null;
  services_offered: string[] | null;
  status: AppStatus;
  submitted_at: string | null;
  approved_at: string | null;
  expires_at: string | null;
  reviewer_notes: string | null;
  rejection_reason: string | null;
  empanelment_code: string | null;
  created_at: string;
  updated_at: string;
}

interface DocRow {
  id: string;
  application_id: string;
  doc_type: string;
  doc_label: string;
  file_url: string | null;
  status: DocStatus;
  reviewer_notes: string | null;
}

interface EventRow {
  id: string;
  from_status: AppStatus | null;
  to_status: AppStatus;
  comment: string | null;
  created_at: string;
}

function StatusBadge({ status }: { status: AppStatus }) {
  const m = STATUS_META[status];
  const I = m.icon;
  return (
    <Badge className={`${m.color} gap-1 border-0`} variant="secondary">
      <I className="h-3 w-3" /> {m.label}
    </Badge>
  );
}

export default function NHEDEmpanelmentPage() {
  const { toast } = useToast();
  const { user, facilityId, roles } = useAppContext();
  const isReviewer = roles.includes("super_admin");

  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  // Create form state
  const [scheme, setScheme] = useState(SCHEMES[0]);
  const [tier, setTier] = useState(FACILITY_TIERS[0]);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const loadApps = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("nhed_empanelment_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    else setApps((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { void loadApps(); }, []);

  const loadDetail = async (id: string) => {
    setSelectedId(id);
    const [d, e] = await Promise.all([
      supabase.from("nhed_application_documents").select("*").eq("application_id", id).order("doc_label"),
      supabase.from("nhed_status_events").select("*").eq("application_id", id).order("created_at", { ascending: false }),
    ]);
    setDocs((d.data as any) || []);
    setEvents((e.data as any) || []);
  };

  const selected = useMemo(() => apps.find((a) => a.id === selectedId) || null, [apps, selectedId]);

  const createApplication = async () => {
    if (!user || !facilityId) {
      toast({ title: "No facility context", variant: "destructive" });
      return;
    }
    const { data, error } = await supabase
      .from("nhed_empanelment_applications")
      .insert({
        facility_id: facilityId,
        scheme,
        facility_tier: tier,
        contact_name: contactName || null,
        contact_phone: contactPhone || null,
        contact_email: contactEmail || null,
        created_by: user.id,
      })
      .select()
      .single();
    if (error) {
      toast({ title: "Create failed", description: error.message, variant: "destructive" });
      return;
    }
    // Seed required document checklist
    await supabase.from("nhed_application_documents").insert(
      REQUIRED_DOCS.map((d) => ({
        application_id: data.id,
        doc_type: d.type,
        doc_label: d.label,
      })),
    );
    toast({ title: "Application created" });
    setCreateOpen(false);
    setContactName(""); setContactPhone(""); setContactEmail("");
    await loadApps();
    void loadDetail(data.id);
  };

  const transition = async (next: AppStatus, note?: string) => {
    if (!selected) return;
    const patch: any = { status: next };
    if (note !== undefined) patch.reviewer_notes = note;
    if (next === "submitted") patch.submitted_at = new Date().toISOString();
    if (next === "approved") {
      patch.approved_at = new Date().toISOString();
      patch.expires_at = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      patch.empanelment_code =
        "NHED-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    }
    if (next === "rejected" && note) patch.rejection_reason = note;
    const { error } = await supabase
      .from("nhed_empanelment_applications")
      .update(patch)
      .eq("id", selected.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Status → ${STATUS_META[next].label}` });
    await loadApps();
    await loadDetail(selected.id);
  };

  const updateDoc = async (id: string, patch: Partial<DocRow>) => {
    const { error } = await supabase.from("nhed_application_documents").update(patch).eq("id", id);
    if (error) {
      toast({ title: "Doc update failed", description: error.message, variant: "destructive" });
      return;
    }
    if (selected) void loadDetail(selected.id);
  };

  const deleteApp = async (id: string) => {
    if (!confirm("Delete this draft application?")) return;
    const { error } = await supabase.from("nhed_empanelment_applications").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setSelectedId(null);
    await loadApps();
  };

  const docsVerified = docs.filter((d) => d.status === "verified").length;
  const docsTotal = docs.length;
  const allVerified = docsTotal > 0 && docsVerified === docsTotal;

  const stats = useMemo(() => ({
    total: apps.length,
    submitted: apps.filter((a) => a.status === "submitted").length,
    under_review: apps.filter((a) => a.status === "under_review").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  }), [apps]);

  return (
    <div className="space-y-6 p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">NHED Empanelment</h1>
            <p className="text-sm text-muted-foreground">
              Apply, upload evidence, and track approval across NHIA / SSHIA / BHCPF schemes.
            </p>
          </div>
        </div>
        {!isReviewer && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New application</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New empanelment application</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Scheme</Label>
                  <Select value={scheme} onValueChange={setScheme}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SCHEMES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Facility tier</Label>
                  <Select value={tier} onValueChange={setTier}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FACILITY_TIERS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Contact name</Label><Input value={contactName} onChange={(e) => setContactName(e.target.value)} /></div>
                  <div><Label>Contact phone</Label><Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} /></div>
                </div>
                <div><Label>Contact email</Label><Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={createApplication}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", v: stats.total },
          { label: "Submitted", v: stats.submitted },
          { label: "Under review", v: stats.under_review },
          { label: "Approved", v: stats.approved },
          { label: "Rejected", v: stats.rejected },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold">{s.v}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Applications</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!loading && apps.length === 0 && (
              <p className="text-sm text-muted-foreground">No applications yet.</p>
            )}
            {apps.map((a) => (
              <button
                key={a.id}
                onClick={() => loadDetail(a.id)}
                className={`w-full text-left p-3 rounded-md border hover:bg-muted/50 transition ${
                  selectedId === a.id ? "border-primary bg-muted/40" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm truncate">{a.scheme}</span>
                  <StatusBadge status={a.status} />
                </div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>{a.facility_tier ?? "—"} · {a.application_ref ?? "no ref"}</span>
                  <span>{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          {!selected ? (
            <CardContent className="py-12 text-center text-muted-foreground">
              Select an application to view details.
            </CardContent>
          ) : (
            <>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {selected.scheme} <StatusBadge status={selected.status} />
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selected.facility_tier ?? "—"} · created {new Date(selected.created_at).toLocaleString()}
                  </p>
                  {selected.empanelment_code && (
                    <p className="text-sm font-mono mt-1 text-emerald-700 dark:text-emerald-300">
                      Code: {selected.empanelment_code}
                    </p>
                  )}
                </div>
                {selected.status === "draft" && !isReviewer && (
                  <Button size="sm" variant="ghost" onClick={() => deleteApp(selected.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="docs">
                  <TabsList>
                    <TabsTrigger value="docs">Documents ({docsVerified}/{docsTotal})</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                    <TabsTrigger value="history">History ({events.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="docs" className="space-y-2">
                    {docs.length === 0 && <p className="text-sm text-muted-foreground">No documents.</p>}
                    {docs.map((d) => {
                      const editable =
                        (selected.status === "draft" || selected.status === "submitted" || selected.status === "under_review");
                      return (
                        <div key={d.id} className="border rounded-md p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-sm font-medium truncate">{d.doc_label}</span>
                            </div>
                            <Badge variant={d.status === "verified" ? "default" : d.status === "rejected" ? "destructive" : "outline"}>
                              {d.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            <Input
                              placeholder="Paste file URL"
                              className="flex-1 min-w-[200px]"
                              value={d.file_url ?? ""}
                              disabled={!editable && !isReviewer}
                              onChange={(e) =>
                                setDocs((cur) => cur.map((x) => (x.id === d.id ? { ...x, file_url: e.target.value } : x)))
                              }
                              onBlur={(e) => updateDoc(d.id, { file_url: e.target.value || null })}
                            />
                            {d.file_url && (
                              <Button asChild size="sm" variant="outline">
                                <a href={d.file_url} target="_blank" rel="noreferrer"><Upload className="h-3 w-3 mr-1" />Open</a>
                              </Button>
                            )}
                            {isReviewer && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => updateDoc(d.id, { status: "verified" })}>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />Verify
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => updateDoc(d.id, { status: "rejected" })}>
                                  <XCircle className="h-3 w-3 mr-1" />Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-2 text-sm">
                    <div><span className="text-muted-foreground">Contact:</span> {selected.contact_name ?? "—"}</div>
                    <div><span className="text-muted-foreground">Phone:</span> {selected.contact_phone ?? "—"}</div>
                    <div><span className="text-muted-foreground">Email:</span> {selected.contact_email ?? "—"}</div>
                    <div><span className="text-muted-foreground">App ref:</span> {selected.application_ref ?? "—"}</div>
                    <div><span className="text-muted-foreground">Submitted:</span> {selected.submitted_at ? new Date(selected.submitted_at).toLocaleString() : "—"}</div>
                    <div><span className="text-muted-foreground">Approved:</span> {selected.approved_at ? new Date(selected.approved_at).toLocaleString() : "—"}</div>
                    <div><span className="text-muted-foreground">Expires:</span> {selected.expires_at ? new Date(selected.expires_at).toLocaleDateString() : "—"}</div>
                    {selected.rejection_reason && (
                      <div className="text-destructive"><span className="font-medium">Rejection reason:</span> {selected.rejection_reason}</div>
                    )}
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-3">
                    {!isReviewer && selected.status === "draft" && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Submit this application to NHED for review. {!allVerified && `(${docsVerified}/${docsTotal} docs uploaded)`}
                        </p>
                        <Button onClick={() => transition("submitted")} disabled={docsTotal === 0}>
                          <Send className="h-4 w-4 mr-1" /> Submit application
                        </Button>
                      </div>
                    )}
                    {isReviewer && selected.status === "submitted" && (
                      <Button onClick={() => transition("under_review")}>
                        <Clock className="h-4 w-4 mr-1" /> Mark under review
                      </Button>
                    )}
                    {isReviewer && (selected.status === "submitted" || selected.status === "under_review") && (
                      <ReviewerDecision onApprove={(note) => transition("approved", note)} onReject={(note) => transition("rejected", note)} canApprove={allVerified} />
                    )}
                    {isReviewer && selected.status === "approved" && (
                      <Button variant="outline" onClick={() => transition("suspended", "Suspended by reviewer")}>
                        Suspend empanelment
                      </Button>
                    )}
                  </TabsContent>

                  <TabsContent value="history">
                    <Table>
                      <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Change</TableHead><TableHead>Note</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {events.map((e) => (
                          <TableRow key={e.id}>
                            <TableCell className="text-xs">{new Date(e.created_at).toLocaleString()}</TableCell>
                            <TableCell className="text-sm">
                              {e.from_status ? `${STATUS_META[e.from_status].label} → ` : ""}
                              <strong>{STATUS_META[e.to_status].label}</strong>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{e.comment ?? "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function ReviewerDecision({
  onApprove, onReject, canApprove,
}: { onApprove: (note: string) => void; onReject: (note: string) => void; canApprove: boolean }) {
  const [note, setNote] = useState("");
  const [confirmAllVerified, setConfirmAllVerified] = useState(false);
  return (
    <div className="space-y-2 border rounded-md p-3">
      <Label>Reviewer note</Label>
      <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reasoning, conditions, follow-ups…" />
      {!canApprove && (
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <Checkbox checked={confirmAllVerified} onCheckedChange={(v) => setConfirmAllVerified(Boolean(v))} />
          Override: approve despite unverified documents
        </label>
      )}
      <div className="flex gap-2">
        <Button onClick={() => onApprove(note)} disabled={!canApprove && !confirmAllVerified}>
          <CheckCircle2 className="h-4 w-4 mr-1" /> Approve & empanel
        </Button>
        <Button variant="destructive" onClick={() => onReject(note)} disabled={!note.trim()}>
          <XCircle className="h-4 w-4 mr-1" /> Reject
        </Button>
      </div>
    </div>
  );
}
