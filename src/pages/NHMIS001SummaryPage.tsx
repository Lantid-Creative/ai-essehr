import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileSpreadsheet, Download, Printer, Save, Lock, RefreshCw, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth } from "date-fns";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Indicator {
  key: string;
  section: string;
  label: string;
  value: number;
  editable?: boolean;
}

const SECTIONS = [
  "OPD Attendance",
  "Inpatient",
  "Maternal & Child Health",
  "Immunization",
  "Births & Deaths",
  "Notifiable Diseases",
];

export default function NHMIS001SummaryPage() {
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [facilityName, setFacilityName] = useState<string>("");
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [submission, setSubmission] = useState<any>(null);
  const [remarks, setRemarks] = useState("");

  const periodStart = useMemo(() => startOfMonth(new Date(year, month - 1, 1)).toISOString(), [year, month]);
  const periodEnd = useMemo(() => endOfMonth(new Date(year, month - 1, 1)).toISOString(), [year, month]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: p } = await supabase.from("profiles").select("facility_id").eq("id", u.user.id).maybeSingle();
      if (!p?.facility_id) return;
      setFacilityId(p.facility_id);
      const { data: f } = await supabase.from("facilities").select("name").eq("id", p.facility_id).maybeSingle();
      setFacilityName(f?.name ?? "");
    })();
  }, []);

  const aggregate = async () => {
    if (!facilityId) return;
    setLoading(true);

    const [encRes, immRes, birthRes, deathRes, caseRes, dischargeRes] = await Promise.all([
      supabase
        .from("encounters")
        .select("id,encounter_type,vital_signs,created_at", { count: "exact" })
        .eq("facility_id", facilityId)
        .gte("encounter_date", periodStart)
        .lte("encounter_date", periodEnd),
      supabase
        .from("immunizations")
        .select("vaccine_name,dose_number,administered_at", { count: "exact" })
        .eq("facility_id", facilityId)
        .gte("administered_at", periodStart)
        .lte("administered_at", periodEnd),
      supabase
        .from("birth_registrations")
        .select("id,child_sex,date_of_birth,birth_weight_kg")
        .eq("facility_id", facilityId)
        .gte("date_of_birth", periodStart.slice(0, 10))
        .lte("date_of_birth", periodEnd.slice(0, 10)),
      supabase
        .from("death_registrations")
        .select("id,sex,age_years,age_months,date_of_death")
        .eq("facility_id", facilityId)
        .gte("date_of_death", periodStart.slice(0, 10))
        .lte("date_of_death", periodEnd.slice(0, 10)),
      supabase
        .from("case_reports")
        .select("disease,case_classification,outcome,created_at")
        .eq("facility_id", facilityId)
        .gte("created_at", periodStart)
        .lte("created_at", periodEnd),
      supabase
        .from("discharge_summaries")
        .select("id,outcome,discharged_at")
        .eq("facility_id", facilityId)
        .gte("discharged_at", periodStart)
        .lte("discharged_at", periodEnd),
    ]);

    const encounters = encRes.data ?? [];
    const imms = immRes.data ?? [];
    const births = birthRes.data ?? [];
    const deaths = deathRes.data ?? [];
    const cases = caseRes.data ?? [];
    const discharges = dischargeRes.data ?? [];

    const opdTotal = encounters.filter((e: any) => e.encounter_type === "consultation").length;
    const inpatient = encounters.filter((e: any) => e.encounter_type === "inpatient").length;
    const referrals = encounters.filter((e: any) => e.encounter_type === "referral").length;
    const anc = encounters.filter((e: any) => e.encounter_type === "anc").length;
    const pnc = encounters.filter((e: any) => e.encounter_type === "pnc").length;

    const bcg = imms.filter((i: any) => /BCG/i.test(i.vaccine_name)).length;
    const opv = imms.filter((i: any) => /OPV|Polio/i.test(i.vaccine_name)).length;
    const penta = imms.filter((i: any) => /Penta/i.test(i.vaccine_name)).length;
    const measles = imms.filter((i: any) => /Measles|MR\b/i.test(i.vaccine_name)).length;
    const yellowFever = imms.filter((i: any) => /Yellow|YF/i.test(i.vaccine_name)).length;
    const otherImm = imms.length - bcg - opv - penta - measles - yellowFever;

    const liveBirthsM = births.filter((b: any) => b.child_sex === "M" || b.child_sex === "male").length;
    const liveBirthsF = births.filter((b: any) => b.child_sex === "F" || b.child_sex === "female").length;
    const lowBirthWeight = births.filter((b: any) => Number(b.birth_weight_kg) > 0 && Number(b.birth_weight_kg) < 2.5).length;

    const deathsTotal = deaths.length;
    const deathsU5 = deaths.filter((d: any) => Number(d.age_years ?? 0) < 5).length;
    const deathsMaternalAge = deaths.filter((d: any) => Number(d.age_years ?? 0) >= 15 && Number(d.age_years ?? 0) <= 49 && (deaths as any).sex === "F").length;

    const dischargedAlive = discharges.filter((d: any) => d.outcome === "discharged" || d.outcome === "recovered").length;
    const referredOut = discharges.filter((d: any) => d.outcome === "referred").length;

    const dis = (name: RegExp, classification?: string) =>
      cases.filter((c: any) => name.test(c.disease) && (!classification || c.case_classification === classification)).length;

    const computed: Indicator[] = [
      { key: "opd_total", section: "OPD Attendance", label: "Total OPD attendance", value: opdTotal },
      { key: "anc", section: "Maternal & Child Health", label: "ANC visits", value: anc },
      { key: "pnc", section: "Maternal & Child Health", label: "PNC visits", value: pnc },
      { key: "referrals", section: "OPD Attendance", label: "Referrals out (encounter)", value: referrals },

      { key: "ipd_admissions", section: "Inpatient", label: "Inpatient admissions", value: inpatient },
      { key: "ipd_discharged_alive", section: "Inpatient", label: "Discharged alive", value: dischargedAlive },
      { key: "ipd_referred_out", section: "Inpatient", label: "Referred out", value: referredOut },

      { key: "imm_bcg", section: "Immunization", label: "BCG doses given", value: bcg },
      { key: "imm_opv", section: "Immunization", label: "OPV / Polio doses", value: opv },
      { key: "imm_penta", section: "Immunization", label: "Pentavalent doses", value: penta },
      { key: "imm_measles", section: "Immunization", label: "Measles doses", value: measles },
      { key: "imm_yf", section: "Immunization", label: "Yellow Fever doses", value: yellowFever },
      { key: "imm_other", section: "Immunization", label: "Other vaccines", value: Math.max(0, otherImm) },

      { key: "births_male", section: "Births & Deaths", label: "Live births — Male", value: liveBirthsM },
      { key: "births_female", section: "Births & Deaths", label: "Live births — Female", value: liveBirthsF },
      { key: "births_lbw", section: "Births & Deaths", label: "Low birth weight (<2.5kg)", value: lowBirthWeight },
      { key: "deaths_total", section: "Births & Deaths", label: "Deaths (all causes)", value: deathsTotal },
      { key: "deaths_u5", section: "Births & Deaths", label: "Deaths — Under 5", value: deathsU5 },
      { key: "deaths_maternal_age", section: "Births & Deaths", label: "Deaths — Women 15–49y", value: deathsMaternalAge, editable: true },

      { key: "case_lassa", section: "Notifiable Diseases", label: "Lassa fever (suspected+confirmed)", value: dis(/Lassa/i) },
      { key: "case_cholera", section: "Notifiable Diseases", label: "Cholera", value: dis(/Cholera/i) },
      { key: "case_meningitis", section: "Notifiable Diseases", label: "Meningitis (CSM)", value: dis(/Mening/i) },
      { key: "case_measles", section: "Notifiable Diseases", label: "Measles", value: dis(/Measles/i) },
      { key: "case_diphtheria", section: "Notifiable Diseases", label: "Diphtheria", value: dis(/Diphtheria/i) },
      { key: "case_deaths_notifiable", section: "Notifiable Diseases", label: "Deaths from notifiable diseases", value: cases.filter((c: any) => c.outcome === "died").length },
    ];

    // load existing submission for this period
    const { data: sub } = await supabase
      .from("nhmis_001_submissions")
      .select("*")
      .eq("facility_id", facilityId)
      .eq("reporting_year", year)
      .eq("reporting_month", month)
      .maybeSingle();

    if (sub) {
      const overrides = (sub.indicators as any) || {};
      setIndicators(computed.map((i) => ({ ...i, value: overrides[i.key] ?? i.value })));
      setRemarks(sub.remarks ?? "");
      setSubmission(sub);
    } else {
      setIndicators(computed);
      setRemarks("");
      setSubmission(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (facilityId) aggregate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityId, year, month]);

  const setIndicatorValue = (key: string, v: number) => {
    setIndicators((prev) => prev.map((i) => (i.key === key ? { ...i, value: v } : i)));
  };

  const indicatorRecord = () =>
    indicators.reduce<Record<string, number>>((acc, i) => {
      acc[i.key] = i.value;
      return acc;
    }, {});

  const save = async (status: "draft" | "submitted" | "locked") => {
    if (!facilityId) return;
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const payload: any = {
      facility_id: facilityId,
      reporting_year: year,
      reporting_month: month,
      indicators: indicatorRecord(),
      status,
      remarks,
    };
    if (status !== "draft") {
      payload.submitted_by = u.user?.id;
      payload.submitted_at = new Date().toISOString();
    }

    let res;
    if (submission?.id) {
      res = await supabase.from("nhmis_001_submissions").update(payload).eq("id", submission.id).select().maybeSingle();
    } else {
      res = await supabase.from("nhmis_001_submissions").insert(payload).select().maybeSingle();
    }
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    setSubmission(res.data);
    toast.success(
      status === "draft" ? "Draft saved" : status === "submitted" ? "Submitted to LGA" : "Locked & finalized"
    );
  };

  const exportCsv = () => {
    const rows = [
      ["Section", "Indicator", "Value"],
      ...indicators.map((i) => [i.section, i.label, String(i.value)]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `NHMIS001_${facilityName || "facility"}_${year}-${String(month).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const printForm = () => window.print();

  const grouped = SECTIONS.map((s) => ({ section: s, items: indicators.filter((i) => i.section === s) }));
  const locked = submission?.status === "locked";

  return (
    <div className="container max-w-6xl py-8 space-y-6 print:py-2">
      <div className="flex items-start justify-between flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
            NHMIS 001 — Monthly Summary
          </h1>
          <p className="text-muted-foreground mt-1">
            National Health Management Information System — facility monthly aggregate, auto-derived from clinical activity.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={aggregate} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />Re-aggregate
          </Button>
          <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          <Button variant="outline" onClick={printForm}><Printer className="h-4 w-4 mr-2" />Print</Button>
          <Button onClick={() => save("draft")} disabled={saving || locked}>
            <Save className="h-4 w-4 mr-2" />Save draft
          </Button>
          <Button onClick={() => save("submitted")} disabled={saving || locked}>Submit</Button>
          <Button variant="destructive" onClick={() => save("locked")} disabled={saving || locked}>
            <Lock className="h-4 w-4 mr-2" />Lock
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ClipboardList className="h-5 w-5" />
                {facilityName || "Facility"} · {MONTHS[month - 1]} {year}
              </CardTitle>
              <CardDescription>
                Period {format(new Date(periodStart), "dd MMM yyyy")} – {format(new Date(periodEnd), "dd MMM yyyy")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 print:hidden">
              <div className="flex items-center gap-2">
                <Label htmlFor="month">Month</Label>
                <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                  <SelectTrigger className="w-36" id="month"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, idx) => <SelectItem key={m} value={String(idx + 1)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" className="w-24" value={year} onChange={(e) => setYear(Number(e.target.value))} />
              </div>
              {submission && (
                <Badge className={
                  submission.status === "locked" ? "bg-destructive/15 text-destructive" :
                  submission.status === "submitted" ? "bg-emerald-500/15 text-emerald-700" :
                  "bg-muted text-muted-foreground"
                }>
                  {submission.status}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {locked && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertTitle>Form locked</AlertTitle>
              <AlertDescription>This submission has been finalized and can no longer be edited.</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <div className="space-y-6">
              {grouped.map((g) => g.items.length === 0 ? null : (
                <div key={g.section}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">{g.section}</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-3 py-2 w-2/3">Indicator</th>
                          <th className="text-right px-3 py-2">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.items.map((i) => (
                          <tr key={i.key} className="border-t">
                            <td className="px-3 py-2">{i.label}</td>
                            <td className="px-3 py-2 text-right">
                              <Input
                                type="number"
                                className="w-28 text-right ml-auto print:border-0 print:bg-transparent"
                                value={i.value}
                                onChange={(e) => setIndicatorValue(i.key, Number(e.target.value) || 0)}
                                disabled={locked}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              <div>
                <Label htmlFor="remarks">Remarks / Notes</Label>
                <Textarea
                  id="remarks"
                  className="mt-1"
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  disabled={locked}
                  placeholder="Stock-outs, outbreaks, supervisory notes…"
                />
              </div>

              {submission?.submitted_at && (
                <div className="text-xs text-muted-foreground">
                  Submitted {format(new Date(submission.submitted_at), "dd MMM yyyy HH:mm")}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground print:block hidden">
        Integra+ · NHMIS 001 monthly facility summary · Generated {format(new Date(), "dd MMM yyyy HH:mm")}
      </p>
    </div>
  );
}
