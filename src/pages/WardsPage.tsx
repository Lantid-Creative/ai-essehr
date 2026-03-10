import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { BedDouble, Loader2, UserPlus, UserMinus, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

export default function WardsPage() {
  const { facilityId } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [admitDialog, setAdmitDialog] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isolationFlag, setIsolationFlag] = useState(false);
  const [admitNotes, setAdmitNotes] = useState('');

  const { data: beds = [], isLoading } = useQuery({
    queryKey: ['ward-beds', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('ward_beds')
        .select('*')
        .eq('facility_id', facilityId)
        .order('ward_name').order('bed_number');
      if (!data || data.length === 0) return [];
      const occupiedBeds = data.filter(b => b.patient_id);
      if (occupiedBeds.length > 0) {
        const patientIds = [...new Set(occupiedBeds.map(b => b.patient_id!))];
        const { data: patients } = await supabase.from('patients')
          .select('id, first_name, last_name').in('id', patientIds);
        const map = Object.fromEntries((patients || []).map(p => [p.id, `${p.first_name} ${p.last_name}`]));
        return data.map(b => ({ ...b, patientName: b.patient_id ? map[b.patient_id] || 'Unknown' : undefined }));
      }
      return data.map(b => ({ ...b, patientName: undefined }));
    },
    enabled: !!facilityId,
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ['ward-patient-search', patientSearch, facilityId],
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

  const admitMutation = useMutation({
    mutationFn: async () => {
      if (!admitDialog || !selectedPatientId) throw new Error('Select a patient');
      const { error } = await supabase.from('ward_beds').update({
        status: 'occupied',
        patient_id: selectedPatientId,
        admission_date: new Date().toISOString(),
        isolation_flag: isolationFlag,
        notes: admitNotes || null,
      }).eq('id', admitDialog);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Patient admitted to bed' });
      queryClient.invalidateQueries({ queryKey: ['ward-beds'] });
      closeAdmitDialog();
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const dischargeMutation = useMutation({
    mutationFn: async (bedId: string) => {
      const { error } = await supabase.from('ward_beds').update({
        status: 'available',
        patient_id: null,
        admission_date: null,
        discharge_date: new Date().toISOString(),
        isolation_flag: false,
        notes: null,
      }).eq('id', bedId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Patient discharged' });
      queryClient.invalidateQueries({ queryKey: ['ward-beds'] });
    },
  });

  const closeAdmitDialog = () => {
    setAdmitDialog(null);
    setPatientSearch('');
    setSelectedPatientId(null);
    setIsolationFlag(false);
    setAdmitNotes('');
  };

  // Group beds by ward
  const wardGroups = beds.reduce<Record<string, typeof beds>>((acc, bed) => {
    if (!acc[bed.ward_name]) acc[bed.ward_name] = [];
    acc[bed.ward_name].push(bed);
    return acc;
  }, {});

  const totalBeds = beds.length;
  const occupied = beds.filter(b => b.status === 'occupied').length;
  const available = beds.filter(b => b.status === 'available').length;
  const reserved = beds.filter(b => b.status === 'reserved').length;

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-heading font-medium">Ward Management</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><p className="text-2xl font-heading font-medium">{totalBeds}</p><p className="text-xs text-muted-foreground">Total Beds</p></div>
        <div className="stat-card"><p className="text-2xl font-heading font-medium text-destructive">{occupied}</p><p className="text-xs text-muted-foreground">Occupied</p></div>
        <div className="stat-card"><p className="text-2xl font-heading font-medium text-success">{available}</p><p className="text-xs text-muted-foreground">Available</p></div>
        <div className="stat-card"><p className="text-2xl font-heading font-medium text-accent">{reserved}</p><p className="text-xs text-muted-foreground">Reserved</p></div>
      </div>

      {Object.entries(wardGroups).map(([wardName, wardBeds]) => (
        <div key={wardName} className="card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">{wardName}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {wardBeds.map((bed: any) => (
              <div key={bed.id} className={`rounded-lg p-3 text-center text-xs border transition-colors ${
                bed.status === 'occupied' ? 'bg-destructive/10 border-destructive/30' :
                bed.status === 'reserved' ? 'bg-accent/10 border-accent/30' :
                bed.status === 'maintenance' ? 'bg-muted border-border' :
                'bg-success/10 border-success/30'
              }`}>
                <p className="font-bold text-sm">{bed.bed_number}</p>
                <p className={`mt-0.5 capitalize ${
                  bed.status === 'occupied' ? 'text-destructive' : bed.status === 'reserved' ? 'text-accent' : 'text-success'
                }`}>{bed.status}</p>
                {bed.patientName && <p className="text-muted-foreground mt-1 truncate">{bed.patientName}</p>}
                {bed.isolation_flag && <span className="badge-danger mt-1 inline-block">⚠ Isolation</span>}
                {bed.admission_date && (
                  <p className="text-[10px] text-muted-foreground mt-1">Since {new Date(bed.admission_date).toLocaleDateString()}</p>
                )}
                <div className="mt-2">
                  {bed.status === 'available' && (
                    <button onClick={() => setAdmitDialog(bed.id)}
                      className="text-primary text-[11px] hover:underline flex items-center gap-1 mx-auto">
                      <UserPlus className="h-3 w-3" /> Admit
                    </button>
                  )}
                  {bed.status === 'occupied' && (
                    <button onClick={() => dischargeMutation.mutate(bed.id)}
                      className="text-destructive text-[11px] hover:underline flex items-center gap-1 mx-auto">
                      <UserMinus className="h-3 w-3" /> Discharge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {beds.length === 0 && (
        <div className="card-ehr p-8 text-center text-muted-foreground text-sm">
          No ward beds configured. Contact your facility administrator.
        </div>
      )}

      {/* Admit Patient Dialog */}
      <Dialog open={!!admitDialog} onOpenChange={(open) => !open && closeAdmitDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admit Patient to Bed</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); admitMutation.mutate(); }} className="space-y-4">
            <div>
              <Label>Patient *</Label>
              {selectedPatientId ? (
                <div className="flex items-center justify-between bg-muted/50 p-2 rounded mt-1">
                  <span className="text-sm font-medium">
                    {searchResults.find(p => p.id === selectedPatientId)?.first_name} {searchResults.find(p => p.id === selectedPatientId)?.last_name}
                  </span>
                  <button type="button" onClick={() => { setSelectedPatientId(null); setPatientSearch(''); }} className="text-xs text-primary hover:underline">Change</button>
                </div>
              ) : (
                <>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={patientSearch} onChange={e => setPatientSearch(e.target.value)} placeholder="Search patient..." className="pl-10" />
                  </div>
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
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isolation" checked={isolationFlag} onChange={e => setIsolationFlag(e.target.checked)} className="rounded border-input" />
              <Label htmlFor="isolation" className="cursor-pointer flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-warning" /> Isolation Required
              </Label>
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={admitNotes} onChange={e => setAdmitNotes(e.target.value)} placeholder="Admission notes..." className="mt-1" />
            </div>
            <Button type="submit" className="w-full" disabled={admitMutation.isPending || !selectedPatientId}>
              {admitMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Admitting...</> : 'Admit Patient'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
