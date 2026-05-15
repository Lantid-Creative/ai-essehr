import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAppContext } from "@/context/AppContext";
import { Plus, Trash2, Play, Save, Download, Printer, FileBarChart } from "lucide-react";

// ---------------- Dataset metadata ----------------
type FieldType = "text" | "number" | "date" | "boolean";
interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
}
interface DatasetDef {
  id: string;
  table: string;
  label: string;
  description: string;
  facilityColumn?: string;
  dateColumn?: string;
  fields: FieldDef[];
}

const DATASETS: DatasetDef[] = [
  {
    id: "encounters",
    table: "encounters",
    label: "Encounters / Visits",
    description: "Outpatient, inpatient, ANC, emergency visits",
    facilityColumn: "facility_id",
    dateColumn: "encounter_date",
    fields: [
      { key: "encounter_date", label: "Visit date", type: "date" },
      { key: "encounter_type", label: "Visit type", type: "text" },
      { key: "department", label: "Department", type: "text" },
      { key: "chief_complaint", label: "Chief complaint", type: "text" },
      { key: "diagnosis", label: "Diagnosis", type: "text" },
      { key: "patient_id", label: "Patient ID", type: "text" },
    ],
  },
  {
    id: "case_reports",
    table: "case_reports",
    label: "Case Reports (IDSR)",
    description: "Notifiable disease case reports",
    facilityColumn: "facility_id",
    dateColumn: "created_at",
    fields: [
      { key: "created_at", label: "Reported on", type: "date" },
      { key: "disease", label: "Disease", type: "text" },
      { key: "status", label: "Validation status", type: "text" },
      { key: "outcome", label: "Outcome", type: "text" },
      { key: "age_years", label: "Age (years)", type: "number" },
      { key: "sex", label: "Sex", type: "text" },
      { key: "lga", label: "LGA", type: "text" },
    ],
  },
  {
    id: "immunizations",
    table: "immunizations",
    label: "Immunizations",
    description: "Vaccine doses administered",
    facilityColumn: "facility_id",
    dateColumn: "administered_at",
    fields: [
      { key: "administered_at", label: "Date given", type: "date" },
      { key: "vaccine", label: "Vaccine", type: "text" },
      { key: "dose_number", label: "Dose #", type: "number" },
      { key: "patient_id", label: "Patient ID", type: "text" },
    ],
  },
  {
    id: "lab_results",
    table: "lab_results",
    label: "Lab Results",
    description: "Laboratory test results",
    facilityColumn: "facility_id",
    dateColumn: "created_at",
    fields: [
      { key: "created_at", label: "Result date", type: "date" },
      { key: "test_name", label: "Test", type: "text" },
      { key: "result", label: "Result", type: "text" },
      { key: "is_abnormal", label: "Abnormal", type: "boolean" },
    ],
  },
  {
    id: "patients",
    table: "patients",
    label: "Patients",
    description: "Patient registry",
    facilityColumn: "facility_id",
    dateColumn: "created_at",
    fields: [
      { key: "created_at", label: "Registered on", type: "date" },
      { key: "sex", label: "Sex", type: "text" },
      { key: "lga", label: "LGA", type: "text" },
      { key: "state", label: "State", type: "text" },
    ],
  },
  {
    id: "births",
    table: "birth_registrations",
    label: "Birth Registrations",
    description: "Live births recorded",
    facilityColumn: "facility_id",
    dateColumn: "date_of_birth",
    fields: [
      { key: "date_of_birth", label: "DOB", type: "date" },
      { key: "sex", label: "Sex", type: "text" },
      { key: "delivery_type", label: "Delivery type", type: "text" },
      { key: "nimc_status", label: "NIMC status", type: "text" },
    ],
  },
  {
    id: "deaths",
    table: "death_registrations",
    label: "Death Registrations",
    description: "Deaths recorded",
    facilityColumn: "facility_id",
    dateColumn: "date_of_death",
    fields: [
      { key: "date_of_death", label: "Date of death", type: "date" },
      { key: "sex", label: "Sex", type: "text" },
      { key: "age_years", label: "Age (years)", type: "number" },
      { key: "cause_of_death", label: "Cause of death", type: "text" },
      { key: "npopc_status", label: "NPopC status", type: "text" },
    ],
  },
];

