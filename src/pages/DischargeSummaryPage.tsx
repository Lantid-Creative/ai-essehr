import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { FileCheck, Plus, Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const OUTCOMES = [
  { v: 'closed', label: 'Closed (recovered)' },
  { v: 'follow_up', label: 'For follow-up' },
  { v: 'admitted', label: 'Admitted (in-patient)' },
  { v: 'referred_out', label: 'Referred out' },
  { v: 'dama', label: 'DAMA (against medical advice)' },
  { v: 'died', label: 'Died' },
];

export default function DischargeSummaryPage() {
  const { facilityId, user } = useAppContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [patientId, setPatientId] = useState<string | null>(null);
  const [encounterId, setEncounterId] = useState<string | null>(null);
  const [f, setF] = useState({
    primary_icd10_code: '', primary_icd10_label: '', secondary_icd10: '',
    procedures: '', investigations_summary: '', treatment_summary: '',
    outcome: 'closed', follow_up_date: '', referral_destination: '', notes: '',
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['discharges', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('discharge_summaries')
        .select('*').eq('facility_id', facilityId).order('discharged_at', { ascending: false }).limit(50);
      if (!data || data.length === 0) return [];
      const ids = [...new Set(data.map(d => d.patient_id))];
      const { data: pts } = await supabase.from('patients').select('id, first_name, last_name, patient_code').in('id', ids);
      const map = Object.fromEntries((pts || []).map(p => [p.id, p]));
      return data.map(d => ({ ...d, patient: map[d.patient_id] }));
    },
    enabled: !!facilityId,
  });

  const { data: patientResults = [] } = useQuery({
    queryKey: ['ds-patient-search', search, facilityId],
    queryFn: async () => {
      if (!search || search.length < 2 || !facilityId) return [];
      const { data } = await supabase.from('patients').select('id, first_name, last_name, patient_code')
        .eq('facility_id', facilityId)
        .or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,patient_code.ilike.%${search}%`).limit(5);
      return data || [];
    },
    enabled: search.length >= 2,
  });

  const { data: encounters = [] } = useQuery({
    queryKey: ['ds-encounters', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data } = await supabase.from('encounters').select('id, encounter_date, diagnosis')
        .eq('patient_id', patientId).order('encounter_date', { ascending: false }).limit(10);
      return data || [];
    },
    enabled: !!patientId,
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!patientId || !encounterId) throw new Error('Pick patient and encounter');
      const { error } = await supabase.from('discharge_summaries').insert({
        encounter_id: encounterId, patient_id: patientId, facility_id: facilityId!,
        primary_icd10_code: f.primary_icd10_code,
        primary_icd10_label: f.primary_icd10_label || null,
        secondary_icd10: f.secondary_icd10 ? f.secondary_icd10.split(',').map(s => s.trim()).filter(Boolean) : [],
        procedures: f.procedures ? f.procedures.split(',').map(s => s.trim()).filter(Boolean) : [],
        investigations_summary: f.investigations_summary || null,
        treatment_summary: f.treatment_summary || null,
        outcome: f.outcome,
        follow_up_date: f.follow_up_date || null,
        referral_destination: f.referral_destination || null,
        clinician_id: user?.id,
        notes: f.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Discharge summary saved' });
      qc.invalidateQueries({ queryKey: ['discharges'] });
      setOpen(false);
      setF({ ...f, primary_icd10_code: '', primary_icd10_label: '', secondary_icd10: '', procedures: '', investigations_summary: '', treatment_summary: '', notes: '' });
      setPatientId(null); setEncounterId(null); setSearch('');
    },
    onError: (e: any) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  const printSummary = (r: any) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Discharge Summary</title><style>
      body{font-family:Arial;padding:32px;max-width:800px;margin:0 auto}
      h1{border-bottom:2px solid #064e3b;padding-bottom:8px}
      .row{display:flex;gap:24px;margin:8px 0}
      .label{font-weight:600;min-width:160px}
      .section{margin-top:20px}
      </style></head><body>
      <h1>Discharge Summary</h1>
      <div class="row"><span class="label">Patient:</span> ${r.patient?.first_name} ${r.patient?.last_name} (${r.patient?.patient_code})</div>
      <div class="row"><span class="label">Discharged:</span> ${new Date(r.discharged_at).toLocaleString()}</div>
      <div class="row"><span class="label">Primary diagnosis (ICD-10):</span> ${r.primary_icd10_code} — ${r.primary_icd10_label || ''}</div>
      <div class="row"><span class="label">Secondary diagnoses:</span> ${(r.secondary_icd10 || []).join(', ') || '—'}</div>
      <div class="row"><span class="label">Procedures:</span> ${(r.procedures || []).join(', ') || '—'}</div>
      <div class="section"><strong>Investigations</strong><p>${r.investigations_summary || '—'}</p></div>
      <div class="section"><strong>Treatment</strong><p>${r.treatment_summary || '—'}</p></div>
      <div class="row"><span class="label">Outcome:</span> ${r.outcome.toUpperCase()}</div>
      ${r.follow_up_date ? `<div class="row"><span class="label">Follow-up date:</span> ${r.follow_up_date}</div>` : ''}
      ${r.referral_destination ? `<div class="row"><span class="label">Referred to:</span> ${r.referral_destination}</div>` : ''}
      <p style="margin-top:40px;color:#666;font-size:12px">Generated by INTEGRA EHR — © Lantid Creative LTD</p>
      </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-primary" /> Discharge Summaries
          </h1>
          <p className="text-sm text-muted-foreground">ICD-10 structured discharge with outcome codes (Closed / Follow-up / Admitted / Referred / DAMA / Died).</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Discharge</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Discharge Summary</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Search patient *</Label>
                <Input value={search} onChange={e => { setSearch(e.target.value); setPatientId(null); }} placeholder="Name or patient code" />
                {patientResults.length > 0 && !patientId && (
                  <div className="border rounded mt-1 max-h-40 overflow-y-auto">
                    {patientResults.map(p => (
                      <button key={p.id} onClick={() => { setPatientId(p.id); setSearch(`${p.first_name} ${p.last_name}`); }}
                        className="w-full text-left px-3 py-2 hover:bg-muted text-sm">
                        {p.first_name} {p.last_name} <span className="text-muted-foreground text-xs">({p.patient_code})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {patientId && (
                <div>
                  <Label>Encounter *</Label>
                  <Select value={encounterId || ''} onValueChange={setEncounterId}>
                    <SelectTrigger><SelectValue placeholder="Select encounter" /></SelectTrigger>
                    <SelectContent>
                      {encounters.map(e => <SelectItem key={e.id} value={e.id}>{new Date(e.encounter_date).toLocaleDateString()} — {e.diagnosis || 'No dx'}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Primary ICD-10 code *</Label><Input placeholder="e.g. J18.9" value={f.primary_icd10_code} onChange={e => setF({ ...f, primary_icd10_code: e.target.value })} /></div>
                <div><Label>ICD-10 label</Label><Input placeholder="Pneumonia, unspecified" value={f.primary_icd10_label} onChange={e => setF({ ...f, primary_icd10_label: e.target.value })} /></div>
                <div className="col-span-2"><Label>Secondary ICD-10 (comma-separated)</Label><Input placeholder="E11.9, I10" value={f.secondary_icd10} onChange={e => setF({ ...f, secondary_icd10: e.target.value })} /></div>
                <div className="col-span-2"><Label>Procedures (comma-separated)</Label><Input placeholder="IV cannulation, Nebulisation" value={f.procedures} onChange={e => setF({ ...f, procedures: e.target.value })} /></div>
                <div className="col-span-2"><Label>Investigations summary</Label><Textarea rows={2} value={f.investigations_summary} onChange={e => setF({ ...f, investigations_summary: e.target.value })} /></div>
                <div className="col-span-2"><Label>Treatment summary</Label><Textarea rows={2} value={f.treatment_summary} onChange={e => setF({ ...f, treatment_summary: e.target.value })} /></div>
                <div><Label>Outcome *</Label>
                  <Select value={f.outcome} onValueChange={v => setF({ ...f, outcome: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{OUTCOMES.map(o => <SelectItem key={o.v} value={o.v}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Follow-up date</Label><Input type="date" value={f.follow_up_date} onChange={e => setF({ ...f, follow_up_date: e.target.value })} /></div>
                {f.outcome === 'referred_out' && (
                  <div className="col-span-2"><Label>Referral destination</Label><Input value={f.referral_destination} onChange={e => setF({ ...f, referral_destination: e.target.value })} /></div>
                )}
                <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} /></div>
              </div>
              <Button onClick={() => create.mutate()} disabled={create.isPending || !patientId || !encounterId || !f.primary_icd10_code}>
                {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save & Discharge
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b font-semibold">Recent Discharges ({records.length})</div>
        {isLoading ? <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <div className="divide-y">
            {records.length === 0 && <p className="p-8 text-center text-muted-foreground text-sm">No discharge summaries yet.</p>}
            {records.map(r => (
              <div key={r.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.patient?.first_name} {r.patient?.last_name} <span className="text-xs text-muted-foreground">({r.patient?.patient_code})</span></p>
                  <p className="text-xs text-muted-foreground"><span className="font-mono">{r.primary_icd10_code}</span> — {r.primary_icd10_label} • {new Date(r.discharged_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{r.outcome.replace('_', ' ')}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => printSummary(r)}><Printer className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
