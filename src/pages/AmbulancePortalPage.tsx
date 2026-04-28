import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Truck, AlertOctagon, MapPin, Phone, CheckCircle2, Activity, PlusCircle, Hospital, Loader2, ArrowRightCircle } from 'lucide-react';
import { toast } from 'sonner';

const URGENCY_VARIANT: Record<string, any> = { critical: 'destructive', emergency: 'destructive', urgent: 'default' };
const STATUS_VARIANT: Record<string, any> = {
  pending: 'secondary', accepted: 'default', en_route: 'default',
  on_scene: 'default', picked_up: 'default', at_hospital: 'outline', cancelled: 'outline',
};

export default function AmbulancePortalPage() {
  const { user, roles } = useAppContext();
  const queryClient = useQueryClient();
  const [activeRescueId, setActiveRescueId] = useState<string | null>(null);

  const isParamedic = roles.includes('paramedic');

  // The ambulance the paramedic is currently crewing
  const { data: myAmbulance } = useQuery({
    queryKey: ['my-ambulance', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('ambulances')
        .select('*, facilities(name)')
        .contains('current_crew', [user.id])
        .maybeSingle();
      return data;
    },
    enabled: !!user && isParamedic,
  });

  // All available ambulances at facilities (so paramedic can clock in)
  const { data: ambulances = [] } = useQuery({
    queryKey: ['all-ambulances'],
    queryFn: async () => {
      const { data } = await supabase.from('ambulances').select('*, facilities(name)').order('call_sign');
      return data || [];
    },
    enabled: isParamedic && !myAmbulance,
  });

  // Pending broadcast rescues + my active assignment
  const { data: rescues = [] } = useQuery({
    queryKey: ['paramedic-rescues', user?.id, myAmbulance?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('rescue_requests')
        .select('*')
        .or(`status.eq.pending,assigned_ambulance_id.eq.${myAmbulance?.id || '00000000-0000-0000-0000-000000000000'}`)
        .order('created_at', { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: isParamedic && !!myAmbulance,
    refetchInterval: 15000,
  });

  // Realtime
  useEffect(() => {
    if (!isParamedic) return;
    const channel = supabase
      .channel(`paramedic-${user?.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rescue_requests' }, (payload: any) => {
        queryClient.invalidateQueries({ queryKey: ['paramedic-rescues'] });
        if (payload.eventType === 'INSERT' && payload.new?.status === 'pending') {
          toast(payload.new.urgency === 'critical' ? '🚨 CRITICAL rescue call' : '🚨 New rescue call', {
            description: payload.new.symptom_summary || payload.new.caller_name,
          });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, isParamedic, queryClient]);

  const clockIn = useMutation({
    mutationFn: async (ambulanceId: string) => {
      const { data: amb } = await supabase.from('ambulances').select('current_crew').eq('id', ambulanceId).single();
      const newCrew = Array.from(new Set([...(amb?.current_crew || []), user!.id]));
      const { error } = await supabase.from('ambulances').update({
        current_crew: newCrew, status: 'available', last_ping_at: new Date().toISOString(),
      }).eq('id', ambulanceId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Clocked in to ambulance');
      queryClient.invalidateQueries({ queryKey: ['my-ambulance'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const clockOut = useMutation({
    mutationFn: async () => {
      if (!myAmbulance) return;
      const newCrew = (myAmbulance.current_crew || []).filter((id: string) => id !== user!.id);
      const { error } = await supabase.from('ambulances').update({
        current_crew: newCrew,
        status: newCrew.length === 0 ? 'offline' : myAmbulance.status,
      }).eq('id', myAmbulance.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Clocked out');
      queryClient.invalidateQueries({ queryKey: ['my-ambulance'] });
    },
  });

  const acceptCall = useMutation({
    mutationFn: async (rescueId: string) => {
      if (!myAmbulance) throw new Error('Clock into an ambulance first');
      const { error } = await supabase.from('rescue_requests').update({
        status: 'accepted',
        assigned_ambulance_id: myAmbulance.id,
        assigned_at: new Date().toISOString(),
        destination_hospital_id: myAmbulance.facility_id, // default to crew's home facility, can override later
      }).eq('id', rescueId).eq('status', 'pending');
      if (error) throw error;
      await supabase.from('ambulances').update({ status: 'on_call' }).eq('id', myAmbulance.id);
    },
    onSuccess: () => {
      toast.success('Call accepted — head to the location');
      queryClient.invalidateQueries({ queryKey: ['paramedic-rescues'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ rescueId, status }: { rescueId: string; status: string }) => {
      const updates: any = { status };
      if (status === 'picked_up') updates.picked_up_at = new Date().toISOString();
      if (status === 'at_hospital') {
        updates.arrived_hospital_at = new Date().toISOString();
        if (myAmbulance) await supabase.from('ambulances').update({ status: 'available' }).eq('id', myAmbulance.id);
      }
      const { error } = await supabase.from('rescue_requests').update(updates).eq('id', rescueId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['paramedic-rescues'] }),
  });

  if (!isParamedic) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <Card><CardContent className="p-8 text-center text-muted-foreground">Paramedic access required.</CardContent></Card>
      </div>
    );
  }

  // Not clocked in yet — pick an ambulance
  if (!myAmbulance) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Truck className="h-6 w-6" /> Clock in to an Ambulance</h1>
        <p className="text-sm text-muted-foreground">Select your assigned vehicle to start receiving rescue calls.</p>
        {ambulances.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground">
            No ambulances registered. Ask a facility admin to add one in the Ambulance Fleet page.
          </CardContent></Card>
        )}
        {ambulances.map((a: any) => (
          <Card key={a.id}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{a.call_sign} <span className="text-xs text-muted-foreground ml-2">{a.plate_number}</span></p>
                <p className="text-sm text-muted-foreground capitalize">{a.capability} · {a.facilities?.name}</p>
                <Badge variant="outline" className="mt-1 capitalize">{a.status}</Badge>
              </div>
              <Button size="sm" onClick={() => clockIn.mutate(a.id)} disabled={clockIn.isPending}>
                Clock in
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const activeAssignment = rescues.find((r: any) => r.assigned_ambulance_id === myAmbulance.id && !['at_hospital', 'cancelled'].includes(r.status));
  const pending = rescues.filter((r: any) => r.status === 'pending' && !r.assigned_ambulance_id);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Truck className="h-6 w-6" /> Ambulance Portal</h1>
          <p className="text-sm text-muted-foreground">
            Crewing <strong>{myAmbulance.call_sign}</strong> · <Badge variant="outline" className="capitalize">{myAmbulance.status}</Badge>
          </p>
        </div>
        <Button variant="outline" onClick={() => clockOut.mutate()} disabled={clockOut.isPending}>End shift</Button>
      </div>

      {activeAssignment && (
        <Card className="border-destructive border-2">
          <CardHeader className="bg-destructive/5">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Activity className="h-5 w-5 animate-pulse" /> ACTIVE CALL
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <ActiveCallView
              rescue={activeAssignment}
              myAmbulance={myAmbulance}
              onUpdateStatus={(status) => updateStatus.mutate({ rescueId: activeAssignment.id, status })}
              onOpenCare={() => setActiveRescueId(activeAssignment.id)}
            />
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="font-semibold mb-2 flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-destructive" /> Broadcast calls ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-muted-foreground text-center">No pending rescue calls. Stay safe.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {pending.map((r: any) => (
              <Card key={r.id}>
                <CardContent className="p-4 flex flex-wrap justify-between gap-3">
                  <div className="flex-1 min-w-[240px]">
                    <div className="flex gap-2 items-center mb-1">
                      <Badge variant={URGENCY_VARIANT[r.urgency] || 'default'} className="capitalize">{r.urgency}</Badge>
                      <span className="font-medium">{r.caller_name}</span>
                      {r.caller_phone && <a href={`tel:${r.caller_phone}`} className="text-sm text-primary flex items-center gap-1"><Phone className="h-3 w-3" />{r.caller_phone}</a>}
                    </div>
                    {r.symptom_summary && <p className="text-sm">{r.symptom_summary}</p>}
                    {r.pickup_address && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{r.pickup_address}</p>}
                    {r.pickup_lat && (
                      <a href={`https://maps.google.com/?q=${r.pickup_lat},${r.pickup_lng}`} target="_blank" rel="noreferrer"
                         className="text-xs text-primary underline">Open in Maps</a>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round((Date.now() - new Date(r.created_at).getTime()) / 1000)}s ago
                    </p>
                  </div>
                  <Button onClick={() => acceptCall.mutate(r.id)} disabled={acceptCall.isPending || !!activeAssignment}>
                    Accept
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {activeRescueId && (
        <CareLogDialog rescueId={activeRescueId} onClose={() => setActiveRescueId(null)} />
      )}
    </div>
  );
}

function ActiveCallView({ rescue, myAmbulance, onUpdateStatus, onOpenCare }: any) {
  const queryClient = useQueryClient();
  const [destOpen, setDestOpen] = useState(false);
  const [chosenDest, setChosenDest] = useState(rescue.destination_hospital_id || '');

  const { data: hospitals = [] } = useQuery({
    queryKey: ['active-hospitals'],
    queryFn: async () => {
      const { data } = await supabase.from('facilities').select('id, name, district').eq('status', 'active').order('name');
      return data || [];
    },
  });

  const updateDest = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('rescue_requests').update({ destination_hospital_id: chosenDest }).eq('id', rescue.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Destination updated — receiving hospital alerted');
      setDestOpen(false);
      queryClient.invalidateQueries({ queryKey: ['paramedic-rescues'] });
    },
  });

  const dest = hospitals.find((h: any) => h.id === rescue.destination_hospital_id);
  const next = nextStatus(rescue.status);

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center">
        <Badge variant={URGENCY_VARIANT[rescue.urgency]} className="capitalize">{rescue.urgency}</Badge>
        <Badge variant={STATUS_VARIANT[rescue.status]} className="capitalize">{rescue.status.replace('_', ' ')}</Badge>
      </div>
      <div>
        <p className="font-medium">{rescue.caller_name}</p>
        {rescue.caller_phone && <a href={`tel:${rescue.caller_phone}`} className="text-sm text-primary flex items-center gap-1"><Phone className="h-3 w-3" />{rescue.caller_phone}</a>}
        {rescue.symptom_summary && <p className="text-sm mt-1">{rescue.symptom_summary}</p>}
        {rescue.pickup_address && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {rescue.pickup_address}</p>}
        {rescue.pickup_lat && (
          <a href={`https://maps.google.com/?q=${rescue.pickup_lat},${rescue.pickup_lng}`} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
            Navigate to pickup
          </a>
        )}
      </div>

      <div className="bg-muted/40 p-3 rounded-md text-sm">
        <p className="flex items-center gap-1"><Hospital className="h-3 w-3" /> Destination: <strong>{dest?.name || 'Not set'}</strong></p>
        {!destOpen ? (
          <Button variant="link" size="sm" className="px-0 h-auto" onClick={() => setDestOpen(true)}>Change hospital</Button>
        ) : (
          <div className="flex gap-2 mt-2">
            <Select value={chosenDest} onValueChange={setChosenDest}>
              <SelectTrigger><SelectValue placeholder="Choose hospital" /></SelectTrigger>
              <SelectContent>
                {hospitals.map((h: any) => <SelectItem key={h.id} value={h.id}>{h.name} {h.district && `· ${h.district}`}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => updateDest.mutate()} disabled={updateDest.isPending || !chosenDest}>Save</Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {next && (
          <Button onClick={() => onUpdateStatus(next)}>
            <ArrowRightCircle className="h-4 w-4 mr-1" /> Mark {next.replace('_', ' ')}
          </Button>
        )}
        <Button variant="outline" onClick={onOpenCare}>
          <PlusCircle className="h-4 w-4 mr-1" /> Add care log entry
        </Button>
      </div>
    </>
  );
}

function nextStatus(s: string): string | null {
  const flow: Record<string, string> = {
    accepted: 'en_route', en_route: 'on_scene', on_scene: 'picked_up', picked_up: 'at_hospital',
  };
  return flow[s] || null;
}

function CareLogDialog({ rescueId, onClose }: { rescueId: string; onClose: () => void }) {
  const { user } = useAppContext();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('vitals');
  const [bp, setBp] = useState(''); const [hr, setHr] = useState(''); const [rr, setRr] = useState('');
  const [spo2, setSpo2] = useState(''); const [temp, setTemp] = useState('');
  const [drug, setDrug] = useState(''); const [dose, setDose] = useState(''); const [route, setRoute] = useState('');
  const [procedure, setProcedure] = useState('');
  const [note, setNote] = useState('');

  const { data: log = [] } = useQuery({
    queryKey: ['care-log', rescueId],
    queryFn: async () => {
      const { data } = await supabase.from('ambulance_care_log').select('*').eq('rescue_request_id', rescueId).order('recorded_at', { ascending: false });
      return data || [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      let entry_type = tab; let payload: any = {}; let free_text: string | null = null;
      if (tab === 'vitals') {
        payload = { bp: bp || null, hr: hr || null, rr: rr || null, spo2: spo2 || null, temp: temp || null };
        if (Object.values(payload).every(v => !v)) throw new Error('Enter at least one vital');
      } else if (tab === 'medication') {
        if (!drug) throw new Error('Drug name required');
        payload = { drug, dose, route };
      } else if (tab === 'procedure') {
        if (!procedure) throw new Error('Procedure required');
        payload = { procedure };
      } else {
        if (!note) throw new Error('Note required');
        free_text = note;
      }
      const { error } = await supabase.from('ambulance_care_log').insert({
        rescue_request_id: rescueId,
        recorded_by: user!.id,
        entry_type, payload, free_text,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Care log entry saved');
      setBp(''); setHr(''); setRr(''); setSpo2(''); setTemp('');
      setDrug(''); setDose(''); setRoute(''); setProcedure(''); setNote('');
      queryClient.invalidateQueries({ queryKey: ['care-log', rescueId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle className="flex justify-between">In-Transit Care Log <Button variant="ghost" size="sm" onClick={onClose}>×</Button></CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="medication">Medication</TabsTrigger>
              <TabsTrigger value="procedure">Procedure</TabsTrigger>
              <TabsTrigger value="note">Note</TabsTrigger>
            </TabsList>
            <TabsContent value="vitals" className="space-y-2 pt-3">
              <div className="grid grid-cols-2 gap-2">
                <div><Label>BP</Label><Input value={bp} onChange={(e) => setBp(e.target.value)} placeholder="120/80" maxLength={20} /></div>
                <div><Label>HR (bpm)</Label><Input value={hr} onChange={(e) => setHr(e.target.value)} maxLength={10} /></div>
                <div><Label>RR (/min)</Label><Input value={rr} onChange={(e) => setRr(e.target.value)} maxLength={10} /></div>
                <div><Label>SpO2 (%)</Label><Input value={spo2} onChange={(e) => setSpo2(e.target.value)} maxLength={10} /></div>
                <div><Label>Temp (°C)</Label><Input value={temp} onChange={(e) => setTemp(e.target.value)} maxLength={10} /></div>
              </div>
            </TabsContent>
            <TabsContent value="medication" className="space-y-2 pt-3">
              <div><Label>Drug *</Label><Input value={drug} onChange={(e) => setDrug(e.target.value)} maxLength={100} placeholder="e.g. Adrenaline" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Dose</Label><Input value={dose} onChange={(e) => setDose(e.target.value)} maxLength={50} placeholder="1mg" /></div>
                <div><Label>Route</Label><Input value={route} onChange={(e) => setRoute(e.target.value)} maxLength={20} placeholder="IV, IM, PO" /></div>
              </div>
            </TabsContent>
            <TabsContent value="procedure" className="pt-3">
              <Label>Procedure performed *</Label>
              <Input value={procedure} onChange={(e) => setProcedure(e.target.value)} maxLength={200} placeholder="e.g. CPR, intubation, splint applied" />
            </TabsContent>
            <TabsContent value="note" className="pt-3">
              <Label>Free-text note *</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} rows={3} />
            </TabsContent>
          </Tabs>
          <Button className="mt-4 w-full" onClick={() => add.mutate()} disabled={add.isPending}>
            {add.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
            Save entry
          </Button>

          <div className="mt-6">
            <h3 className="font-medium text-sm mb-2">Previous entries ({log.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {log.map((e: any) => (
                <div key={e.id} className="text-xs border rounded p-2">
                  <div className="flex justify-between">
                    <Badge variant="outline" className="capitalize">{e.entry_type}</Badge>
                    <span className="text-muted-foreground">{new Date(e.recorded_at).toLocaleTimeString()}</span>
                  </div>
                  <pre className="whitespace-pre-wrap mt-1 font-sans">{e.free_text || JSON.stringify(e.payload, null, 1)}</pre>
                </div>
              ))}
              {log.length === 0 && <p className="text-xs text-muted-foreground">No entries yet.</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