const OPERATORS: Record<FieldType, { value: string; label: string }[]> = {
  text: [
    { value: "eq", label: "equals" },
    { value: "neq", label: "not equals" },
    { value: "ilike", label: "contains" },
    { value: "is_null", label: "is empty" },
    { value: "not_null", label: "is not empty" },
  ],
  number: [
    { value: "eq", label: "=" },
    { value: "gt", label: ">" },
    { value: "gte", label: ">=" },
    { value: "lt", label: "<" },
    { value: "lte", label: "<=" },
  ],
  date: [
    { value: "gte", label: "on or after" },
    { value: "lte", label: "on or before" },
    { value: "eq", label: "on" },
  ],
  boolean: [
    { value: "eq", label: "is" },
  ],
};

interface Filter {
  field: string;
  operator: string;
  value: string;
}

interface ReportConfig {
  selectedFields: string[];
  filters: Filter[];
  groupBy: string;
  sortBy: string;
  sortDir: "asc" | "desc";
  limit: number;
}

const DEFAULT_CONFIG: ReportConfig = {
  selectedFields: [],
  filters: [],
  groupBy: "",
  sortBy: "",
  sortDir: "desc",
  limit: 500,
};

interface SavedReport {
  id: string;
  name: string;
  description: string | null;
  dataset: string;
  config: any;
  is_shared: boolean;
  owner_id: string;
}

