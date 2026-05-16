import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Users, Wrench, Zap, Truck, Banknote } from 'lucide-react';

type TabKey = 'hrh' | 'equipment' | 'utilities' | 'vehicles' | 'finance';

const TAB_META: Record<TabKey, { table: 'hrh_roster' | 'equipment_register' | 'utilities_log' | 'vehicle_maintenance' | 'finance_ledger'; label: string; icon: any; orderBy: string }> = {
  hrh: { table: 'hrh_roster', label: 'HRH Roster', icon: Users, orderBy: 'shift_date' },
  equipment: { table: 'equipment_register', label: 'Equipment', icon: Wrench, orderBy: 'created_at' },
  utilities: { table: 'utilities_log', label: 'Utilities', icon: Zap, orderBy: 'log_date' },
  vehicles: { table: 'vehicle_maintenance', label: 'Vehicles', icon: Truck, orderBy: 'service_date' },
  finance: { table: 'finance_ledger', label: 'Finance', icon: Banknote, orderBy: 'entry_date' },
};

export default function FacilityOperationsPage() {
  const { profile, roles } = useAppContext();
  const facilityId = profile?.facility_id;
  const canEdit = roles.includes('facility_admin') || roles.includes('super_admin');

  const [tab, setTab] = useState<TabKey>('hrh');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});

  const load = async () => {
    if (!facilityId) return;
    setLoading(true);
    const meta = TAB_META[tab];
    const { data, error } = await supabase
      .from(meta.table)
      .select('*')
      .eq('facility_id', facilityId)
      .order(meta.orderBy, { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab, facilityId]);

  const openNew = () => {
    const defaults: Record<TabKey, any> = {
      hrh: { shift_type: 'morning', attendance_status: 'scheduled', shift_date: new Date().toISOString().slice(0,10) },
      equipment: { condition: 'functional', status: 'in_use' },
      utilities: { utility_type: 'power', log_date: new Date().toISOString().slice(0,10), downtime_minutes: 0, cost: 0 },
      vehicles: { service_type: 'routine', service_date: new Date().toISOString().slice(0,10), cost: 0 },
      finance: { entry_type: 'income', entry_date: new Date().toISOString().slice(0,10), amount: 0 },
    };
    setForm(defaults[tab]);
    setDialogOpen(true);
  };

  const save = async () => {
    if (!facilityId) return toast.error('No facility');
    const meta = TAB_META[tab];
    const payload = { ...form, facility_id: facilityId, created_by: profile?.id };
    const { error } = await supabase.from(meta.table).insert(payload);
    if (error) return toast.error(error.message);
    toast.success('Saved');
    setDialogOpen(false);
    setForm({});
    load();
  };

  const fields = useMemo(() => getFields(tab), [tab]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Facility Operations</h1>
        <p className="text-muted-foreground">HR, equipment, utilities, vehicles and finance for your facility.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          {(Object.keys(TAB_META) as TabKey[]).map((k) => {
            const Icon = TAB_META[k].icon;
            return (
              <TabsTrigger key={k} value={k} className="gap-2">
                <Icon className="h-4 w-4" /> {TAB_META[k].label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(TAB_META) as TabKey[]).map((k) => (
          <TabsContent key={k} value={k} className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{TAB_META[k].label}</CardTitle>
                {canEdit && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> New entry</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader><DialogTitle>New {TAB_META[tab].label} entry</DialogTitle></DialogHeader>
                      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {fields.map((f) => (
                          <div key={f.name} className="space-y-1">
                            <Label>{f.label}{f.required && <span className="text-destructive"> *</span>}</Label>
                            {f.type === 'select' ? (
                              <Select value={form[f.name] || ''} onValueChange={(v) => setForm({ ...form, [f.name]: v })}>
                                <SelectTrigger><SelectValue placeholder={`Select ${f.label}`} /></SelectTrigger>
                                <SelectContent>
                                  {f.options!.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            ) : f.type === 'textarea' ? (
                              <Textarea value={form[f.name] || ''} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                            ) : (
                              <Input
                                type={f.type}
                                value={form[f.name] ?? ''}
                                onChange={(e) => setForm({ ...form, [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={save}>Save</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-muted-foreground text-sm">Loading…</div>
                ) : rows.length === 0 ? (
                  <div className="text-muted-foreground text-sm">No entries yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {getColumns(tab).map((c) => <TableHead key={c.key}>{c.label}</TableHead>)}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((r) => (
                          <TableRow key={r.id}>
                            {getColumns(tab).map((c) => (
                              <TableCell key={c.key}>
                                {c.render ? c.render(r[c.key], r) : (r[c.key] ?? '—')}
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
        ))}
      </Tabs>
    </div>
  );
}

type Field = { name: string; label: string; type: 'text' | 'number' | 'date' | 'textarea' | 'select'; options?: string[]; required?: boolean };

function getFields(tab: TabKey): Field[] {
  switch (tab) {
    case 'hrh': return [
      { name: 'staff_name', label: 'Staff name', type: 'text', required: true },
      { name: 'cadre', label: 'Cadre', type: 'text' },
      { name: 'posting', label: 'Posting / Unit', type: 'text' },
      { name: 'shift_date', label: 'Shift date', type: 'date', required: true },
      { name: 'shift_type', label: 'Shift type', type: 'select', options: ['morning','afternoon','night','on_call'] },
      { name: 'attendance_status', label: 'Attendance', type: 'select', options: ['scheduled','present','absent','late','leave'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ];
    case 'equipment': return [
      { name: 'name', label: 'Equipment name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'serial_number', label: 'Serial number', type: 'text' },
      { name: 'manufacturer', label: 'Manufacturer', type: 'text' },
      { name: 'acquired_date', label: 'Acquired date', type: 'date' },
      { name: 'condition', label: 'Condition', type: 'select', options: ['functional','needs_repair','out_of_service','retired'] },
      { name: 'status', label: 'Status', type: 'select', options: ['in_use','spare','under_repair','disposed'] },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'last_service_date', label: 'Last serviced', type: 'date' },
      { name: 'next_service_due', label: 'Next service due', type: 'date' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ];
    case 'utilities': return [
      { name: 'log_date', label: 'Date', type: 'date', required: true },
      { name: 'utility_type', label: 'Utility', type: 'select', options: ['power','water','fuel','internet','generator'] },
      { name: 'reading', label: 'Reading', type: 'number' },
      { name: 'unit', label: 'Unit', type: 'text' },
      { name: 'cost', label: 'Cost (NGN)', type: 'number' },
      { name: 'downtime_minutes', label: 'Downtime (min)', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ];
    case 'vehicles': return [
      { name: 'vehicle_label', label: 'Vehicle label / plate', type: 'text', required: true },
      { name: 'service_type', label: 'Service type', type: 'select', options: ['routine','repair','inspection','tyre','fuel','accident'] },
      { name: 'service_date', label: 'Service date', type: 'date', required: true },
      { name: 'odometer_km', label: 'Odometer (km)', type: 'number' },
      { name: 'cost', label: 'Cost (NGN)', type: 'number' },
      { name: 'vendor', label: 'Vendor / mechanic', type: 'text' },
      { name: 'next_service_due', label: 'Next service due', type: 'date' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ];
    case 'finance': return [
      { name: 'entry_date', label: 'Date', type: 'date', required: true },
      { name: 'entry_type', label: 'Type', type: 'select', options: ['income','expense'] },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'amount', label: 'Amount (NGN)', type: 'number', required: true },
      { name: 'payment_method', label: 'Payment method', type: 'select', options: ['cash','transfer','pos','cheque','mobile_money'] },
      { name: 'reference', label: 'Reference', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ];
  }
}

function getColumns(tab: TabKey): { key: string; label: string; render?: (v: any, r: any) => any }[] {
  const dt = (v: any) => v ? new Date(v).toLocaleDateString() : '—';
  const money = (v: any) => v != null ? `₦${Number(v).toLocaleString()}` : '—';
  switch (tab) {
    case 'hrh': return [
      { key: 'shift_date', label: 'Date', render: dt },
      { key: 'staff_name', label: 'Staff' },
      { key: 'cadre', label: 'Cadre' },
      { key: 'posting', label: 'Unit' },
      { key: 'shift_type', label: 'Shift' },
      { key: 'attendance_status', label: 'Attendance', render: (v) => <Badge variant="outline">{v}</Badge> },
    ];
    case 'equipment': return [
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'serial_number', label: 'Serial' },
      { key: 'condition', label: 'Condition', render: (v) => <Badge variant="outline">{v}</Badge> },
      { key: 'status', label: 'Status' },
      { key: 'location', label: 'Location' },
      { key: 'next_service_due', label: 'Next service', render: dt },
    ];
    case 'utilities': return [
      { key: 'log_date', label: 'Date', render: dt },
      { key: 'utility_type', label: 'Utility', render: (v) => <Badge variant="outline">{v}</Badge> },
      { key: 'reading', label: 'Reading' },
      { key: 'unit', label: 'Unit' },
      { key: 'cost', label: 'Cost', render: money },
      { key: 'downtime_minutes', label: 'Downtime (min)' },
    ];
    case 'vehicles': return [
      { key: 'service_date', label: 'Date', render: dt },
      { key: 'vehicle_label', label: 'Vehicle' },
      { key: 'service_type', label: 'Type', render: (v) => <Badge variant="outline">{v}</Badge> },
      { key: 'odometer_km', label: 'Odometer (km)' },
      { key: 'cost', label: 'Cost', render: money },
      { key: 'vendor', label: 'Vendor' },
      { key: 'next_service_due', label: 'Next due', render: dt },
    ];
    case 'finance': return [
      { key: 'entry_date', label: 'Date', render: dt },
      { key: 'entry_type', label: 'Type', render: (v) => <Badge variant={v === 'income' ? 'default' : 'secondary'}>{v}</Badge> },
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount', render: money },
      { key: 'payment_method', label: 'Method' },
      { key: 'reference', label: 'Ref' },
      { key: 'description', label: 'Description' },
    ];
  }
}
