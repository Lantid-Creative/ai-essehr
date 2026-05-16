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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Target, TrendingUp, Users, Baby } from 'lucide-react';
import { toast } from 'sonner';

type Microplan = {
  id: string;
  facility_id: string;
  plan_year: number;
  plan_period: string;
  catchment_population: number | null;
  under_5_population: number | null;
  pregnant_women_estimate: number | null;
  strategies: string | null;
  budget_ngn: number | null;
  status: string;
  notes: string | null;
};

type MicroplanTarget = {
  id: string;
  microplan_id: string;
  facility_id: string;
  indicator_code: string;
  indicator_name: string;
  category: string;
  unit: string | null;
  target_month: number | null;
  target_value: number;
  achieved_value: number;
  notes: string | null;
};

const DEFAULT_INDICATORS = [
  { code: 'ANC1', name: 'ANC 1st visit', category: 'mch' },
  { code: 'ANC4', name: 'ANC 4+ visits', category: 'mch' },
  { code: 'DEL_SBA', name: 'Deliveries by skilled attendant', category: 'mch' },
  { code: 'PNC', name: 'Postnatal care visits', category: 'mch' },
  { code: 'PENTA3', name: 'Penta 3 doses', category: 'immunization' },
  { code: 'MEASLES', name: 'Measles 1st dose', category: 'immunization' },
  { code: 'BCG', name: 'BCG vaccinations', category: 'immunization' },
  { code: 'OPD', name: 'OPD attendance', category: 'general' },
  { code: 'IPD', name: 'IPD admissions', category: 'general' },
  { code: 'FP_NEW', name: 'New FP acceptors', category: 'fp' },
];

