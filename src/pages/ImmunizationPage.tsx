import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Search, Loader2, Syringe, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const VACCINES = ['BCG', 'OPV 0', 'OPV 1', 'OPV 2', 'OPV 3', 'Penta 1', 'Penta 2', 'Penta 3', 'PCV 1', 'PCV 2', 'PCV 3', 'Measles 1', 'Measles 2', 'Yellow Fever', 'Vitamin A', 'Hepatitis B', 'HPV', 'Td', 'COVID-19'];

export default function ImmunizationPage() {
  const { facilityId, user } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [vaccine, setVaccine] = useState('');
  const [dose, setDose] = useState('1');
  const [batch, setBatch] = useState('');
  const [nextDose, setNextDose] = useState('');
  const [notes, setNotes] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['immunizations', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('immunizations')
        .select('*')
        .eq('facility_id', facilityId)
        .order('administered_at', { ascending: false })
        .limit(200);
      if (!data || data.length === 0) return [];
      const patientIds = [...new Set(data.map(e => e.patient_id))];
      const { data: patients } = await supabase.from('patients').select('id, first_name, last_name').in('id', patientIds);
      const patientMap = Object.fromEntries((patients || []).map(p => [p.id, `${p.first_name} ${p.last_name}`]));
      return data.map(e => ({ ...e, patientName: patientMap[e.patient_id] || 'Unknown' }));
    },
    enabled: !!facilityId,
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ['imm-patient-search', patientSearch, facilityId],
    queryFn: async () => {
      if (!patientSearch || patientSearch.length < 2 || !facilityId) return [];
      const { data } = await supabase.from('patients').select('id, first_name, last_name, patient_code')
        .eq('facility_id', facilityId)
        .or(`first_name.ilike.%${patientSearch}%,last_name.ilike.%${patientSearch}%,patient_code.ilike.%${patientSearch}%`)
        .limit(5);
      return data || [];
    },
    enabled: patientSearch.length >= 2,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPatientId) throw new Error('Select a patient');
      const { data: record, error } = await supabase.from('immunizations').insert({
        patient_id: selectedPatientId,
        facility_id: facilityId,
        vaccine_name: vaccine,
        dose_number: parseInt(dose),
        batch_number: batch || null,
        next_dose_date: nextDose || null,
        notes: notes || null,
        administered_by: user?.id,
      }).select('id').single();
      if (error) throw error;

      // Audit log
      if (user && record) {
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          facility_id: facilityId,
          action: 'create',
          entity_type: 'immunization',
          entity_id: record.id,
          details: { vaccine, dose: parseInt(dose), patient: selectedPatientName } as any,
        } as any);
      }
    },
    onSuccess: () => {
      toast({ title: 'Vaccination recorded' });
      queryClient.invalidateQueries({ queryKey: ['immunizations'] });
      setOpen(false);
      setPatientSearch(''); setSelectedPatientId(null); setSelectedPatientName('');
      setVaccine(''); setDose('1'); setBatch(''); setNextDose(''); setNotes('');
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const filteredRecords = records.filter((r: any) =>
    !searchFilter || r.patientName.toLowerCase().includes(searchFilter.toLowerCase()) || r.vaccine_name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Stats
  const upcomingDoses = records.filter((r: any) => r.next_dose_date && new Date(r.next_dose_date) > new Date()).length;
  const overdueDoses = records.filter((r: any) => r.next_dose_date && new Date(r.next_dose_date) < new Date()).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Immunization</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Syringe className="h-4 w-4" /> Record Vaccination</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Vaccination</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); addMutation.mutate(); }} className="space-y-4">
              <div>
                <Label>Patient *</Label>
                {selectedPatientId ? (
                  <div className="flex items-center justify-between bg-muted/50 p-2 rounded mt-1">
                    <span className="text-sm font-medium">{selectedPatientName}</span>
                    <button type="button" onClick={() => { setSelectedPatientId(null); setSelectedPatientName(''); setPatientSearch(''); }} className="text-xs text-primary hover:underline">Change</button>
                  </div>
                ) : (
                  <>
                    <Input value={patientSearch} onChange={e => setPatientSearch(e.target.value)} placeholder="Search patient..." className="mt-1" />
                    {searchResults.length > 0 && (
                      <div className="border border-border rounded mt-1 divide-y divide-border max-h-32 overflow-y-auto">
                        {searchResults.map(p => (
                          <button key={p.id} type="button" onClick={() => { setSelectedPatientId(p.id); setSelectedPatientName(`${p.first_name} ${p.last_name}`); setPatientSearch(''); }}
                            className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm">
                            {p.first_name} {p.last_name} <span className="text-xs text-muted-foreground ml-1">{p.patient_code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div>
                <Label>Vaccine *</Label>
                <Select value={vaccine} onValueChange={setVaccine}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select vaccine" /></SelectTrigger>
                  <SelectContent>
                    {VACCINES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Dose Number</Label>
                  <Input type="number" value={dose} onChange={e => setDose(e.target.value)} min="1" className="mt-1" />
                </div>
                <div>
                  <Label>Batch Number</Label>
                  <Input value={batch} onChange={e => setBatch(e.target.value)} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Next Dose Date</Label>
                <Input type="date" value={nextDose} onChange={e => setNextDose(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Notes</Label>
                <Input value={notes} onChange={e => setNotes(e.target.value)} className="mt-1" />
              </div>
              <Button type="submit" className="w-full" disabled={addMutation.isPending || !selectedPatientId || !vaccine}>
                {addMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : 'Save Vaccination'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-3">
          <Syringe className="h-5 w-5 text-primary shrink-0" />
          <div><p className="text-2xl font-heading font-medium">{records.length}</p><p className="text-xs text-muted-foreground">Total Records</p></div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-success shrink-0" />
          <div><p className="text-2xl font-heading font-medium">{new Set(records.map((r: any) => r.patient_id)).size}</p><p className="text-xs text-muted-foreground">Patients Vaccinated</p></div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <Clock className="h-5 w-5 text-accent shrink-0" />
          <div><p className="text-2xl font-heading font-medium">{upcomingDoses}</p><p className="text-xs text-muted-foreground">Upcoming Doses</p></div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <Clock className="h-5 w-5 text-destructive shrink-0" />
          <div><p className="text-2xl font-heading font-medium text-destructive">{overdueDoses}</p><p className="text-xs text-muted-foreground">Overdue Doses</p></div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by patient or vaccine..." value={searchFilter} onChange={e => setSearchFilter(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="card-ehr overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-4 py-2 font-medium">Patient</th>
                  <th className="text-left px-4 py-2 font-medium">Vaccine</th>
                  <th className="text-left px-4 py-2 font-medium">Dose</th>
                  <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">Batch</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Next Due</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((v: any) => (
                  <tr key={v.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-2 font-medium">{v.patientName}</td>
                    <td className="px-4 py-2">{v.vaccine_name}</td>
                    <td className="px-4 py-2">{v.dose_number}</td>
                    <td className="px-4 py-2 text-muted-foreground text-xs hidden sm:table-cell">{v.batch_number || '—'}</td>
                    <td className="px-4 py-2">{new Date(v.administered_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      {v.next_dose_date ? (
                        <span className={new Date(v.next_dose_date) < new Date() ? 'text-destructive font-medium' : 'text-primary'}>
                          {v.next_dose_date}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No vaccination records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
