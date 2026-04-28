import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertOctagon, MapPin, Phone, Loader2, X, Truck, Activity, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Broadcasting to nearby ambulances…',
  accepted: 'Ambulance accepted — coming to you',
  en_route: 'Ambulance en route',
  on_scene: 'Ambulance has arrived on scene',
  picked_up: 'You are in the ambulance — heading to hospital',
  at_hospital: 'You have arrived at hospital',
  cancelled: 'Cancelled',
};

export default function RescueTapPage() {
  const { user, profile } = useAppContext();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [urgency, setUrgency] = useState<'urgent' | 'emergency' | 'critical'>('emergency');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  // Fetch latest active rescue (if any)
  const { data: active } = useQuery({
    queryKey: ['my-active-rescue', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('rescue_requests')
        .select('*, ambulances(call_sign, plate_number, capability), suggested:facilities!rescue_requests_suggested_hospital_id_fkey(name), destination:facilities!rescue_requests_destination_hospital_id_fkey(name)')
        .eq('caller_user_id', user.id)
        .not('status', 'in', '(at_hospital,cancelled)')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Fallback query if FK names differ — try simpler shape
  const { data: activeFallback } = useQuery({
    queryKey: ['my-active-rescue-simple', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('rescue_requests')
        .select('*, ambulances(call_sign, plate_number, capability)')
        .eq('caller_user_id', user.id)
        .not('status', 'in', '(at_hospital,cancelled)')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user && !active,
  });

  const current = active || activeFallback;

  // Realtime updates on caller's request
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`rescue-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rescue_requests', filter: `caller_user_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['my-active-rescue', user.id] });
        queryClient.invalidateQueries({ queryKey: ['my-active-rescue-simple', user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location not available on this device');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success('Location captured');
      },
      () => { setLocating(false); toast.error('Could not get your location — please type your address'); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const findNearestHospital = async (lat: number | null, lng: number | null) => {
    const { data: facilities } = await supabase
      .from('facilities')
      .select('id, name, latitude, longitude')
      .eq('status', 'active')
      .not('latitude', 'is', null);
    if (!facilities || facilities.length === 0) return null;
    if (lat == null || lng == null) return facilities[0].id;
    let closestId = facilities[0].id;
    let closestDist = Infinity;
    for (const f of facilities) {
      if (f.latitude == null || f.longitude == null) continue;
      const d = Math.hypot(Number(f.latitude) - lat, Number(f.longitude) - lng);
      if (d < closestDist) { closestDist = d; closestId = f.id; }
    }
    return closestId;
  };

  const createRescue = useMutation({
    mutationFn: async () => {
      if (!user || !profile) throw new Error('Not signed in');
      if (!symptoms.trim()) throw new Error('Briefly describe what is wrong');
      const suggestedId = await findNearestHospital(coords?.lat ?? null, coords?.lng ?? null);
      const { data, error } = await supabase.from('rescue_requests').insert({
        caller_user_id: user.id,
        caller_name: profile.full_name || 'Anonymous',
        caller_phone: phone.trim().slice(0, 30) || null,
        symptom_summary: symptoms.trim().slice(0, 500),
        urgency,
        pickup_lat: coords?.lat ?? null,
        pickup_lng: coords?.lng ?? null,
        pickup_address: address.trim().slice(0, 300) || null,
        suggested_hospital_id: suggestedId,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('🚨 Rescue request sent', { description: 'Nearby ambulances are being notified now.' });
      setConfirmOpen(false);
      setSymptoms(''); setAddress(''); setCoords(null);
      queryClient.invalidateQueries({ queryKey: ['my-active-rescue', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['my-active-rescue-simple', user?.id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const cancelRescue = useMutation({
    mutationFn: async () => {
      if (!current) return;
      const { error } = await supabase.from('rescue_requests')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancellation_reason: 'Cancelled by patient' })
        .eq('id', current.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Rescue cancelled');
      queryClient.invalidateQueries({ queryKey: ['my-active-rescue', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['my-active-rescue-simple', user?.id] });
    },
  });

  // ============ Active rescue view ============
  if (current) {
    const amb = (current as any).ambulances;
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <Card className="border-destructive border-2">
          <CardHeader className="bg-destructive/10">
            <CardTitle className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-destructive" />
              Rescue in progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="text-center py-4">
              <Activity className="h-10 w-10 text-destructive mx-auto animate-pulse mb-2" />
              <p className="font-medium text-lg">{STATUS_LABEL[current.status] || current.status}</p>
              {current.urgency && <Badge variant="destructive" className="mt-2 capitalize">{current.urgency}</Badge>}
            </div>

            {amb && (
              <div className="bg-muted/40 p-4 rounded-lg space-y-1">
                <p className="font-medium flex items-center gap-2"><Truck className="h-4 w-4" /> {amb.call_sign}</p>
                {amb.plate_number && <p className="text-sm text-muted-foreground">Plate: {amb.plate_number}</p>}
                <p className="text-sm text-muted-foreground capitalize">Capability: {amb.capability}</p>
              </div>
            )}

            {current.symptom_summary && (
              <div>
                <p className="text-xs text-muted-foreground">You reported:</p>
                <p className="text-sm">{current.symptom_summary}</p>
              </div>
            )}

            {current.status !== 'picked_up' && current.status !== 'at_hospital' && (
              <Button variant="outline" className="w-full" onClick={() => cancelRescue.mutate()} disabled={cancelRescue.isPending}>
                <X className="h-4 w-4 mr-1" /> Cancel rescue
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============ Idle / SOS view ============
  if (!confirmOpen) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Emergency Rescue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Press the button below to alert nearby ambulances. Use only in a real medical emergency.
          </p>
        </div>

        <Card className="border-destructive/40">
          <CardContent className="p-12 flex flex-col items-center gap-6">
            <button
              onClick={() => setConfirmOpen(true)}
              className="relative w-48 h-48 rounded-full bg-destructive text-destructive-foreground font-bold text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-transform flex flex-col items-center justify-center gap-2"
            >
              <span className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-20" />
              <AlertOctagon className="h-12 w-12" />
              <span>SOS</span>
              <span className="text-xs font-normal">Tap for ambulance</span>
            </button>
            <p className="text-xs text-muted-foreground text-center max-w-sm">
              Misuse of this service is a criminal offence. False alerts will be reported to authorities.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============ Confirmation form ============
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertOctagon className="h-5 w-5 text-destructive" /> Confirm Rescue Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>How urgent?</Label>
            <Select value={urgency} onValueChange={(v: any) => setUrgency(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent — need help soon</SelectItem>
                <SelectItem value="emergency">Emergency — serious right now</SelectItem>
                <SelectItem value="critical">Critical — life-threatening</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>What is wrong? *</Label>
            <Textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} maxLength={500}
              placeholder="e.g. Chest pain and difficulty breathing. Started 20 minutes ago."
              rows={3} />
          </div>

          <div>
            <Label>Phone the crew should call</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} placeholder="+234 ..." />
          </div>

          <div>
            <Label>Where are you?</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300}
              placeholder="House number, street, landmark…" />
            <Button type="button" variant="outline" size="sm" className="mt-2 w-full" onClick={captureLocation} disabled={locating}>
              {locating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
              {coords ? <><CheckCircle2 className="h-4 w-4 mr-1 text-success" /> GPS captured ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})</> : 'Share precise GPS location'}
            </Button>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)}>Back</Button>
            <Button variant="destructive" className="flex-1" onClick={() => createRescue.mutate()} disabled={createRescue.isPending}>
              {createRescue.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Phone className="h-4 w-4 mr-1" /> Send Rescue Alert
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
