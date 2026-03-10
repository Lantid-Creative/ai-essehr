import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Loader2, Pill, CheckCircle, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PharmacyPage() {
  const { facilityId, user } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allEncounters = [], isLoading } = useQuery({
    queryKey: ['pharmacy-all', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('encounters')
        .select('id, encounter_date, prescriptions, diagnosis, patient_id, dispensed_at, dispensed_by')
        .eq('facility_id', facilityId)
        .order('encounter_date', { ascending: false })
        .limit(100);
      if (!data) return [];

      const withRx = data.filter(e => Array.isArray(e.prescriptions) && (e.prescriptions as any[]).length > 0);
      if (withRx.length === 0) return [];

      const patientIds = [...new Set(withRx.map(e => e.patient_id))];
      const { data: patients } = await supabase.from('patients').select('id, first_name, last_name').in('id', patientIds);
      const patientMap = Object.fromEntries((patients || []).map(p => [p.id, `${p.first_name} ${p.last_name}`]));

      return withRx.map(e => ({
        ...e,
        patientName: patientMap[e.patient_id] || 'Unknown',
        meds: e.prescriptions as any[],
        dispensed: !!e.dispensed_at,
      }));
    },
    enabled: !!facilityId,
  });

  const dispenseMutation = useMutation({
    mutationFn: async (encounterId: string) => {
      const { error } = await supabase.from('encounters').update({
        dispensed_at: new Date().toISOString(),
        dispensed_by: user?.id,
      } as any).eq('id', encounterId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Prescription dispensed' });
      queryClient.invalidateQueries({ queryKey: ['pharmacy-all'] });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const pending = allEncounters.filter((e: any) => !e.dispensed);
  const dispensed = allEncounters.filter((e: any) => e.dispensed);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Pharmacy & Dispensing</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="stat-card flex items-center gap-3">
          <Clock className="h-5 w-5 text-warning shrink-0" />
          <div>
            <p className="text-2xl font-heading font-medium">{pending.length}</p>
            <p className="text-xs text-muted-foreground">Pending Dispensing</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-success shrink-0" />
          <div>
            <p className="text-2xl font-heading font-medium">{dispensed.length}</p>
            <p className="text-xs text-muted-foreground">Dispensed</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <Package className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-2xl font-heading font-medium">{allEncounters.reduce((s: number, e: any) => s + e.meds.length, 0)}</p>
            <p className="text-xs text-muted-foreground">Total Drug Items</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : allEncounters.length === 0 ? (
        <div className="card-ehr p-8 text-center text-muted-foreground text-sm">
          No prescriptions yet. Prescriptions are created during consultations.
        </div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending" className="gap-1">
              <Clock className="h-3 w-3" /> Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="dispensed" className="gap-1">
              <CheckCircle className="h-3 w-3" /> Dispensed ({dispensed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {pending.length === 0 ? (
              <div className="card-ehr p-6 text-center text-muted-foreground text-sm">All prescriptions have been dispensed.</div>
            ) : (
              pending.map((rx: any) => (
                <PrescriptionCard key={rx.id} rx={rx} onDispense={() => dispenseMutation.mutate(rx.id)} isPending={dispenseMutation.isPending} showDispense />
              ))
            )}
          </TabsContent>

          <TabsContent value="dispensed" className="space-y-4 mt-4">
            {dispensed.length === 0 ? (
              <div className="card-ehr p-6 text-center text-muted-foreground text-sm">No dispensed prescriptions.</div>
            ) : (
              dispensed.map((rx: any) => (
                <PrescriptionCard key={rx.id} rx={rx} showDispense={false} />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function PrescriptionCard({ rx, onDispense, isPending, showDispense }: { rx: any; onDispense?: () => void; isPending?: boolean; showDispense: boolean }) {
  return (
    <div className="card-ehr p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-heading font-medium">{rx.patientName}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(rx.encounter_date).toLocaleDateString()} · Dx: {rx.diagnosis || 'N/A'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showDispense && onDispense && (
            <Button size="sm" onClick={onDispense} disabled={isPending} className="gap-1">
              <CheckCircle className="h-3 w-3" /> Dispense
            </Button>
          )}
          {!showDispense && <span className="badge-success">Dispensed</span>}
          <Pill className="h-5 w-5 text-primary shrink-0" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-1 pr-4 text-xs font-medium text-muted-foreground">Drug</th>
              <th className="text-left py-1 pr-4 text-xs font-medium text-muted-foreground">Dose</th>
              <th className="text-left py-1 pr-4 text-xs font-medium text-muted-foreground">Frequency</th>
              <th className="text-left py-1 text-xs font-medium text-muted-foreground">Duration</th>
            </tr>
          </thead>
          <tbody>
            {rx.meds.map((m: any, i: number) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="py-1.5 pr-4 font-medium">{m.drug}</td>
                <td className="py-1.5 pr-4">{m.dose}</td>
                <td className="py-1.5 pr-4">{m.frequency}</td>
                <td className="py-1.5">{m.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
