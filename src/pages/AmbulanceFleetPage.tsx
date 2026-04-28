import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Truck, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CAPABILITIES = ['basic', 'advanced', 'trauma', 'maternity', 'neonatal'];

export default function AmbulanceFleetPage() {
  const { facilityId, roles } = useAppContext();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [callSign, setCallSign] = useState(''); const [plate, setPlate] = useState('');
  const [capability, setCapability] = useState('basic');

  const canManage = roles.includes('facility_admin') || roles.includes('super_admin');

  const { data: ambulances = [] } = useQuery({
    queryKey: ['fleet', facilityId],
    queryFn: async () => {
      const { data } = await supabase.from('ambulances').select('*')
        .eq('facility_id', facilityId!).order('call_sign');
      return data || [];
    },
    enabled: !!facilityId,
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!callSign.trim()) throw new Error('Call sign required');
      const { error } = await supabase.from('ambulances').insert({
        facility_id: facilityId, call_sign: callSign.trim().slice(0, 50),
        plate_number: plate.trim().slice(0, 30) || null, capability, status: 'offline',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Ambulance added'); setOpen(false);
      setCallSign(''); setPlate(''); setCapability('basic');
      queryClient.invalidateQueries({ queryKey: ['fleet'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Truck className="h-6 w-6" /> Ambulance Fleet</h1>
          <p className="text-sm text-muted-foreground">Vehicles registered to your facility.</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Add ambulance</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Register new ambulance</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Call sign *</Label><Input value={callSign} onChange={(e) => setCallSign(e.target.value)} placeholder="AMB-01" maxLength={50} /></div>
                <div><Label>Plate number</Label><Input value={plate} onChange={(e) => setPlate(e.target.value)} maxLength={30} /></div>
                <div><Label>Capability</Label>
                  <Select value={capability} onValueChange={setCapability}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CAPABILITIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => create.mutate()} disabled={create.isPending}>
                  {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {ambulances.length === 0 && (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          No ambulances yet. {canManage && 'Add your first vehicle to start receiving rescue calls.'}
        </CardContent></Card>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {ambulances.map((a: any) => (
          <Card key={a.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{a.call_sign}</span>
                <Badge variant={a.status === 'available' ? 'default' : a.status === 'on_call' ? 'destructive' : 'outline'} className="capitalize">{a.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {a.plate_number && <p className="text-muted-foreground">Plate: {a.plate_number}</p>}
              <p className="text-muted-foreground capitalize">Capability: {a.capability}</p>
              <p className="text-muted-foreground">Crew on board: {(a.current_crew || []).length}</p>
              {a.last_ping_at && <p className="text-xs text-muted-foreground">Last ping: {new Date(a.last_ping_at).toLocaleString()}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