export default function CustomReportBuilderPage() {
  const { toast } = useToast();
  const { user } = useAppContext();
  const [datasetId, setDatasetId] = useState<string>(DATASETS[0].id);
  const [config, setConfig] = useState<ReportConfig>(DEFAULT_CONFIG);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<SavedReport[]>([]);
  const [reportName, setReportName] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const dataset = useMemo(() => DATASETS.find((d) => d.id === datasetId)!, [datasetId]);

  useEffect(() => {
    setConfig({ ...DEFAULT_CONFIG, selectedFields: dataset.fields.slice(0, 4).map((f) => f.key) });
    setResults([]);
  }, [datasetId]); // eslint-disable-line

  useEffect(() => {
    void loadSaved();
  }, []);

  const loadSaved = async () => {
    const { data, error } = await supabase
      .from("saved_reports")
      .select("*")
      .order("updated_at", { ascending: false });
    if (!error && data) setSaved(data as any);
  };

  const addFilter = () => {
    const f = dataset.fields[0];
    setConfig((c) => ({ ...c, filters: [...c.filters, { field: f.key, operator: OPERATORS[f.type][0].value, value: "" }] }));
  };
  const removeFilter = (i: number) =>
    setConfig((c) => ({ ...c, filters: c.filters.filter((_, idx) => idx !== i) }));
  const updateFilter = (i: number, patch: Partial<Filter>) =>
    setConfig((c) => ({ ...c, filters: c.filters.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) }));

  const toggleField = (key: string) =>
    setConfig((c) => ({
      ...c,
      selectedFields: c.selectedFields.includes(key)
        ? c.selectedFields.filter((k) => k !== key)
        : [...c.selectedFields, key],
    }));

  const runReport = async () => {
    if (config.selectedFields.length === 0) {
      toast({ title: "Select at least one column", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      let q = (supabase as any).from(dataset.table).select(config.selectedFields.join(","));
      for (const f of config.filters) {
        if (!f.value && f.operator !== "is_null" && f.operator !== "not_null") continue;
        const fieldDef = dataset.fields.find((x) => x.key === f.field);
        let v: any = f.value;
        if (fieldDef?.type === "number") v = Number(f.value);
        if (fieldDef?.type === "boolean") v = f.value === "true";
        switch (f.operator) {
          case "eq": q = q.eq(f.field, v); break;
          case "neq": q = q.neq(f.field, v); break;
          case "gt": q = q.gt(f.field, v); break;
          case "gte": q = q.gte(f.field, v); break;
          case "lt": q = q.lt(f.field, v); break;
          case "lte": q = q.lte(f.field, v); break;
          case "ilike": q = q.ilike(f.field, `%${v}%`); break;
          case "is_null": q = q.is(f.field, null); break;
          case "not_null": q = q.not(f.field, "is", null); break;
        }
      }
      if (config.sortBy) q = q.order(config.sortBy, { ascending: config.sortDir === "asc" });
      q = q.limit(Math.min(config.limit, 5000));
      const { data, error } = await q;
      if (error) throw error;
      setResults((data as any[]) || []);
      toast({ title: `Loaded ${data?.length ?? 0} rows` });
    } catch (e: any) {
      toast({ title: "Query failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => {
    if (!config.groupBy || results.length === 0) return null;
    const map = new Map<string, number>();
    for (const r of results) {
      const k = String(r[config.groupBy] ?? "(empty)");
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ key, count }));
  }, [results, config.groupBy]);

  const exportCsv = () => {
    if (results.length === 0) return;
    const headers = config.selectedFields;
    const lines = [headers.join(",")];
    for (const r of results) {
      lines.push(
        headers
          .map((h) => {
            const v = r[h];
            if (v === null || v === undefined) return "";
            const s = String(v).replace(/"/g, '""');
            return /[",\n]/.test(s) ? `"${s}"` : s;
          })
          .join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dataset.id}-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => window.print();

  const saveReport = async () => {
    if (!reportName.trim()) {
      toast({ title: "Report name required", variant: "destructive" });
      return;
    }
    if (!user) return;
    const payload = {
      name: reportName,
      description: reportDesc || null,
      dataset: datasetId,
      config: config as any,
      is_shared: isShared,
      owner_id: user.id,
      facility_id: (user as any).facility_id ?? null,
    };
    const { error } = editingId
      ? await supabase.from("saved_reports").update(payload).eq("id", editingId)
      : await supabase.from("saved_reports").insert(payload);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editingId ? "Report updated" : "Report saved" });
    setEditingId(null);
    setReportName("");
    setReportDesc("");
    setIsShared(false);
    void loadSaved();
  };

  const loadSavedReport = (r: SavedReport) => {
    setDatasetId(r.dataset);
    setTimeout(() => setConfig(r.config), 0);
    setReportName(r.name);
    setReportDesc(r.description ?? "");
    setIsShared(r.is_shared);
    setEditingId(r.id);
    toast({ title: `Loaded "${r.name}"` });
  };

  const deleteReport = async (id: string) => {
    const { error } = await supabase.from("saved_reports").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Deleted" });
    void loadSaved();
  };

  return (
    <div className="space-y-6 p-2">
      <div className="flex items-center gap-3">
        <FileBarChart className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Custom Report Builder</h1>
          <p className="text-sm text-muted-foreground">
            Build, save, and share ad-hoc reports across clinical datasets.
          </p>
        </div>
      </div>

      <Tabs defaultValue="build" className="w-full">
        <TabsList>
          <TabsTrigger value="build">Build</TabsTrigger>
          <TabsTrigger value="results">Results ({results.length})</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports ({saved.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="build" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>1. Choose dataset</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={datasetId} onValueChange={setDatasetId}>
                <SelectTrigger className="max-w-md"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DATASETS.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{d.label}</span>
                        <span className="text-xs text-muted-foreground">{d.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>2. Pick columns</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {dataset.fields.map((f) => (
                  <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={config.selectedFields.includes(f.key)}
                      onCheckedChange={() => toggleField(f.key)}
                    />
                    <span className="text-sm">{f.label}</span>
                    <Badge variant="outline" className="text-[10px]">{f.type}</Badge>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>3. Filters</CardTitle>
              <Button size="sm" variant="outline" onClick={addFilter}>
                <Plus className="h-4 w-4 mr-1" /> Add filter
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {config.filters.length === 0 && (
                <p className="text-sm text-muted-foreground">No filters — all rows will be returned.</p>
              )}
              {config.filters.map((f, i) => {
                const fd = dataset.fields.find((x) => x.key === f.field)!;
                const ops = OPERATORS[fd?.type ?? "text"];
                const needsValue = f.operator !== "is_null" && f.operator !== "not_null";
                return (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <Select value={f.field} onValueChange={(v) => {
                      const nfd = dataset.fields.find((x) => x.key === v)!;
                      updateFilter(i, { field: v, operator: OPERATORS[nfd.type][0].value, value: "" });
                    }}>
                      <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {dataset.fields.map((d) => <SelectItem key={d.key} value={d.key}>{d.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={f.operator} onValueChange={(v) => updateFilter(i, { operator: v })}>
                      <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ops.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {needsValue && (
                      fd.type === "boolean" ? (
                        <Select value={f.value} onValueChange={(v) => updateFilter(i, { value: v })}>
                          <SelectTrigger className="w-[120px]"><SelectValue placeholder="value" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">true</SelectItem>
                            <SelectItem value="false">false</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={fd.type === "date" ? "date" : fd.type === "number" ? "number" : "text"}
                          className="w-[200px]"
                          value={f.value}
                          onChange={(e) => updateFilter(i, { value: e.target.value })}
                        />
                      )
                    )}
                    <Button size="icon" variant="ghost" onClick={() => removeFilter(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>4. Group, sort & limit</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label>Group by</Label>
                <Select value={config.groupBy || "__none"} onValueChange={(v) => setConfig({ ...config, groupBy: v === "__none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="(none)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">(none)</SelectItem>
                    {dataset.fields.map((d) => <SelectItem key={d.key} value={d.key}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sort by</Label>
                <Select value={config.sortBy || "__none"} onValueChange={(v) => setConfig({ ...config, sortBy: v === "__none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="(none)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">(none)</SelectItem>
                    {dataset.fields.map((d) => <SelectItem key={d.key} value={d.key}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Direction</Label>
                <Select value={config.sortDir} onValueChange={(v: any) => setConfig({ ...config, sortDir: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Row limit</Label>
                <Input type="number" min={1} max={5000} value={config.limit}
                  onChange={(e) => setConfig({ ...config, limit: Number(e.target.value) })} />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button onClick={runReport} disabled={loading}>
              <Play className="h-4 w-4 mr-1" /> {loading ? "Running…" : "Run report"}
            </Button>
            <Button variant="outline" onClick={exportCsv} disabled={results.length === 0}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
            <Button variant="outline" onClick={printReport} disabled={results.length === 0}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>

          <Card>
            <CardHeader><CardTitle>5. Save this report</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Report name</Label>
                  <Input value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="e.g. Weekly malaria cases" />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={isShared} onCheckedChange={(v) => setIsShared(Boolean(v))} />
                    <span className="text-sm">Share with my facility</span>
                  </label>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} rows={2} />
              </div>
              <Button onClick={saveReport}>
                <Save className="h-4 w-4 mr-1" /> {editingId ? "Update report" : "Save report"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {grouped && (
            <Card>
              <CardHeader><CardTitle>Grouped by {dataset.fields.find((f) => f.key === config.groupBy)?.label}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Value</TableHead><TableHead className="text-right">Count</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {grouped.map((g) => (
                      <TableRow key={g.key}><TableCell>{g.key}</TableCell><TableCell className="text-right font-medium">{g.count}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader><CardTitle>Rows ({results.length})</CardTitle></CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <p className="text-sm text-muted-foreground">Run the report to see results.</p>
              ) : (
                <div className="overflow-auto max-h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {config.selectedFields.map((f) => <TableHead key={f}>{dataset.fields.find((x) => x.key === f)?.label ?? f}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((r, i) => (
                        <TableRow key={i}>
                          {config.selectedFields.map((f) => (
                            <TableCell key={f} className="text-sm">
                              {r[f] === null || r[f] === undefined ? "—" : String(r[f])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-3">
          {saved.length === 0 && <p className="text-sm text-muted-foreground">No saved reports yet.</p>}
          {saved.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{r.name}</h3>
                    {r.is_shared && <Badge variant="secondary">Shared</Badge>}
                    <Badge variant="outline">{DATASETS.find((d) => d.id === r.dataset)?.label ?? r.dataset}</Badge>
                  </div>
                  {r.description && <p className="text-sm text-muted-foreground mt-1">{r.description}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => loadSavedReport(r)}>Load</Button>
                  {user?.id === r.owner_id && (
                    <Button size="sm" variant="ghost" onClick={() => deleteReport(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
