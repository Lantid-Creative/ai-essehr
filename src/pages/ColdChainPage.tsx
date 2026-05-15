import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Thermometer, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function ColdChainPage() {
  const { facilityId, user } = useAppContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [eqOpen, setEqOpen] = useState(false);
  const [logOpen, setLogOpen] = useState<string | null>(null);
  const [eq, setEq] = useState({ name: '', equipment_type: 'fridge', location: '', min_temp_c: '2', max_temp_c: '8' });
  const [log, setLog] = useState({ temp_c: '', reading_period: 'morning', action_taken: '', notes: '' });

  const { data: equipment = [] } = useQuery({
    queryKey: ['cold-equipment', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('cold_chain_equipment')
        .select('*').eq('facility_id', facilityId).order('name');
      return data || [];
    },
    enabled: !!facilityId,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['cold-logs', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('cold_chain_temperature_logs')
        .select('*').eq('facility_id', facilityId).order('recorded_at', { ascending: false }).limit(100);
      return data || [];
    },
    enabled: !!facilityId,
  });

  const addEq = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('cold_chain_equipment').insert({
        facility_id: facilityId!,
        name: eq.name,
        equipment_type: eq.equipment_type,
        location: eq.location || null,
        min_temp_c: parseFloat(eq.min_temp_c),
        max_temp_c: parseFloat(eq.max_temp_c),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Equipment added' });
      qc.invalidateQueries({ queryKey: ['cold-equipment'] });
      setEqOpen(false);
      setEq({ name: '', equipment_type: 'fridge', location: '', min_temp_c: '2', max_temp_c: '8' });
    },
  });

  const addLog = useMutation({
    mutationFn: async () => {
      if (!logOpen) return;
      const { error } = await supabase.from('cold_chain_temperature_logs').insert({
        facility_id: facilityId!,
        equipment_id: logOpen,
        temp_c: parseFloat(log.temp_c),
        reading_period: log.reading_period,
        action_taken: log.action_taken || null,
        notes: log.notes || null,
        recorded_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Temperature logged' });
      qc.invalidateQueries({ queryKey: ['cold-logs'] });
      setLogOpen(null);
      setLog({ temp_c: '', reading_period: 'morning', action_taken: '', notes: '' });
    },
  });

  const excursions = logs.filter(l => l.is_excursion);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Thermometer className="h-6 w-6 text-primary" /> Cold Chain & Vaccines
          </h1>
          <p className="text-sm text-muted-foreground">Vaccine fridge inventory, twice-daily temperature log, and excursion alerts.</p>
        </div>
        <Dialog open={eqOpen} onOpenChange={setEqOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Equipment</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Register Cold-Chain Equipment</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name *</Label><Input value={eq.name} onChange={e => setEq({ ...eq, name: e.target.value })} placeholder="e.g. EPI Fridge 1" /></div>
              <div><Label>Type</Label>
                <Select value={eq.equipment_type} onValueChange={v => setEq({ ...eq, equipment_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fridge">Fridge</SelectItem>
                    <SelectItem value="freezer">Freezer</SelectItem>
                    <SelectItem value="cold_box">Cold box</SelectItem>
                    <SelectItem value="vaccine_carrier">Vaccine carrier</SelectItem>
                    <SelectItem value="solar_fridge">Solar fridge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Location</Label><Input value={eq.location} onChange={e => setEq({ ...eq, location: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Min temp (°C)</Label><Input type="number" step="0.1" value={eq.min_temp_c} onChange={e => setEq({ ...eq, min_temp_c: e.target.value })} /></div>
                <div><Label>Max temp (°C)</Label><Input type="number" step="0.1" value={eq.max_temp_c} onChange={e => setEq({ ...eq, max_temp_c: e.target.value })} /></div>
              </div>
              <Button onClick={() => addEq.mutate()} disabled={addEq.isPending || !eq.name}>{addEq.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {excursions.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div>
            <p className="font-medium text-destructive">{excursions.length} temperature excursion(s) recorded recently</p>
            <p className="text-xs text-muted-foreground">Check the affected equipment immediately and document corrective action.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {equipment.map(e => {
          const recent = logs.filter(l => l.equipment_id === e.id).slice(0, 5);
          return (
            <div key={e.id} className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{e.name}</p>
                  <p className="text-xs text-muted-foreground">{e.equipment_type} • {e.location || '—'} • Range {e.min_temp_c}–{e.max_temp_c}°C</p>
                </div>
                <Badge variant={e.status === 'operational' ? 'default' : 'destructive'}>{e.status}</Badge>
              </div>
              <Dialog open={logOpen === e.id} onOpenChange={o => setLogOpen(o ? e.id : null)}>
                <DialogTrigger asChild><Button size="sm" variant="outline" className="w-full">+ Log Temperature</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Log temperature — {e.name}</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>Temperature (°C) *</Label><Input type="number" step="0.1" value={log.temp_c} onChange={ev => setLog({ ...log, temp_c: ev.target.value })} /></div>
                    <div><Label>Reading period</Label>
                      <Select value={log.reading_period} onValueChange={v => setLog({ ...log, reading_period: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                          <SelectItem value="adhoc">Ad-hoc</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Action taken (if excursion)</Label><Textarea rows={2} value={log.action_taken} onChange={ev => setLog({ ...log, action_taken: ev.target.value })} /></div>
                    <Button onClick={() => addLog.mutate()} disabled={addLog.isPending || !log.temp_c}>{addLog.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save reading</Button>
                  </div>
                </DialogContent>
              </Dialog>
              {recent.length > 0 && (
                <div className="text-xs space-y-1 border-t pt-2">
                  {recent.map(r => (
                    <div key={r.id} className={`flex justify-between ${r.is_excursion ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                      <span>{new Date(r.recorded_at).toLocaleString()} ({r.reading_period})</span>
                      <span>{r.temp_c}°C {r.is_excursion && '⚠️'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {equipment.length === 0 && <p className="col-span-2 text-center text-muted-foreground p-8 text-sm">No cold-chain equipment registered yet.</p>}
      </div>
    </div>
  );
}
