import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { TestTube, Barcode, ArrowRight } from 'lucide-react';

type Specimen = { id: string; barcode: string; specimen_type: string; test_requested: string; status: string; collected_at: string; received_at: string | null; resulted_at: string | null; patient_id: string };

const STATUS_FLOW = ['collected', 'received', 'in_progress', 'resulted'];

export default function SpecimensPage() {
  const { user, facilityId } = useAppContext();
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [n, setN] = useState({ patient_id: '', specimen_type: 'blood', test_requested: '' });

  const load = async () => {
    if (!facilityId) return;
    const { data } = await supabase.from('specimens').select('*').eq('facility_id', facilityId).order('created_at', { ascending: false }).limit(100);
    setSpecimens((data as any) ?? []);
  };
  useEffect(() => { load(); }, [facilityId]);

  const collect = async () => {
    if (!user || !facilityId || !n.patient_id || !n.test_requested) return toast.error('Patient ID and test required');
    const barcode = `SP${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from('specimens').insert({
      facility_id: facilityId, patient_id: n.patient_id, specimen_type: n.specimen_type,
      test_requested: n.test_requested, barcode, collected_by: user.id, status: 'collected',
      chain_of_custody: [{ at: new Date().toISOString(), by: user.id, action: 'collected' }],
    });
    if (error) return toast.error(error.message);
    toast.success(`Specimen ${barcode} collected`);
    setN({ patient_id: '', specimen_type: 'blood', test_requested: '' });
    load();
  };

  const advance = async (s: Specimen) => {
    const idx = STATUS_FLOW.indexOf(s.status);
    if (idx === -1 || idx === STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[idx + 1];
    const updates: any = { status: next };
    if (next === 'received') { updates.received_at = new Date().toISOString(); updates.received_by = user?.id; }
    if (next === 'resulted') updates.resulted_at = new Date().toISOString();
    const { error } = await supabase.from('specimens').update(updates).eq('id', s.id);
    if (error) return toast.error(error.message);
    toast.success(`→ ${next}`);
    load();
  };

  const reject = async (s: Specimen) => {
    const reason = prompt('Rejection reason?');
    if (!reason) return;
    await supabase.from('specimens').update({ status: 'rejected', rejection_reason: reason }).eq('id', s.id);
    toast.success('Specimen rejected');
    load();
  };

  const statusColor = (s: string) => ({
    collected: 'bg-blue-500/10 text-blue-700',
    received: 'bg-amber-500/10 text-amber-700',
    in_progress: 'bg-primary/10 text-primary',
    resulted: 'bg-emerald-500/10 text-emerald-700',
    rejected: 'bg-destructive/10 text-destructive',
  } as Record<string, string>)[s] ?? 'bg-muted';

  const counts = STATUS_FLOW.reduce((a, s) => ({ ...a, [s]: specimens.filter(x => x.status === s).length }), {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Specimen Tracking</h1>
        <p className="text-muted-foreground">Chain of custody from collection to result</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATUS_FLOW.map(s => (
          <Card key={s}><CardContent className="pt-6">
            <div className="text-xs text-muted-foreground capitalize">{s.replace('_', ' ')}</div>
            <div className="text-2xl font-bold">{counts[s] ?? 0}</div>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Barcode className="h-5 w-5" />Collect New Specimen</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div><Label>Patient ID</Label><Input value={n.patient_id} onChange={e => setN({ ...n, patient_id: e.target.value })} placeholder="UUID" /></div>
            <div><Label>Type</Label>
              <Select value={n.specimen_type} onValueChange={v => setN({ ...n, specimen_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="blood">Blood</SelectItem>
                  <SelectItem value="urine">Urine</SelectItem>
                  <SelectItem value="stool">Stool</SelectItem>
                  <SelectItem value="csf">CSF</SelectItem>
                  <SelectItem value="swab">Swab</SelectItem>
                  <SelectItem value="sputum">Sputum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Test requested</Label><Input value={n.test_requested} onChange={e => setN({ ...n, test_requested: e.target.value })} placeholder="Malaria RDT" /></div>
            <Button onClick={collect}>Collect & Generate Barcode</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TestTube className="h-5 w-5" />Active Specimens</CardTitle></CardHeader>
        <CardContent>
          {specimens.length === 0 ? <p className="text-muted-foreground">No specimens yet.</p> : (
            <div className="space-y-2">
              {specimens.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-mono text-sm font-semibold">{s.barcode}</div>
                    <div className="text-xs text-muted-foreground">{s.specimen_type} · {s.test_requested}</div>
                    <div className="text-xs text-muted-foreground">Collected: {new Date(s.collected_at).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor(s.status)}>{s.status.replace('_', ' ')}</Badge>
                    {s.status !== 'resulted' && s.status !== 'rejected' && (
                      <>
                        <Button size="sm" onClick={() => advance(s)}>
                          <ArrowRight className="h-3 w-3 mr-1" />{STATUS_FLOW[STATUS_FLOW.indexOf(s.status) + 1]}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => reject(s)}>Reject</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
