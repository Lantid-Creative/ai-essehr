import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, FileCheck, Building2, Users, Receipt } from 'lucide-react';

type Scheme = { id: string; name: string; scheme_type: string; default_copay_percent: number; preauth_required: boolean; active: boolean };
type Claim = { id: string; claim_number: string; status: string; gross_amount: number; copay_amount: number; scheme_payable: number; scheme_paid: number; created_at: string; scheme_id: string };

const SCHEME_TYPES = [
  { value: 'nhia', label: 'NHIA (National)' },
  { value: 'hmo', label: 'HMO (Hygeia, Avon, Reliance, AIICO...)' },
  { value: 'corporate', label: 'Corporate / Retainer' },
  { value: 'cbhis', label: 'CBHIS / State (LSHMA, OGSHIA...)' },
  { value: 'state', label: 'State scheme' },
];

export default function InsuranceClaimsPage() {
  const { user, facilityId } = useAppContext();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [newScheme, setNewScheme] = useState({ name: '', scheme_type: 'hmo', default_copay_percent: 10, preauth_required: false });
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!facilityId) return;
    setLoading(true);
    const [s, c] = await Promise.all([
      supabase.from('insurance_schemes').select('*').eq('facility_id', facilityId).order('name'),
      supabase.from('insurance_claims').select('*').eq('facility_id', facilityId).order('created_at', { ascending: false }).limit(100),
    ]);
    setSchemes((s.data as any) ?? []);
    setClaims((c.data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [facilityId]);

  const addScheme = async () => {
    if (!newScheme.name || !facilityId) return;
    const { error } = await supabase.from('insurance_schemes').insert({ ...newScheme, facility_id: facilityId });
    if (error) return toast.error(error.message);
    toast.success('Scheme added');
    setOpen(false);
    setNewScheme({ name: '', scheme_type: 'hmo', default_copay_percent: 10, preauth_required: false });
    load();
  };

  const submitClaim = async (id: string) => {
    const { error } = await supabase.from('insurance_claims').update({
      status: 'submitted', submitted_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Claim submitted');
    load();
  };

  const totals = {
    pending: claims.filter(c => c.status === 'draft' || c.status === 'submitted').reduce((a, c) => a + Number(c.scheme_payable), 0),
    paid: claims.filter(c => c.status === 'paid' || c.status === 'partially_paid').reduce((a, c) => a + Number(c.scheme_paid), 0),
    rejected: claims.filter(c => c.status === 'rejected').length,
  };

  const statusColor = (s: string) => ({
    draft: 'bg-muted text-foreground',
    submitted: 'bg-primary/10 text-primary',
    approved: 'bg-blue-500/10 text-blue-700',
    partially_paid: 'bg-amber-500/10 text-amber-700',
    paid: 'bg-emerald-500/10 text-emerald-700',
    rejected: 'bg-destructive/10 text-destructive',
    cancelled: 'bg-muted text-muted-foreground',
  } as Record<string, string>)[s] ?? 'bg-muted';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Insurance & Claims</h1>
          <p className="text-muted-foreground">NHIA · HMOs · Corporate retainers · CBHIS</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Scheme</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Insurance Scheme</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={newScheme.name} onChange={e => setNewScheme({ ...newScheme, name: e.target.value })} placeholder="Hygeia HMO" /></div>
              <div><Label>Type</Label>
                <Select value={newScheme.scheme_type} onValueChange={v => setNewScheme({ ...newScheme, scheme_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SCHEME_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Default Co-pay %</Label><Input type="number" value={newScheme.default_copay_percent} onChange={e => setNewScheme({ ...newScheme, default_copay_percent: Number(e.target.value) })} /></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={newScheme.preauth_required} onChange={e => setNewScheme({ ...newScheme, preauth_required: e.target.checked })} />
                Pre-authorization required
              </label>
              <Button onClick={addScheme} className="w-full">Save Scheme</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Pending payable</div><div className="text-2xl font-bold">₦{totals.pending.toLocaleString()}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Received from schemes</div><div className="text-2xl font-bold text-emerald-600">₦{totals.paid.toLocaleString()}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">Rejected claims</div><div className="text-2xl font-bold text-destructive">{totals.rejected}</div></CardContent></Card>
      </div>

      <Tabs defaultValue="claims">
        <TabsList>
          <TabsTrigger value="claims"><Receipt className="h-4 w-4 mr-2" />Claims</TabsTrigger>
          <TabsTrigger value="schemes"><Building2 className="h-4 w-4 mr-2" />Schemes ({schemes.length})</TabsTrigger>
          <TabsTrigger value="enrolments"><Users className="h-4 w-4 mr-2" />Enrolments</TabsTrigger>
        </TabsList>

        <TabsContent value="claims">
          <Card><CardHeader><CardTitle>Recent Claims</CardTitle></CardHeader><CardContent>
            {loading ? 'Loading…' : claims.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No claims yet. Claims are auto-generated from invoices linked to insured patients.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {claims.map(c => {
                  const scheme = schemes.find(s => s.id === c.scheme_id);
                  return (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="font-mono text-sm">{c.claim_number}</div>
                        <div className="text-xs text-muted-foreground">{scheme?.name ?? '—'} · {new Date(c.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₦{Number(c.scheme_payable).toLocaleString()}</div>
                        <Badge className={statusColor(c.status)}>{c.status}</Badge>
                      </div>
                      {c.status === 'draft' && <Button size="sm" onClick={() => submitClaim(c.id)} className="ml-3">Submit</Button>}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="schemes">
          <Card><CardContent className="pt-6">
            {schemes.length === 0 ? <p className="text-muted-foreground">No schemes configured. Click "Add Scheme" to begin.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {schemes.map(s => (
                  <div key={s.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{s.name}</div>
                      <Badge variant="outline">{s.scheme_type.toUpperCase()}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Co-pay: {s.default_copay_percent}% · Pre-auth: {s.preauth_required ? 'Yes' : 'No'}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="enrolments">
          <Card><CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Enrol patients via Patient Profile → Insurance tab. Pre-authorizations are also requested from there before non-emergency services.</p>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
