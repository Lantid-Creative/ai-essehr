import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Target, TrendingUp, ListChecks, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type Project = {
  id: string;
  title: string;
  problem_statement: string | null;
  aim_statement: string | null;
  category: string | null;
  baseline_value: number | null;
  target_value: number | null;
  current_value: number | null;
  measure_unit: string | null;
  team_lead: string | null;
  team_members: string | null;
  start_date: string | null;
  target_end_date: string | null;
  actual_end_date: string | null;
  status: string;
  outcome_summary: string | null;
};

type Cycle = {
  id: string;
  project_id: string;
  facility_id: string;
  cycle_number: number;
  cycle_start_date: string | null;
  cycle_end_date: string | null;
  plan_text: string | null;
  do_text: string | null;
  study_text: string | null;
  act_text: string | null;
  measured_value: number | null;
  status: string;
  notes: string | null;
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  planning: 'secondary',
  active: 'default',
  completed: 'outline',
  on_hold: 'secondary',
  cancelled: 'destructive',
};

export default function QualityImprovementPage() {
  const { facilityId, roles } = useAppContext();
  const canManage = roles.includes('facility_admin') || roles.includes('super_admin');

  const [projects, setProjects] = useState<Project[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [openProject, setOpenProject] = useState(false);
  const [openCycle, setOpenCycle] = useState(false);
  const [editCycle, setEditCycle] = useState<Cycle | null>(null);

  const emptyProject = {
    title: '', problem_statement: '', aim_statement: '', category: 'clinical',
    baseline_value: '', target_value: '', current_value: '', measure_unit: '',
    team_lead: '', team_members: '',
    start_date: new Date().toISOString().slice(0, 10),
    target_end_date: '', status: 'planning', outcome_summary: '',
  };
  const [projectForm, setProjectForm] = useState(emptyProject);

  const emptyCycle = {
    cycle_number: 1,
    cycle_start_date: new Date().toISOString().slice(0, 10),
    cycle_end_date: '',
    plan_text: '', do_text: '', study_text: '', act_text: '',
    measured_value: '', status: 'planning', notes: '',
  };
  const [cycleForm, setCycleForm] = useState(emptyCycle);

  const loadProjects = async () => {
    if (!facilityId) return;
    setLoading(true);
    const { data } = await supabase
      .from('qi_projects')
      .select('*')
      .eq('facility_id', facilityId)
      .order('created_at', { ascending: false });
    if (data) setProjects(data as Project[]);
    setLoading(false);
  };

  const loadCycles = async (projectId: string) => {
    const { data } = await supabase
      .from('qi_pdsa_cycles')
      .select('*')
      .eq('project_id', projectId)
      .order('cycle_number', { ascending: true });
    if (data) setCycles(data as Cycle[]);
  };

  useEffect(() => { loadProjects(); }, [facilityId]);
  useEffect(() => { if (selected) loadCycles(selected.id); else setCycles([]); }, [selected]);

  const saveProject = async () => {
    if (!facilityId) return;
    if (!projectForm.title) return toast.error('Title required');
    const { error } = await supabase.from('qi_projects').insert({
      facility_id: facilityId,
      title: projectForm.title,
      problem_statement: projectForm.problem_statement || null,
      aim_statement: projectForm.aim_statement || null,
      category: projectForm.category || null,
      baseline_value: projectForm.baseline_value ? parseFloat(projectForm.baseline_value) : null,
      target_value: projectForm.target_value ? parseFloat(projectForm.target_value) : null,
      current_value: projectForm.current_value ? parseFloat(projectForm.current_value) : null,
      measure_unit: projectForm.measure_unit || null,
      team_lead: projectForm.team_lead || null,
      team_members: projectForm.team_members || null,
      start_date: projectForm.start_date || null,
      target_end_date: projectForm.target_end_date || null,
      status: projectForm.status,
      outcome_summary: projectForm.outcome_summary || null,
    });
    if (error) return toast.error(error.message);
    toast.success('QI project created');
    setOpenProject(false);
    setProjectForm(emptyProject);
    loadProjects();
  };

  const saveCycle = async () => {
    if (!facilityId || !selected) return;
    const payload = {
      facility_id: facilityId,
      project_id: selected.id,
      cycle_number: cycleForm.cycle_number,
      cycle_start_date: cycleForm.cycle_start_date || null,
      cycle_end_date: cycleForm.cycle_end_date || null,
      plan_text: cycleForm.plan_text || null,
      do_text: cycleForm.do_text || null,
      study_text: cycleForm.study_text || null,
      act_text: cycleForm.act_text || null,
      measured_value: cycleForm.measured_value ? parseFloat(cycleForm.measured_value) : null,
      status: cycleForm.status,
      notes: cycleForm.notes || null,
    };
    const op = editCycle
      ? supabase.from('qi_pdsa_cycles').update(payload).eq('id', editCycle.id)
      : supabase.from('qi_pdsa_cycles').insert(payload);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success(editCycle ? 'Cycle updated' : 'Cycle added');
    setOpenCycle(false);
    setEditCycle(null);
    setCycleForm({ ...emptyCycle, cycle_number: cycles.length + 1 });
    loadCycles(selected.id);
    // refresh project current_value if measured
    if (payload.measured_value != null) {
      await supabase.from('qi_projects').update({ current_value: payload.measured_value }).eq('id', selected.id);
      loadProjects();
      setSelected({ ...selected, current_value: payload.measured_value });
    }
  };

  const openNewCycle = () => {
    setEditCycle(null);
    setCycleForm({ ...emptyCycle, cycle_number: cycles.length + 1 });
    setOpenCycle(true);
  };

  const openEditCycle = (c: Cycle) => {
    setEditCycle(c);
    setCycleForm({
      cycle_number: c.cycle_number,
      cycle_start_date: c.cycle_start_date ?? '',
      cycle_end_date: c.cycle_end_date ?? '',
      plan_text: c.plan_text ?? '',
      do_text: c.do_text ?? '',
      study_text: c.study_text ?? '',
      act_text: c.act_text ?? '',
      measured_value: c.measured_value?.toString() ?? '',
      status: c.status,
      notes: c.notes ?? '',
    });
    setOpenCycle(true);
  };

  const progressFor = (p: Project) => {
    if (p.baseline_value == null || p.target_value == null || p.current_value == null) return null;
    const range = p.target_value - p.baseline_value;
    if (range === 0) return 100;
    const moved = p.current_value - p.baseline_value;
    return Math.max(0, Math.min(100, Math.round((moved / range) * 100)));
  };

  if (selected) {
    const pct = progressFor(selected);
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setSelected(null)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
          <h1 className="text-2xl font-bold flex-1">{selected.title}</h1>
          <Badge variant={STATUS_VARIANTS[selected.status] ?? 'secondary'}>{selected.status}</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader><CardDescription>Aim</CardDescription><CardTitle className="text-base">{selected.aim_statement ?? '—'}</CardTitle></CardHeader></Card>
          <Card><CardHeader><CardDescription>Team Lead</CardDescription><CardTitle className="text-base">{selected.team_lead ?? '—'}</CardTitle></CardHeader></Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription>Progress to Target</CardDescription></CardHeader>
            <CardContent>
              {pct == null ? <p className="text-sm text-muted-foreground">Set baseline, target & current</p> : (
                <>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{selected.current_value} {selected.measure_unit}</span>
                    <span className="text-muted-foreground">Target: {selected.target_value}</span>
                  </div>
                  <Progress value={pct} />
                  <p className="text-xs text-muted-foreground mt-1">{pct}% achieved</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {selected.problem_statement && (
          <Card><CardHeader><CardTitle className="text-lg">Problem Statement</CardTitle></CardHeader><CardContent><p className="text-sm whitespace-pre-wrap">{selected.problem_statement}</p></CardContent></Card>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">PDSA Cycles</h2>
          {canManage && <Button onClick={openNewCycle}><Plus className="mr-2 h-4 w-4" />New Cycle</Button>}
        </div>

        <div className="grid gap-4">
          {cycles.length === 0 ? <Card><CardContent className="text-center py-12 text-muted-foreground">No cycles yet. Add the first PDSA cycle.</CardContent></Card> :
          cycles.map(c => (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle className="text-base">Cycle #{c.cycle_number} · <span className="text-muted-foreground font-normal">{c.cycle_start_date ?? '—'}</span></CardTitle>
                  <div className="flex gap-2 items-center">
                    {c.measured_value != null && <Badge variant="outline">Measured: {c.measured_value}</Badge>}
                    <Badge variant={STATUS_VARIANTS[c.status] ?? 'secondary'}>{c.status}</Badge>
                    {canManage && <Button size="sm" variant="ghost" onClick={() => openEditCycle(c)}><RefreshCw className="h-3 w-3" /></Button>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div><span className="font-semibold text-primary">PLAN: </span>{c.plan_text ?? '—'}</div>
                  <div><span className="font-semibold text-primary">DO: </span>{c.do_text ?? '—'}</div>
                  <div><span className="font-semibold text-primary">STUDY: </span>{c.study_text ?? '—'}</div>
                  <div><span className="font-semibold text-primary">ACT: </span>{c.act_text ?? '—'}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={openCycle} onOpenChange={setOpenCycle}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editCycle ? 'Edit' : 'Add'} PDSA Cycle</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-4 gap-3">
                <div><Label>Cycle #</Label><Input type="number" value={cycleForm.cycle_number} onChange={(e) => setCycleForm({ ...cycleForm, cycle_number: parseInt(e.target.value) || 1 })} /></div>
                <div><Label>Start</Label><Input type="date" value={cycleForm.cycle_start_date} onChange={(e) => setCycleForm({ ...cycleForm, cycle_start_date: e.target.value })} /></div>
                <div><Label>End</Label><Input type="date" value={cycleForm.cycle_end_date} onChange={(e) => setCycleForm({ ...cycleForm, cycle_end_date: e.target.value })} /></div>
                <div><Label>Status</Label>
                  <Select value={cycleForm.status} onValueChange={(v) => setCycleForm({ ...cycleForm, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Plan — what & how</Label><Textarea value={cycleForm.plan_text} onChange={(e) => setCycleForm({ ...cycleForm, plan_text: e.target.value })} /></div>
              <div><Label>Do — what was executed, observations</Label><Textarea value={cycleForm.do_text} onChange={(e) => setCycleForm({ ...cycleForm, do_text: e.target.value })} /></div>
              <div><Label>Study — results vs prediction</Label><Textarea value={cycleForm.study_text} onChange={(e) => setCycleForm({ ...cycleForm, study_text: e.target.value })} /></div>
              <div><Label>Act — adopt / adapt / abandon</Label><Textarea value={cycleForm.act_text} onChange={(e) => setCycleForm({ ...cycleForm, act_text: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Measured Value ({selected.measure_unit ?? 'unit'})</Label><Input type="number" step="0.01" value={cycleForm.measured_value} onChange={(e) => setCycleForm({ ...cycleForm, measured_value: e.target.value })} /></div>
                <div><Label>Notes</Label><Input value={cycleForm.notes} onChange={(e) => setCycleForm({ ...cycleForm, notes: e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter><Button onClick={saveCycle}>Save Cycle</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Quality Improvement</h1>
          <p className="text-muted-foreground">PDSA-driven improvement projects across clinical and operational areas</p>
        </div>
        {canManage && (
          <Dialog open={openProject} onOpenChange={setOpenProject}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />New QI Project</Button></DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>New QI Project</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-2">
                <div><Label>Title *</Label><Input value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} placeholder="e.g. Reduce ANC waiting time" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Category</Label>
                    <Select value={projectForm.category} onValueChange={(v) => setProjectForm({ ...projectForm, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clinical">Clinical</SelectItem>
                        <SelectItem value="patient_safety">Patient Safety</SelectItem>
                        <SelectItem value="patient_experience">Patient Experience</SelectItem>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="infection_control">Infection Control</SelectItem>
                        <SelectItem value="data_quality">Data Quality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Status</Label>
                    <Select value={projectForm.status} onValueChange={(v) => setProjectForm({ ...projectForm, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Problem Statement</Label><Textarea value={projectForm.problem_statement} onChange={(e) => setProjectForm({ ...projectForm, problem_statement: e.target.value })} /></div>
                <div><Label>Aim Statement (SMART)</Label><Textarea value={projectForm.aim_statement} onChange={(e) => setProjectForm({ ...projectForm, aim_statement: e.target.value })} placeholder="By [date], we will [action] from [baseline] to [target]" /></div>
                <div className="grid grid-cols-4 gap-3">
                  <div><Label>Baseline</Label><Input type="number" step="0.01" value={projectForm.baseline_value} onChange={(e) => setProjectForm({ ...projectForm, baseline_value: e.target.value })} /></div>
                  <div><Label>Current</Label><Input type="number" step="0.01" value={projectForm.current_value} onChange={(e) => setProjectForm({ ...projectForm, current_value: e.target.value })} /></div>
                  <div><Label>Target</Label><Input type="number" step="0.01" value={projectForm.target_value} onChange={(e) => setProjectForm({ ...projectForm, target_value: e.target.value })} /></div>
                  <div><Label>Unit</Label><Input value={projectForm.measure_unit} onChange={(e) => setProjectForm({ ...projectForm, measure_unit: e.target.value })} placeholder="%, mins" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Team Lead</Label><Input value={projectForm.team_lead} onChange={(e) => setProjectForm({ ...projectForm, team_lead: e.target.value })} /></div>
                  <div><Label>Team Members</Label><Input value={projectForm.team_members} onChange={(e) => setProjectForm({ ...projectForm, team_members: e.target.value })} /></div>
                  <div><Label>Start Date</Label><Input type="date" value={projectForm.start_date} onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })} /></div>
                  <div><Label>Target End</Label><Input type="date" value={projectForm.target_end_date} onChange={(e) => setProjectForm({ ...projectForm, target_end_date: e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter><Button onClick={saveProject}>Create Project</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardDescription>Total Projects</CardDescription><CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5" />{projects.length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Active</CardDescription><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />{projects.filter(p => p.status === 'active').length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Completed</CardDescription><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />{projects.filter(p => p.status === 'completed').length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Planning</CardDescription><CardTitle className="flex items-center gap-2">{projects.filter(p => p.status === 'planning').length}</CardTitle></CardHeader></Card>
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Lead</TableHead><TableHead>Progress</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={5} className="text-center py-8">Loading…</TableCell></TableRow> :
            projects.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No QI projects yet</TableCell></TableRow> :
            projects.map(p => {
              const pct = progressFor(p);
              return (
                <TableRow key={p.id} className="cursor-pointer" onClick={() => setSelected(p)}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="capitalize">{p.category?.replace('_', ' ') ?? '—'}</TableCell>
                  <TableCell>{p.team_lead ?? '—'}</TableCell>
                  <TableCell className="w-48">{pct == null ? '—' : (<div className="flex items-center gap-2"><Progress value={pct} className="flex-1" /><span className="text-xs w-9 text-right">{pct}%</span></div>)}</TableCell>
                  <TableCell><Badge variant={STATUS_VARIANTS[p.status] ?? 'secondary'}>{p.status}</Badge></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
