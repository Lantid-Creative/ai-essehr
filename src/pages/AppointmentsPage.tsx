import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { CalendarPlus, Loader2, Search, CheckCircle, Clock, XCircle } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const APPOINTMENT_TYPES = ['consultation', 'follow_up', 'immunization', 'anc', 'lab'];

export default function AppointmentsPage() {
  const { facilityId, user } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [type, setType] = useState('consultation');
  const [notes, setNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('appointments')
        .select('*')
        .eq('facility_id', facilityId)
        .gte('appointment_date', today)
        .order('appointment_date').order('appointment_time');
      if (!data || data.length === 0) return [];

      const patientIds = [...new Set(data.map((a: any) => a.patient_id))];
      const { data: patients } = await supabase.from('patients').select('id, first_name, last_name, patient_code').in('id', patientIds);
      const map = Object.fromEntries((patients || []).map(p => [p.id, p]));
      return data.map((a: any) => ({
        ...a,
        patient: map[a.patient_id] || { first_name: 'Unknown', last_name: '', patient_code: '' },
      }));
    },
    enabled: !!facilityId,
  });

  const { data: pastAppointments = [] } = useQuery({
    queryKey: ['past-appointments', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('appointments')
        .select('*')
        .eq('facility_id', facilityId)
        .lt('appointment_date', today)
        .order('appointment_date', { ascending: false })
        .limit(30);
      if (!data || data.length === 0) return [];

      const patientIds = [...new Set(data.map((a: any) => a.patient_id))];
      const { data: patients } = await supabase.from('patients').select('id, first_name, last_name').in('id', patientIds);
      const map = Object.fromEntries((patients || []).map(p => [p.id, p]));
      return data.map((a: any) => ({
        ...a,
        patient: map[a.patient_id] || { first_name: 'Unknown', last_name: '' },
      }));
    },
    enabled: !!facilityId,
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ['appt-patient-search', patientSearch, facilityId],
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

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPatientId) throw new Error('Select a patient');
      const { error } = await supabase.from('appointments').insert({
        patient_id: selectedPatientId,
        facility_id: facilityId,
        scheduled_by: user?.id,
        appointment_date: date,
        appointment_time: time,
        appointment_type: type,
        notes: notes || null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Appointment scheduled' });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setOpen(false);
      resetForm();
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('appointments').update({ status } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['past-appointments'] });
    },
  });

  const resetForm = () => {
    setPatientSearch(''); setSelectedPatientId(null); setSelectedPatientName('');
    setDate(new Date().toISOString().split('T')[0]); setTime('09:00');
    setType('consultation'); setNotes('');
  };

  const todayAppts = appointments.filter((a: any) => a.appointment_date === today);
  const upcoming = appointments.filter((a: any) => a.appointment_date > today);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Appointments & Queue</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><CalendarPlus className="h-4 w-4" /> New Appointment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
              <div>
                <Label>Patient *</Label>
                {selectedPatientId ? (
                  <div className="flex items-center justify-between bg-muted/50 p-2 rounded mt-1">
                    <span className="text-sm font-medium">{selectedPatientName}</span>
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
                          <button key={p.id} type="button" onClick={() => {
                            setSelectedPatientId(p.id);
                            setSelectedPatientName(`${p.first_name} ${p.last_name}`);
                            setPatientSearch('');
                          }} className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm">
                            {p.first_name} {p.last_name} <span className="text-xs text-muted-foreground ml-1">{p.patient_code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1" min={today} required />
                </div>
                <div>
                  <Label>Time *</Label>
                  <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1" required />
                </div>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Input value={notes} onChange={e => setNotes(e.target.value)} className="mt-1" placeholder="Optional notes..." />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending || !selectedPatientId}>
                {createMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Scheduling...</> : 'Schedule Appointment'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <Tabs defaultValue="today">
          <TabsList>
            <TabsTrigger value="today" className="gap-1"><Clock className="h-3 w-3" /> Today ({todayAppts.length})</TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-1"><CalendarPlus className="h-3 w-3" /> Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past" className="gap-1">Past ({pastAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-4">
            <AppointmentList items={todayAppts} onUpdateStatus={(id, s) => updateStatusMutation.mutate({ id, status: s })} showActions />
          </TabsContent>
          <TabsContent value="upcoming" className="mt-4">
            <AppointmentList items={upcoming} onUpdateStatus={(id, s) => updateStatusMutation.mutate({ id, status: s })} showActions />
          </TabsContent>
          <TabsContent value="past" className="mt-4">
            <AppointmentList items={pastAppointments} showActions={false} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function AppointmentList({ items, onUpdateStatus, showActions = true }: {
  items: any[];
  onUpdateStatus?: (id: string, status: string) => void;
  showActions?: boolean;
}) {
  if (items.length === 0) {
    return <div className="card-ehr p-8 text-center text-muted-foreground text-sm">No appointments found.</div>;
  }

  const statusColors: Record<string, string> = {
    scheduled: 'badge-accent',
    checked_in: 'badge-warning',
    completed: 'badge-success',
    cancelled: 'badge-danger',
    no_show: 'badge-danger',
  };

  return (
    <div className="card-ehr overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-2 font-medium">Time</th>
              <th className="text-left px-4 py-2 font-medium">Patient</th>
              <th className="text-left px-4 py-2 font-medium">Type</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              {showActions && <th className="text-left px-4 py-2 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((a: any) => (
              <tr key={a.id} className="border-b border-border hover:bg-muted/30">
                <td className="px-4 py-2">
                  <p className="font-medium">{a.appointment_time?.slice(0, 5)}</p>
                  <p className="text-xs text-muted-foreground">{a.appointment_date}</p>
                </td>
                <td className="px-4 py-2 font-medium">{a.patient.first_name} {a.patient.last_name}</td>
                <td className="px-4 py-2 capitalize">{a.appointment_type?.replace('_', ' ')}</td>
                <td className="px-4 py-2">
                  <span className={statusColors[a.status] || 'badge-accent'}>{a.status?.replace('_', ' ')}</span>
                </td>
                {showActions && (
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      {a.status === 'scheduled' && onUpdateStatus && (
                        <>
                          <button onClick={() => onUpdateStatus(a.id, 'checked_in')} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                            <CheckCircle className="h-3 w-3" /> Check In
                          </button>
                          <button onClick={() => onUpdateStatus(a.id, 'cancelled')} className="text-xs text-destructive hover:underline flex items-center gap-0.5 ml-2">
                            <XCircle className="h-3 w-3" /> Cancel
                          </button>
                        </>
                      )}
                      {a.status === 'checked_in' && onUpdateStatus && (
                        <button onClick={() => onUpdateStatus(a.id, 'completed')} className="text-xs text-success hover:underline flex items-center gap-0.5">
                          <CheckCircle className="h-3 w-3" /> Complete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
