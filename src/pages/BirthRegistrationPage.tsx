import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Baby, Plus, Loader2, BadgeCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type Status = 'pending' | 'submitted' | 'nin_assigned' | 'certificate_issued' | 'failed';

const statusVariant: Record<Status, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  submitted: 'secondary',
  nin_assigned: 'default',
  certificate_issued: 'default',
  failed: 'destructive',
};

export default function BirthRegistrationPage() {
  const { facilityId, user } = useAppContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    mother_name: '', mother_nin: '', father_name: '', father_nin: '',
    child_first_name: '', child_surname: '', child_sex: 'male',
    date_of_birth: new Date().toISOString().slice(0, 10), time_of_birth: '',
    birth_weight_kg: '', apgar_1_min: '', apgar_5_min: '',
    mode_of_delivery: 'svd', remarks: '',
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['births', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('birth_registrations')
        .select('*').eq('facility_id', facilityId)
        .order('date_of_birth', { ascending: false }).limit(100);
      return data || [];
    },
    enabled: !!facilityId,
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('birth_registrations').insert({
        facility_id: facilityId!,
        mother_name: form.mother_name,
        mother_nin: form.mother_nin || null,
        father_name: form.father_name || null,
        father_nin: form.father_nin || null,
        child_first_name: form.child_first_name,
        child_surname: form.child_surname,
        child_sex: form.child_sex,
        date_of_birth: form.date_of_birth,
        time_of_birth: form.time_of_birth || null,
        birth_weight_kg: form.birth_weight_kg ? parseFloat(form.birth_weight_kg) : null,
        apgar_1_min: form.apgar_1_min ? parseInt(form.apgar_1_min) : null,
        apgar_5_min: form.apgar_5_min ? parseInt(form.apgar_5_min) : null,
        mode_of_delivery: form.mode_of_delivery,
        attending_clinician: user?.id,
        created_by: user?.id,
        remarks: form.remarks || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Birth registered', description: 'NIN and birth-certificate requests queued.' });
      qc.invalidateQueries({ queryKey: ['births'] });
      setOpen(false);
      setForm({ ...form, mother_name: '', child_first_name: '', child_surname: '', remarks: '' });
    },
    onError: (e: any) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Baby className="h-6 w-6 text-primary" /> Birth Registration
          </h1>
          <p className="text-sm text-muted-foreground">Register newborns; NIN (NIMC) and birth certificate (NPopC) submitted automatically.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Birth</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Register a Newborn</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Mother's full name *</Label><Input value={form.mother_name} onChange={e => setForm({ ...form, mother_name: e.target.value })} /></div>
              <div><Label>Mother NIN</Label><Input value={form.mother_nin} onChange={e => setForm({ ...form, mother_nin: e.target.value })} /></div>
              <div><Label>Father's name</Label><Input value={form.father_name} onChange={e => setForm({ ...form, father_name: e.target.value })} /></div>
              <div><Label>Father NIN</Label><Input value={form.father_nin} onChange={e => setForm({ ...form, father_nin: e.target.value })} /></div>
              <div><Label>Child first name *</Label><Input value={form.child_first_name} onChange={e => setForm({ ...form, child_first_name: e.target.value })} /></div>
              <div><Label>Child surname *</Label><Input value={form.child_surname} onChange={e => setForm({ ...form, child_surname: e.target.value })} /></div>
              <div><Label>Sex</Label>
                <Select value={form.child_sex} onValueChange={v => setForm({ ...form, child_sex: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Mode of delivery</Label>
                <Select value={form.mode_of_delivery} onValueChange={v => setForm({ ...form, mode_of_delivery: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="svd">SVD (Spontaneous Vaginal)</SelectItem>
                    <SelectItem value="assisted">Assisted</SelectItem>
                    <SelectItem value="c_section">Caesarean Section</SelectItem>
                    <SelectItem value="breech">Breech</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Date of birth *</Label><Input type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} /></div>
              <div><Label>Time of birth</Label><Input type="time" value={form.time_of_birth} onChange={e => setForm({ ...form, time_of_birth: e.target.value })} /></div>
              <div><Label>Birth weight (kg)</Label><Input type="number" step="0.01" value={form.birth_weight_kg} onChange={e => setForm({ ...form, birth_weight_kg: e.target.value })} /></div>
              <div><Label>APGAR 1 min</Label><Input type="number" min="0" max="10" value={form.apgar_1_min} onChange={e => setForm({ ...form, apgar_1_min: e.target.value })} /></div>
              <div><Label>APGAR 5 min</Label><Input type="number" min="0" max="10" value={form.apgar_5_min} onChange={e => setForm({ ...form, apgar_5_min: e.target.value })} /></div>
              <div className="col-span-2"><Label>Remarks</Label><Textarea rows={2} value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} /></div>
            </div>
            <Button onClick={() => create.mutate()} disabled={create.isPending || !form.mother_name || !form.child_first_name || !form.child_surname}>
              {create.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BadgeCheck className="h-4 w-4 mr-2" />}
              Register Birth
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b font-semibold">Recent Births ({records.length})</div>
        {isLoading ? <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <div className="divide-y">
            {records.length === 0 && <p className="p-8 text-center text-muted-foreground text-sm">No births registered yet.</p>}
            {records.map(r => (
              <div key={r.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.child_first_name} {r.child_surname} <span className="text-xs text-muted-foreground">({r.child_sex})</span></p>
                  <p className="text-xs text-muted-foreground">Mother: {r.mother_name} • DOB: {r.date_of_birth} • {r.mode_of_delivery?.toUpperCase()}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={statusVariant[r.nimc_request_status as Status]}>NIN: {r.nimc_request_status.replace('_', ' ')}</Badge>
                  <Badge variant={statusVariant[r.npopc_status as Status]}>NPopC: {r.npopc_status.replace('_', ' ')}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <Clock className="h-3 w-3" /> NIMC NIN assignment and NPopC certificate issuance happen via background dispatch. Status updates appear here automatically.
      </div>
    </div>
  );
}
