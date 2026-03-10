import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Baby, Search, Loader2, Plus, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

export default function MCHPage() {
  const { facilityId, user } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [visitDialog, setVisitDialog] = useState<string | null>(null);
  const [selectedExpanded, setSelectedExpanded] = useState<string | null>(null);

  // Visit form
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [bp, setBp] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch ANC encounters
  const { data: ancEncounters = [], isLoading } = useQuery({
    queryKey: ['mch-encounters', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('encounters')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('encounter_type', 'anc')
        .order('encounter_date', { ascending: false })
        .limit(200);
      if (!data || data.length === 0) return [];
      const patientIds = [...new Set(data.map(e => e.patient_id))];
      const { data: patients } = await supabase.from('patients')
        .select('id, first_name, last_name, date_of_birth, patient_code').in('id', patientIds);
      const pMap = Object.fromEntries((patients || []).map(p => [p.id, p]));
      return data.map(e => ({ ...e, patient: pMap[e.patient_id] }));
    },
    enabled: !!facilityId,
  });

  // Group encounters by patient
  const patientGroups = ancEncounters.reduce<Record<string, { patient: any; visits: any[] }>>((acc, e: any) => {
    if (!acc[e.patient_id]) acc[e.patient_id] = { patient: e.patient, visits: [] };
    acc[e.patient_id].visits.push(e);
    return acc;
  }, {});

  // Patient search for new ANC visit
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { data: searchResults = [] } = useQuery({
    queryKey: ['mch-patient-search', patientSearch, facilityId],
    queryFn: async () => {
      if (!patientSearch || patientSearch.length < 2 || !facilityId) return [];
      const { data } = await supabase.from('patients').select('id, first_name, last_name, patient_code')
        .eq('facility_id', facilityId).eq('gender', 'female')
        .or(`first_name.ilike.%${patientSearch}%,last_name.ilike.%${patientSearch}%,patient_code.ilike.%${patientSearch}%`)
        .limit(5);
      return data || [];
    },
    enabled: patientSearch.length >= 2,
  });

  const addVisitMutation = useMutation({
    mutationFn: async () => {
      const pid = visitDialog || selectedPatientId;
      if (!pid) throw new Error('Select a patient');
      const vitals: any = {};
      if (bp) vitals.bp = bp;
      if (weight) vitals.weight = weight;

      const { error } = await supabase.from('encounters').insert({
        patient_id: pid,
        facility_id: facilityId,
        clinician_id: user?.id,
        encounter_type: 'anc',
        chief_complaint: chiefComplaint || 'ANC Visit',
        vital_signs: vitals,
        examination_notes: notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'ANC visit recorded' });
      queryClient.invalidateQueries({ queryKey: ['mch-encounters'] });
      closeDialog();
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const closeDialog = () => {
    setVisitDialog(null);
    setSelectedPatientId(null);
    setPatientSearch('');
    setChiefComplaint('');
    setBp('');
    setWeight('');
    setNotes('');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Maternal & Child Health</h1>
        <Button onClick={() => setVisitDialog('__new__')} className="gap-2">
          <Plus className="h-4 w-4" /> New ANC Visit
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="stat-card flex items-center gap-3">
          <Baby className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-2xl font-heading font-medium">{Object.keys(patientGroups).length}</p>
            <p className="text-xs text-muted-foreground">ANC Patients</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-accent shrink-0" />
          <div>
            <p className="text-2xl font-heading font-medium">{ancEncounters.length}</p>
            <p className="text-xs text-muted-foreground">Total ANC Visits</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : Object.keys(patientGroups).length === 0 ? (
        <div className="card-ehr p-8 text-center text-muted-foreground text-sm">
          No ANC patients yet. Click "New ANC Visit" to record the first antenatal visit.
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(patientGroups).map(([pid, { patient, visits }]) => (
            <div key={pid} className="card-ehr p-4">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setSelectedExpanded(selectedExpanded === pid ? null : pid)}>
                <div>
                  <p className="font-heading font-medium">
                    {patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient'}
                  </p>
                  <p className="text-xs text-muted-foreground">{visits.length} visit(s) · Last: {new Date(visits[0].encounter_date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setVisitDialog(pid); }}>
                    <Plus className="h-3 w-3 mr-1" /> Add Visit
                  </Button>
                  <span className="text-xs text-primary">{selectedExpanded === pid ? '▲' : '▼'}</span>
                </div>
              </div>

              {selectedExpanded === pid && (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  {visits.map((v: any) => {
                    const vitals = v.vital_signs as any || {};
                    return (
                      <div key={v.id} className="border border-border rounded p-3 text-sm">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{new Date(v.encounter_date).toLocaleDateString()}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {vitals.bp && <div><span className="text-muted-foreground">BP:</span> {vitals.bp}</div>}
                          {vitals.weight && <div><span className="text-muted-foreground">Weight:</span> {vitals.weight}kg</div>}
                          {vitals.temperature && <div><span className="text-muted-foreground">Temp:</span> {vitals.temperature}°C</div>}
                        </div>
                        {v.chief_complaint && <p className="text-xs mt-1"><strong>Complaint:</strong> {v.chief_complaint}</p>}
                        {v.examination_notes && <p className="text-xs text-muted-foreground mt-1">{v.examination_notes}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New ANC Visit Dialog */}
      <Dialog open={!!visitDialog} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record ANC Visit</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); addVisitMutation.mutate(); }} className="space-y-4">
            {visitDialog === '__new__' ? (
              <div>
                <Label>Patient (Female) *</Label>
                {selectedPatientId ? (
                  <div className="flex items-center justify-between bg-muted/50 p-2 rounded mt-1">
                    <span className="text-sm font-medium">
                      {searchResults.find(p => p.id === selectedPatientId)?.first_name} {searchResults.find(p => p.id === selectedPatientId)?.last_name}
                    </span>
                    <button type="button" onClick={() => { setSelectedPatientId(null); setPatientSearch(''); }} className="text-xs text-primary hover:underline">Change</button>
                  </div>
                ) : (
                  <>
                    <Input value={patientSearch} onChange={e => setPatientSearch(e.target.value)} placeholder="Search female patient..." className="mt-1" />
                    {searchResults.length > 0 && (
                      <div className="border border-border rounded mt-1 divide-y divide-border max-h-32 overflow-y-auto">
                        {searchResults.map(p => (
                          <button key={p.id} type="button" onClick={() => setSelectedPatientId(p.id)}
                            className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm">
                            {p.first_name} {p.last_name} <span className="text-xs text-muted-foreground ml-1">{p.patient_code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Adding visit for existing ANC patient</p>
            )}
            <div>
              <Label>Chief Complaint</Label>
              <Input value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} placeholder="e.g. Routine ANC visit" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Blood Pressure</Label><Input value={bp} onChange={e => setBp(e.target.value)} placeholder="120/80" className="mt-1" /></div>
              <div><Label>Weight (kg)</Label><Input value={weight} onChange={e => setWeight(e.target.value)} placeholder="65" className="mt-1" /></div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Examination findings..." className="mt-1" />
            </div>
            <Button type="submit" className="w-full" disabled={addVisitMutation.isPending || (visitDialog === '__new__' && !selectedPatientId)}>
              {addVisitMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : 'Save ANC Visit'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
