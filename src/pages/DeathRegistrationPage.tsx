import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { FileWarning, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function DeathRegistrationPage() {
  const { facilityId, user } = useAppContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    deceased_name: '', deceased_nin: '', sex: 'male', age_years: '', age_months: '',
    date_of_death: new Date().toISOString().slice(0, 10), time_of_death: '',
    place_of_death: 'facility', manner_of_death: 'natural',
    primary_cause_icd10_code: '', primary_cause_icd10_label: '',
    contributing_causes: '', remarks: '',
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['deaths', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('death_registrations')
        .select('*').eq('facility_id', facilityId)
        .order('date_of_death', { ascending: false }).limit(100);
      return data || [];
    },
    enabled: !!facilityId,
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('death_registrations').insert({
        facility_id: facilityId!,
        deceased_name: f.deceased_name,
        deceased_nin: f.deceased_nin || null,
        sex: f.sex,
        age_years: f.age_years ? parseInt(f.age_years) : null,
        age_months: f.age_months ? parseInt(f.age_months) : null,
        date_of_death: f.date_of_death,
        time_of_death: f.time_of_death || null,
        place_of_death: f.place_of_death,
        manner_of_death: f.manner_of_death,
        primary_cause_icd10_code: f.primary_cause_icd10_code,
        primary_cause_icd10_label: f.primary_cause_icd10_label || null,
        contributing_causes: f.contributing_causes
          ? f.contributing_causes.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        certified_by: user?.id,
        created_by: user?.id,
        remarks: f.remarks || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Death registered', description: 'NPopC certificate request queued.' });
      qc.invalidateQueries({ queryKey: ['deaths'] });
      setOpen(false);
      setF({ ...f, deceased_name: '', primary_cause_icd10_code: '', primary_cause_icd10_label: '', remarks: '' });
    },
    onError: (e: any) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <FileWarning className="h-6 w-6 text-primary" /> Death Registration
          </h1>
          <p className="text-sm text-muted-foreground">Certify deaths with ICD-10 cause codes; NPopC certificate request dispatched automatically.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Register Death</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Death Certification</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Deceased full name *</Label><Input value={f.deceased_name} onChange={e => setF({ ...f, deceased_name: e.target.value })} /></div>
              <div><Label>NIN</Label><Input value={f.deceased_nin} onChange={e => setF({ ...f, deceased_nin: e.target.value })} /></div>
              <div><Label>Sex</Label>
                <Select value={f.sex} onValueChange={v => setF({ ...f, sex: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Age (years)</Label><Input type="number" value={f.age_years} onChange={e => setF({ ...f, age_years: e.target.value })} /></div>
              <div><Label>Age (months, if &lt;1y)</Label><Input type="number" value={f.age_months} onChange={e => setF({ ...f, age_months: e.target.value })} /></div>
              <div><Label>Date of death *</Label><Input type="date" value={f.date_of_death} onChange={e => setF({ ...f, date_of_death: e.target.value })} /></div>
              <div><Label>Time of death</Label><Input type="time" value={f.time_of_death} onChange={e => setF({ ...f, time_of_death: e.target.value })} /></div>
              <div><Label>Place of death</Label>
                <Select value={f.place_of_death} onValueChange={v => setF({ ...f, place_of_death: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facility">Facility</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="transit">In transit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Manner of death</Label>
                <Select value={f.manner_of_death} onValueChange={v => setF({ ...f, manner_of_death: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">Natural</SelectItem>
                    <SelectItem value="accident">Accident</SelectItem>
                    <SelectItem value="suicide">Suicide</SelectItem>
                    <SelectItem value="homicide">Homicide</SelectItem>
                    <SelectItem value="undetermined">Undetermined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Primary cause ICD-10 code *</Label><Input placeholder="e.g. I21.9" value={f.primary_cause_icd10_code} onChange={e => setF({ ...f, primary_cause_icd10_code: e.target.value })} /></div>
              <div><Label>ICD-10 label</Label><Input placeholder="Acute MI" value={f.primary_cause_icd10_label} onChange={e => setF({ ...f, primary_cause_icd10_label: e.target.value })} /></div>
              <div className="col-span-2"><Label>Contributing causes (comma-separated ICD-10)</Label><Input placeholder="E11.9, I10" value={f.contributing_causes} onChange={e => setF({ ...f, contributing_causes: e.target.value })} /></div>
              <div className="col-span-2"><Label>Remarks</Label><Textarea rows={2} value={f.remarks} onChange={e => setF({ ...f, remarks: e.target.value })} /></div>
            </div>
            <Button onClick={() => create.mutate()} disabled={create.isPending || !f.deceased_name || !f.primary_cause_icd10_code}>
              {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Certify & Submit
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b font-semibold">Recent Deaths ({records.length})</div>
        {isLoading ? <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <div className="divide-y">
            {records.length === 0 && <p className="p-8 text-center text-muted-foreground text-sm">No deaths recorded.</p>}
            {records.map(r => (
              <div key={r.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.deceased_name} <span className="text-xs text-muted-foreground">({r.sex}, {r.age_years ?? '?'}y)</span></p>
                  <p className="text-xs text-muted-foreground">DOD: {r.date_of_death} • {r.place_of_death} • Cause: <span className="font-mono">{r.primary_cause_icd10_code}</span> {r.primary_cause_icd10_label && `— ${r.primary_cause_icd10_label}`}</p>
                </div>
                <Badge variant={r.npopc_status === 'certificate_issued' ? 'default' : 'secondary'}>NPopC: {r.npopc_status.replace('_', ' ')}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
