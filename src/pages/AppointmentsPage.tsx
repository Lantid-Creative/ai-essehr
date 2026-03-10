import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import {
  CalendarPlus, Loader2, Search, CheckCircle, Clock, XCircle,
  AlertTriangle, Zap, ArrowUp, ArrowRight, Users
} from 'lucide-react';
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

const APPOINTMENT_TYPES = ['consultation', 'follow_up', 'immunization', 'anc', 'lab', 'emergency'];
const TRIAGE_LEVELS = [
  { value: 'emergency', label: 'Emergency', color: 'bg-destructive text-destructive-foreground', icon: Zap, order: 0 },
  { value: 'urgent', label: 'Urgent', color: 'bg-amber-500 text-white', icon: AlertTriangle, order: 1 },
  { value: 'priority', label: 'Priority', color: 'bg-blue-500 text-white', icon: ArrowUp, order: 2 },
  { value: 'routine', label: 'Routine', color: 'bg-muted text-muted-foreground', icon: ArrowRight, order: 3 },
];

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
  const [triage, setTriage] = useState('routine');
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
      // Generate queue number for today
      const todayCount = appointments.filter((a: any) => a.appointment_date === date).length;
      const { error } = await supabase.from('appointments').insert({
        patient_id: selectedPatientId,
        facility_id: facilityId,
        scheduled_by: user?.id,
        appointment_date: date,
        appointment_time: time,
        appointment_type: type,
        triage_priority: triage,
        queue_number: todayCount + 1,
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
      const update: any = { status };
      if (status === 'checked_in') update.checked_in_at = new Date().toISOString();
      const { error } = await supabase.from('appointments').update(update as any).eq('id', id);
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
    setType('consultation'); setTriage('routine'); setNotes('');
  };

  // Sort today's queue by triage priority, then time
  const triageOrder: Record<string, number> = { emergency: 0, urgent: 1, priority: 2, routine: 3 };
  const todayAppts = appointments
    .filter((a: any) => a.appointment_date === today)
    .sort((a: any, b: any) => {
      const ta = triageOrder[a.triage_priority || 'routine'] ?? 3;
      const tb = triageOrder[b.triage_priority || 'routine'] ?? 3;
      if (ta !== tb) return ta - tb;
      return (a.appointment_time || '').localeCompare(b.appointment_time || '');
    });
  const upcoming = appointments.filter((a: any) => a.appointment_date > today);
  const checkedIn = todayAppts.filter((a: any) => a.status === 'checked_in');
  const waiting = todayAppts.filter((a: any) => a.status === 'scheduled');

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Queue & Appointments</h1>
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
              <div className="grid grid-cols-2 gap-4">
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
                  <Label>Triage Priority</Label>
                  <Select value={triage} onValueChange={setTriage}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRIAGE_LEVELS.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

      {/* Queue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-3">
          <Users className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-2xl font-heading font-medium">{todayAppts.length}</p>
            <p className="text-xs text-muted-foreground">Today's Queue</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-2xl font-heading font-medium">{waiting.length}</p>
            <p className="text-xs text-muted-foreground">Waiting</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="text-2xl font-heading font-medium">{checkedIn.length}</p>
            <p className="text-xs text-muted-foreground">Checked In</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <Zap className="h-5 w-5 text-destructive shrink-0" />
          <div>
            <p className="text-2xl font-heading font-medium">{todayAppts.filter((a: any) => (a.triage_priority === 'emergency' || a.triage_priority === 'urgent') && a.status !== 'completed').length}</p>
            <p className="text-xs text-muted-foreground">Urgent/Emergency</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <Tabs defaultValue="queue">
          <TabsList>
            <TabsTrigger value="queue" className="gap-1"><Users className="h-3 w-3" /> Today's Queue ({todayAppts.length})</TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-1"><CalendarPlus className="h-3 w-3" /> Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past" className="gap-1">Past ({pastAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="mt-4">
            <QueueList items={todayAppts} onUpdateStatus={(id, s) => updateStatusMutation.mutate({ id, status: s })} />
          </TabsContent>
          <TabsContent value="upcoming" className="mt-4">
            <QueueList items={upcoming} onUpdateStatus={(id, s) => updateStatusMutation.mutate({ id, status: s })} />
          </TabsContent>
          <TabsContent value="past" className="mt-4">
            <QueueList items={pastAppointments} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function QueueList({ items, onUpdateStatus }: { items: any[]; onUpdateStatus?: (id: string, status: string) => void }) {
  if (items.length === 0) {
    return <div className="card-ehr p-8 text-center text-muted-foreground text-sm">No appointments found.</div>;
  }

  const statusColors: Record<string, string> = {
    scheduled: 'text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground',
    checked_in: 'text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800',
    completed: 'text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800',
    cancelled: 'text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive',
    no_show: 'text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive',
  };

  const triageColors: Record<string, string> = {
    emergency: 'text-xs px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground font-semibold',
    urgent: 'text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white font-medium',
    priority: 'text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800',
    routine: 'text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground',
  };

  return (
    <div className="card-ehr overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-center px-3 py-2 font-medium w-12">#</th>
              <th className="text-left px-4 py-2 font-medium">Priority</th>
              <th className="text-left px-4 py-2 font-medium">Time</th>
              <th className="text-left px-4 py-2 font-medium">Patient</th>
              <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">Type</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              {onUpdateStatus && <th className="text-left px-4 py-2 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((a: any, idx: number) => (
              <tr key={a.id} className={`border-b border-border hover:bg-muted/30 ${
                a.triage_priority === 'emergency' ? 'bg-destructive/5' :
                a.triage_priority === 'urgent' ? 'bg-amber-50' : ''
              }`}>
                <td className="px-3 py-2 text-center font-mono text-xs text-muted-foreground">
                  {a.queue_number || idx + 1}
                </td>
                <td className="px-4 py-2">
                  <span className={triageColors[a.triage_priority || 'routine']}>
                    {(a.triage_priority || 'routine').charAt(0).toUpperCase() + (a.triage_priority || 'routine').slice(1)}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <p className="font-medium">{a.appointment_time?.slice(0, 5)}</p>
                  <p className="text-xs text-muted-foreground">{a.appointment_date}</p>
                </td>
                <td className="px-4 py-2 font-medium">{a.patient.first_name} {a.patient.last_name}</td>
                <td className="px-4 py-2 capitalize hidden sm:table-cell">{a.appointment_type?.replace('_', ' ')}</td>
                <td className="px-4 py-2">
                  <span className={statusColors[a.status] || statusColors.scheduled}>{a.status?.replace('_', ' ')}</span>
                </td>
                {onUpdateStatus && (
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      {a.status === 'scheduled' && (
                        <>
                          <button onClick={() => onUpdateStatus(a.id, 'checked_in')} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                            <CheckCircle className="h-3 w-3" /> Check In
                          </button>
                          <button onClick={() => onUpdateStatus(a.id, 'no_show')} className="text-xs text-destructive hover:underline flex items-center gap-0.5 ml-2">
                            <XCircle className="h-3 w-3" /> No Show
                          </button>
                        </>
                      )}
                      {a.status === 'checked_in' && (
                        <button onClick={() => onUpdateStatus(a.id, 'completed')} className="text-xs text-green-700 hover:underline flex items-center gap-0.5">
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
