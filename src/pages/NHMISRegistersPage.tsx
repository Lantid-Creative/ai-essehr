import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { ClipboardList, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type RegisterType = 'family_planning' | 'post_natal' | 'tb_leprosy' | 'hiv' | 'malaria' | 'nutrition_gmp';

const REGISTERS: { key: RegisterType; label: string; columns: { name: string; type?: string; placeholder?: string }[] }[] = [
  { key: 'family_planning', label: 'Family Planning', columns: [
    { name: 'client_name' }, { name: 'age', type: 'number' }, { name: 'parity', type: 'number' },
    { name: 'method', placeholder: 'IUCD / Implant / Pill / Condom / Injectable' },
    { name: 'new_or_revisit', placeholder: 'New / Revisit' }, { name: 'side_effects' },
  ]},
  { key: 'post_natal', label: 'Post Natal Care (PNC)', columns: [
    { name: 'mother_name' }, { name: 'visit_number', type: 'number', placeholder: 'PNC1/2/3' },
    { name: 'days_postpartum', type: 'number' }, { name: 'bp' }, { name: 'breast_exam_normal', placeholder: 'Y/N' },
    { name: 'baby_feeding', placeholder: 'EBF / Mixed' }, { name: 'fp_counselled', placeholder: 'Y/N' },
  ]},
  { key: 'tb_leprosy', label: 'TB / Leprosy (TBL)', columns: [
    { name: 'patient_name' }, { name: 'tb_no', placeholder: 'TB Reg #' }, { name: 'classification', placeholder: 'PTB+ / PTB- / EPTB / Leprosy' },
    { name: 'sputum_baseline' }, { name: 'regimen', placeholder: 'CAT I / CAT II' }, { name: 'dot_supporter' },
  ]},
  { key: 'hiv', label: 'HIV / ART', columns: [
    { name: 'patient_name' }, { name: 'art_no' }, { name: 'who_stage', placeholder: 'I/II/III/IV' },
    { name: 'cd4_or_vl' }, { name: 'regimen', placeholder: 'TDF/3TC/DTG' }, { name: 'adherence', placeholder: 'Good / Fair / Poor' },
  ]},
  { key: 'malaria', label: 'Malaria', columns: [
    { name: 'patient_name' }, { name: 'age', type: 'number' }, { name: 'rdt_result', placeholder: '+ / -' },
    { name: 'severity', placeholder: 'Uncomplicated / Severe' }, { name: 'act_given', placeholder: 'Y/N' }, { name: 'referred', placeholder: 'Y/N' },
  ]},
  { key: 'nutrition_gmp', label: 'Nutrition (GMP) <5', columns: [
    { name: 'child_name' }, { name: 'age_months', type: 'number' }, { name: 'weight_kg', type: 'number' },
    { name: 'height_cm', type: 'number' }, { name: 'muac_mm', type: 'number' },
    { name: 'classification', placeholder: 'Normal / MAM / SAM' }, { name: 'rutf_given', placeholder: 'Y/N' },
  ]},
];

export default function NHMISRegistersPage() {
  const { facilityId, user } = useAppContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [active, setActive] = useState<RegisterType>('family_planning');
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Record<string, string>>({});

  const config = REGISTERS.find(r => r.key === active)!;

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['nhmis', active, facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('nhmis_register_entries')
        .select('*').eq('facility_id', facilityId).eq('register_type', active)
        .order('visit_date', { ascending: false }).limit(200);
      return data || [];
    },
    enabled: !!facilityId,
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('nhmis_register_entries').insert({
        facility_id: facilityId!,
        register_type: active,
        visit_date: new Date().toISOString().slice(0, 10),
        data,
        recorded_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Entry recorded', description: `${config.label} register updated.` });
      qc.invalidateQueries({ queryKey: ['nhmis', active] });
      setOpen(false);
      setData({});
    },
    onError: (e: any) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" /> NHMIS Registers
        </h1>
        <p className="text-sm text-muted-foreground">Register-exact data entry for FP, PNC, TBL, HIV, Malaria and Nutrition. Feeds the monthly NHMIS 001 summary.</p>
      </div>

      <Tabs value={active} onValueChange={v => setActive(v as RegisterType)}>
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 h-auto">
          {REGISTERS.map(r => <TabsTrigger key={r.key} value={r.key} className="text-xs">{r.label}</TabsTrigger>)}
        </TabsList>

        {REGISTERS.map(r => (
          <TabsContent key={r.key} value={r.key} className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={open && active === r.key} onOpenChange={setOpen}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New {r.label} Entry</Button></DialogTrigger>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{r.label} — New Entry</DialogTitle></DialogHeader>
                  <div className="grid grid-cols-2 gap-3">
                    {config.columns.map(col => (
                      <div key={col.name} className={col.type === undefined ? '' : ''}>
                        <Label className="capitalize">{col.name.replace(/_/g, ' ')}</Label>
                        <Input
                          type={col.type || 'text'}
                          placeholder={col.placeholder}
                          value={data[col.name] || ''}
                          onChange={e => setData({ ...data, [col.name]: e.target.value })}
                        />
                      </div>
                    ))}
                    <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={data.notes || ''} onChange={e => setData({ ...data, notes: e.target.value })} /></div>
                  </div>
                  <Button onClick={() => create.mutate()} disabled={create.isPending}>
                    {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Entry
                  </Button>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-card rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-2 text-xs">Date</th>
                    {config.columns.map(c => <th key={c.name} className="text-left p-2 text-xs capitalize">{c.name.replace(/_/g, ' ')}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {isLoading && <tr><td colSpan={config.columns.length + 1} className="p-6 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>}
                  {!isLoading && rows.length === 0 && <tr><td colSpan={config.columns.length + 1} className="p-6 text-center text-muted-foreground">No entries yet.</td></tr>}
                  {rows.map(row => (
                    <tr key={row.id} className="border-t">
                      <td className="p-2">{row.visit_date}</td>
                      {config.columns.map(c => <td key={c.name} className="p-2">{(row.data as any)?.[c.name] ?? '—'}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
