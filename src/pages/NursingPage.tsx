import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Pill, Activity, CheckCircle2, XCircle, Pause } from 'lucide-react';

type MAR = { id: string; patient_id: string; drug_name: string; dose: string; route: string | null; scheduled_at: string; administered_at: string | null; status: string; hold_reason: string | null };
type Vital = { id: string; observed_at: string; temperature_c: number | null; pulse_bpm: number | null; respiratory_rate: number | null; systolic_bp: number | null; diastolic_bp: number | null; spo2: number | null; news2_score: number | null };

function calcNEWS2(v: { temperature_c?: number; pulse_bpm?: number; respiratory_rate?: number; systolic_bp?: number; spo2?: number }): number {
  let s = 0;
  const rr = v.respiratory_rate ?? 0;
  if (rr <= 8) s += 3; else if (rr <= 11) s += 1; else if (rr >= 25) s += 3; else if (rr >= 21) s += 2;
  const sp = v.spo2 ?? 100;
  if (sp <= 91) s += 3; else if (sp <= 93) s += 2; else if (sp <= 95) s += 1;
  const t = v.temperature_c ?? 37;
  if (t <= 35) s += 3; else if (t >= 39.1) s += 2; else if (t >= 38.1) s += 1;
  const sbp = v.systolic_bp ?? 120;
  if (sbp <= 90) s += 3; else if (sbp <= 100) s += 2; else if (sbp <= 110) s += 1; else if (sbp >= 220) s += 3;
  const p = v.pulse_bpm ?? 70;
  if (p <= 40) s += 3; else if (p <= 50) s += 1; else if (p >= 131) s += 3; else if (p >= 111) s += 2; else if (p >= 91) s += 1;
  return s;
}

export default function NursingPage() {
  const { user, facilityId } = useAppContext();
  const [mar, setMar] = useState<MAR[]>([]);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [patientId, setPatientId] = useState('');
  const [vit, setVit] = useState<any>({ temperature_c: '', pulse_bpm: '', respiratory_rate: '', systolic_bp: '', diastolic_bp: '', spo2: '' });

  const load = async () => {
    if (!facilityId) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [m, v] = await Promise.all([
      supabase.from('medication_administrations').select('*').eq('facility_id', facilityId).gte('scheduled_at', today.toISOString()).order('scheduled_at'),
      supabase.from('vitals_observations').select('*').eq('facility_id', facilityId).order('observed_at', { ascending: false }).limit(50),
    ]);
    setMar((m.data as any) ?? []);
    setVitals((v.data as any) ?? []);
  };
  useEffect(() => { load(); }, [facilityId]);

  const setStatus = async (id: string, status: string, hold_reason?: string) => {
    const { error } = await supabase.from('medication_administrations').update({
      status, administered_at: status === 'given' ? new Date().toISOString() : null,
      administered_by: user?.id, hold_reason,
    }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    load();
  };

  const recordVitals = async () => {
    if (!patientId || !user || !facilityId) return toast.error('Patient ID required');
    const numeric = Object.fromEntries(Object.entries(vit).map(([k, v]) => [k, v === '' ? null : Number(v)]));
    const news2 = calcNEWS2(numeric as any);
    const { error } = await supabase.from('vitals_observations').insert({
      facility_id: facilityId, patient_id: patientId, recorded_by: user.id, news2_score: news2, ...numeric,
    });
    if (error) return toast.error(error.message);
    toast.success(`Vitals recorded · NEWS2: ${news2}${news2 >= 5 ? ' ⚠️ ESCALATE' : ''}`);
    setVit({ temperature_c: '', pulse_bpm: '', respiratory_rate: '', systolic_bp: '', diastolic_bp: '', spo2: '' });
    load();
  };

  const news2Color = (s: number | null) => s === null ? 'bg-muted' : s >= 7 ? 'bg-destructive text-destructive-foreground' : s >= 5 ? 'bg-amber-500 text-white' : s >= 3 ? 'bg-yellow-500/20 text-yellow-700' : 'bg-emerald-500/10 text-emerald-700';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nursing Station</h1>
        <p className="text-muted-foreground">Medication Administration Record (MAR) + Vitals timeline with auto NEWS2</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Record Vitals</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 items-end">
            <div className="col-span-2 lg:col-span-1"><Label>Patient ID</Label><Input value={patientId} onChange={e => setPatientId(e.target.value)} placeholder="UUID" /></div>
            <div><Label>Temp °C</Label><Input type="number" step="0.1" value={vit.temperature_c} onChange={e => setVit({ ...vit, temperature_c: e.target.value })} /></div>
            <div><Label>Pulse</Label><Input type="number" value={vit.pulse_bpm} onChange={e => setVit({ ...vit, pulse_bpm: e.target.value })} /></div>
            <div><Label>RR</Label><Input type="number" value={vit.respiratory_rate} onChange={e => setVit({ ...vit, respiratory_rate: e.target.value })} /></div>
            <div><Label>SBP</Label><Input type="number" value={vit.systolic_bp} onChange={e => setVit({ ...vit, systolic_bp: e.target.value })} /></div>
            <div><Label>DBP</Label><Input type="number" value={vit.diastolic_bp} onChange={e => setVit({ ...vit, diastolic_bp: e.target.value })} /></div>
            <div><Label>SpO2 %</Label><Input type="number" value={vit.spo2} onChange={e => setVit({ ...vit, spo2: e.target.value })} /></div>
            <Button onClick={recordVitals} className="md:col-span-1">Save</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Pill className="h-5 w-5" />Today's MAR</CardTitle></CardHeader>
          <CardContent>
            {mar.length === 0 ? <p className="text-muted-foreground text-sm">No medications scheduled today.</p> : (
              <div className="space-y-2">
                {mar.map(m => (
                  <div key={m.id} className="p-2 rounded border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{m.drug_name} <span className="text-muted-foreground font-normal">{m.dose} {m.route}</span></div>
                        <div className="text-xs text-muted-foreground">Due: {new Date(m.scheduled_at).toLocaleString()}</div>
                      </div>
                      <Badge variant="outline">{m.status}</Badge>
                    </div>
                    {m.status === 'due' && (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={() => setStatus(m.id, 'given')}><CheckCircle2 className="h-3 w-3 mr-1" />Given</Button>
                        <Button size="sm" variant="outline" onClick={() => setStatus(m.id, 'refused')}><XCircle className="h-3 w-3 mr-1" />Refused</Button>
                        <Button size="sm" variant="outline" onClick={() => setStatus(m.id, 'held', prompt('Hold reason?') ?? '')}><Pause className="h-3 w-3 mr-1" />Held</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Vitals (NEWS2)</CardTitle></CardHeader>
          <CardContent>
            {vitals.length === 0 ? <p className="text-muted-foreground text-sm">No vitals recorded yet.</p> : (
              <div className="space-y-1 max-h-[500px] overflow-auto">
                {vitals.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-2 rounded border text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">{new Date(v.observed_at).toLocaleString()}</div>
                      <div>T:{v.temperature_c ?? '–'} P:{v.pulse_bpm ?? '–'} RR:{v.respiratory_rate ?? '–'} BP:{v.systolic_bp ?? '–'}/{v.diastolic_bp ?? '–'} SpO₂:{v.spo2 ?? '–'}</div>
                    </div>
                    <Badge className={news2Color(v.news2_score)}>NEWS2: {v.news2_score ?? '?'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
