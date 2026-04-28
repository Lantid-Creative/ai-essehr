import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertOctagon, Truck, Phone, MapPin, Clock, Activity } from 'lucide-react';
import { toast } from 'sonner';

const URGENCY_VARIANT: Record<string, any> = { critical: 'destructive', emergency: 'destructive', urgent: 'default' };

export default function ERInboundPage() {
  const { facilityId } = useAppContext();
  const queryClient = useQueryClient();

  const { data: inbound = [] } = useQuery({
    queryKey: ['er-inbound', facilityId],
    queryFn: async () => {
      const { data } = await supabase
        .from('rescue_requests')
        .select('*, ambulances(call_sign, plate_number, capability)')
        .or(`destination_hospital_id.eq.${facilityId},suggested_hospital_id.eq.${facilityId}`)
        .not('status', 'in', '(at_hospital,cancelled)')
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!facilityId,
    refetchInterval: 20000,
  });

  useEffect(() => {
    if (!facilityId) return;
    const channel = supabase
      .channel(`er-inbound-${facilityId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rescue_requests' }, (payload: any) => {
        const r = payload.new || payload.old;
        if (r?.destination_hospital_id === facilityId || r?.suggested_hospital_id === facilityId) {
          queryClient.invalidateQueries({ queryKey: ['er-inbound', facilityId] });
          if (payload.eventType === 'UPDATE' && payload.new?.destination_hospital_id === facilityId
              && payload.old?.destination_hospital_id !== facilityId) {
            toast('🚑 Inbound ambulance', { description: `${payload.new.caller_name} — ${payload.new.symptom_summary || 'See ER inbox'}` });
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [facilityId, queryClient]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Truck className="h-6 w-6" /> Inbound Ambulances</h1>
        <p className="text-sm text-muted-foreground">Live view of rescues heading to your facility.</p>
      </div>

      {inbound.length === 0 && (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No inbound ambulances right now.</CardContent></Card>
      )}

      {inbound.map((r: any) => (
        <Card key={r.id} className={r.destination_hospital_id === facilityId ? 'border-destructive' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertOctagon className="h-4 w-4 text-destructive" />
              {r.caller_name}
              <Badge variant={URGENCY_VARIANT[r.urgency]} className="capitalize">{r.urgency}</Badge>
              <Badge variant="outline" className="capitalize">{r.status.replace('_', ' ')}</Badge>
              {r.destination_hospital_id !== facilityId && (
                <Badge variant="secondary">Suggested only</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {r.symptom_summary && <p>{r.symptom_summary}</p>}
            {r.caller_phone && <p className="flex items-center gap-1"><Phone className="h-3 w-3" /><a href={`tel:${r.caller_phone}`} className="text-primary">{r.caller_phone}</a></p>}
            {r.pickup_address && <p className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.pickup_address}</p>}
            {r.ambulances && (
              <p className="text-muted-foreground flex items-center gap-1">
                <Truck className="h-3 w-3" /> {r.ambulances.call_sign} ({r.ambulances.capability})
                {r.ambulances.plate_number && ` · ${r.ambulances.plate_number}`}
              </p>
            )}
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Called {new Date(r.created_at).toLocaleTimeString()}
              {r.picked_up_at && ` · Picked up ${new Date(r.picked_up_at).toLocaleTimeString()}`}
            </p>
            <CareLogPreview rescueId={r.id} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CareLogPreview({ rescueId }: { rescueId: string }) {
  const { data: log = [] } = useQuery({
    queryKey: ['er-care-log', rescueId],
    queryFn: async () => {
      const { data } = await supabase.from('ambulance_care_log').select('*').eq('rescue_request_id', rescueId)
        .order('recorded_at', { ascending: false }).limit(5);
      return data || [];
    },
    refetchInterval: 15000,
  });

  if (log.length === 0) return null;

  return (
    <div className="bg-muted/30 p-2 rounded text-xs space-y-1">
      <p className="font-medium flex items-center gap-1"><Activity className="h-3 w-3" /> In-transit care</p>
      {log.map((e: any) => (
        <div key={e.id} className="flex gap-2">
          <span className="text-muted-foreground">{new Date(e.recorded_at).toLocaleTimeString()}</span>
          <Badge variant="outline" className="capitalize text-[10px] py-0">{e.entry_type}</Badge>
          <span>{e.free_text || Object.entries(e.payload).filter(([_, v]) => v).map(([k, v]) => `${k}:${v}`).join(' ')}</span>
        </div>
      ))}
    </div>
  );
}