export default function FacilityMicroplanPage() {
  const { facilityId, roles, profile } = useAppContext();
  const facility = facilityId ? { id: facilityId } : null;
  const canManage = roles.includes('facility_admin') || roles.includes('super_admin');

  const [plans, setPlans] = useState<Microplan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Microplan | null>(null);
  const [targets, setTargets] = useState<MicroplanTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPlan, setOpenPlan] = useState(false);
  const [openTarget, setOpenTarget] = useState(false);
  const [openAchieved, setOpenAchieved] = useState<MicroplanTarget | null>(null);

  const [planForm, setPlanForm] = useState({
    plan_year: new Date().getFullYear(),
    plan_period: 'annual',
    catchment_population: '',
    under_5_population: '',
    pregnant_women_estimate: '',
    strategies: '',
    budget_ngn: '',
    notes: '',
    status: 'draft',
  });

  const [targetForm, setTargetForm] = useState({
    indicator_code: DEFAULT_INDICATORS[0].code,
    indicator_name: DEFAULT_INDICATORS[0].name,
    category: DEFAULT_INDICATORS[0].category,
    target_month: '0',
    target_value: '',
    notes: '',
  });

  const [achievedValue, setAchievedValue] = useState('');

  const loadPlans = async () => {
    if (!facility?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('facility_microplans')
      .select('*')
      .eq('facility_id', facility.id)
      .order('plan_year', { ascending: false });
    if (error) toast.error(error.message);
    else {
      setPlans(data || []);
      if (data && data.length && !selectedPlan) setSelectedPlan(data[0]);
    }
    setLoading(false);
  };

  const loadTargets = async (planId: string) => {
    const { data, error } = await supabase
      .from('microplan_targets')
      .select('*')
      .eq('microplan_id', planId)
      .order('category', { ascending: true });
    if (error) toast.error(error.message);
    else setTargets(data || []);
  };

  useEffect(() => {
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facility?.id]);

  useEffect(() => {
    if (selectedPlan) loadTargets(selectedPlan.id);
  }, [selectedPlan]);

  const submitPlan = async () => {
    if (!facility?.id) return;
    const { data, error } = await supabase.from('facility_microplans').insert({
      facility_id: facility.id,
      plan_year: Number(planForm.plan_year),
      plan_period: planForm.plan_period,
      catchment_population: planForm.catchment_population ? Number(planForm.catchment_population) : null,
      under_5_population: planForm.under_5_population ? Number(planForm.under_5_population) : null,
      pregnant_women_estimate: planForm.pregnant_women_estimate ? Number(planForm.pregnant_women_estimate) : null,
      strategies: planForm.strategies || null,
      budget_ngn: planForm.budget_ngn ? Number(planForm.budget_ngn) : null,
      notes: planForm.notes || null,
      status: planForm.status,
      created_by: profile?.id,
    }).select().single();
    if (error) return toast.error(error.message);
    toast.success('Microplan created');
    setOpenPlan(false);
    setSelectedPlan(data as Microplan);
    loadPlans();
  };

  const submitTarget = async () => {
    if (!selectedPlan) return;
    const ind = DEFAULT_INDICATORS.find(i => i.code === targetForm.indicator_code);
    const { error } = await supabase.from('microplan_targets').insert({
      microplan_id: selectedPlan.id,
      facility_id: selectedPlan.facility_id,
      indicator_code: targetForm.indicator_code,
      indicator_name: ind?.name || targetForm.indicator_name,
      category: ind?.category || targetForm.category,
      target_month: targetForm.target_month === '0' ? null : Number(targetForm.target_month),
      target_value: Number(targetForm.target_value || 0),
      notes: targetForm.notes || null,
      created_by: profile?.id,
    });
    if (error) return toast.error(error.message);
    toast.success('Target added');
    setOpenTarget(false);
    setTargetForm({ ...targetForm, target_value: '', notes: '' });
    loadTargets(selectedPlan.id);
  };

  const updateAchieved = async () => {
    if (!openAchieved) return;
    const { error } = await supabase
      .from('microplan_targets')
      .update({ achieved_value: Number(achievedValue || 0) })
      .eq('id', openAchieved.id);
    if (error) return toast.error(error.message);
    toast.success('Achievement updated');
    setOpenAchieved(null);
    setAchievedValue('');
    if (selectedPlan) loadTargets(selectedPlan.id);
  };

  const totalTarget = targets.reduce((s, t) => s + Number(t.target_value), 0);
  const totalAchieved = targets.reduce((s, t) => s + Number(t.achieved_value), 0);
  const overallPct = totalTarget ? Math.round((totalAchieved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Facility Microplan &amp; Targets</h1>
          <p className="text-muted-foreground mt-1">
            Annual planning, catchment population, and indicator targets vs achievements.
          </p>
        </div>
        {canManage && (
          <Dialog open={openPlan} onOpenChange={setOpenPlan}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> New Microplan</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Create Microplan</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Year</Label>
                  <Input type="number" value={planForm.plan_year}
                    onChange={(e) => setPlanForm({ ...planForm, plan_year: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Period</Label>
                  <Select value={planForm.plan_period} onValueChange={(v) => setPlanForm({ ...planForm, plan_period: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="q1">Q1</SelectItem>
                      <SelectItem value="q2">Q2</SelectItem>
                      <SelectItem value="q3">Q3</SelectItem>
                      <SelectItem value="q4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Catchment population</Label>
                  <Input type="number" value={planForm.catchment_population}
                    onChange={(e) => setPlanForm({ ...planForm, catchment_population: e.target.value })} />
                </div>
                <div>
                  <Label>Under-5 population</Label>
                  <Input type="number" value={planForm.under_5_population}
                    onChange={(e) => setPlanForm({ ...planForm, under_5_population: e.target.value })} />
                </div>
                <div>
                  <Label>Pregnant women (est.)</Label>
                  <Input type="number" value={planForm.pregnant_women_estimate}
                    onChange={(e) => setPlanForm({ ...planForm, pregnant_women_estimate: e.target.value })} />
                </div>
                <div>
                  <Label>Budget (NGN)</Label>
                  <Input type="number" value={planForm.budget_ngn}
                    onChange={(e) => setPlanForm({ ...planForm, budget_ngn: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Strategies</Label>
                  <Textarea value={planForm.strategies}
                    onChange={(e) => setPlanForm({ ...planForm, strategies: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea value={planForm.notes}
                    onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={planForm.status} onValueChange={(v) => setPlanForm({ ...planForm, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={submitPlan}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : plans.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">
          No microplans yet. {canManage && 'Create one to begin planning your targets.'}
        </CardContent></Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {plans.map(p => (
              <Button key={p.id} variant={selectedPlan?.id === p.id ? 'default' : 'outline'} size="sm"
                onClick={() => setSelectedPlan(p)}>
                {p.plan_year} · {p.plan_period.toUpperCase()} <Badge variant="secondary" className="ml-2">{p.status}</Badge>
              </Button>
            ))}
          </div>

          {selectedPlan && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><Users className="h-4 w-4" />Catchment</CardDescription></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{selectedPlan.catchment_population?.toLocaleString() ?? '—'}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><Baby className="h-4 w-4" />Under-5</CardDescription></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{selectedPlan.under_5_population?.toLocaleString() ?? '—'}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><Target className="h-4 w-4" />Indicators</CardDescription></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{targets.length}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardDescription className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />Overall achievement</CardDescription></CardHeader>
                  <CardContent><p className="text-2xl font-bold">{overallPct}%</p></CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Targets — {selectedPlan.plan_year} {selectedPlan.plan_period.toUpperCase()}</CardTitle>
                    <CardDescription>Track planned vs achieved indicator values.</CardDescription>
                  </div>
                  {canManage && (
                    <Dialog open={openTarget} onOpenChange={setOpenTarget}>
                      <DialogTrigger asChild>
                        <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Target</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Add Indicator Target</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                          <div>
                            <Label>Indicator</Label>
                            <Select value={targetForm.indicator_code}
                              onValueChange={(v) => {
                                const ind = DEFAULT_INDICATORS.find(i => i.code === v)!;
                                setTargetForm({ ...targetForm, indicator_code: v, indicator_name: ind.name, category: ind.category });
                              }}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {DEFAULT_INDICATORS.map(i => (
                                  <SelectItem key={i.code} value={i.code}>{i.code} — {i.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Month (0 = whole period)</Label>
                            <Input type="number" min={0} max={12} value={targetForm.target_month}
                              onChange={(e) => setTargetForm({ ...targetForm, target_month: e.target.value })} />
                          </div>
                          <div>
                            <Label>Target value</Label>
                            <Input type="number" value={targetForm.target_value}
                              onChange={(e) => setTargetForm({ ...targetForm, target_value: e.target.value })} />
                          </div>
                          <div>
                            <Label>Notes</Label>
                            <Textarea value={targetForm.notes}
                              onChange={(e) => setTargetForm({ ...targetForm, notes: e.target.value })} />
                          </div>
                        </div>
                        <DialogFooter><Button onClick={submitTarget}>Add</Button></DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardHeader>
                <CardContent>
                  {targets.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No targets yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Indicator</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Month</TableHead>
                          <TableHead className="text-right">Target</TableHead>
                          <TableHead className="text-right">Achieved</TableHead>
                          <TableHead className="text-right">%</TableHead>
                          {canManage && <TableHead></TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {targets.map(t => {
                          const pct = Number(t.target_value) ? Math.round((Number(t.achieved_value) / Number(t.target_value)) * 100) : 0;
                          return (
                            <TableRow key={t.id}>
                              <TableCell className="font-medium">{t.indicator_code} — {t.indicator_name}</TableCell>
                              <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                              <TableCell>{t.target_month ?? 'Whole period'}</TableCell>
                              <TableCell className="text-right">{Number(t.target_value).toLocaleString()}</TableCell>
                              <TableCell className="text-right">{Number(t.achieved_value).toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant={pct >= 100 ? 'default' : pct >= 70 ? 'secondary' : 'destructive'}>{pct}%</Badge>
                              </TableCell>
                              {canManage && (
                                <TableCell>
                                  <Button size="sm" variant="ghost"
                                    onClick={() => { setOpenAchieved(t); setAchievedValue(String(t.achieved_value)); }}>
                                    Update
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

      <Dialog open={!!openAchieved} onOpenChange={(o) => !o && setOpenAchieved(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Achievement</DialogTitle></DialogHeader>
          {openAchieved && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {openAchieved.indicator_code} — {openAchieved.indicator_name}
              </p>
              <div>
                <Label>Achieved value</Label>
                <Input type="number" value={achievedValue}
                  onChange={(e) => setAchievedValue(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={updateAchieved}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
