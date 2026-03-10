import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Loader2, Pill, CheckCircle } from 'lucide-react';

export default function PharmacyPage() {
  const { facilityId } = useAppContext();

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['pharmacy-prescriptions', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('encounters')
        .select('id, encounter_date, prescriptions, diagnosis, patient_id, treatment_plan')
        .eq('facility_id', facilityId)
        .order('encounter_date', { ascending: false })
        .limit(50);
      if (!data) return [];

      // Filter encounters that have prescriptions
      const withRx = data.filter(e => Array.isArray(e.prescriptions) && (e.prescriptions as any[]).length > 0);
      if (withRx.length === 0) return [];

      const patientIds = [...new Set(withRx.map(e => e.patient_id))];
      const { data: patients } = await supabase.from('patients').select('id, first_name, last_name').in('id', patientIds);
      const patientMap = Object.fromEntries((patients || []).map(p => [p.id, `${p.first_name} ${p.last_name}`]));

      return withRx.map(e => ({
        ...e,
        patientName: patientMap[e.patient_id] || 'Unknown',
        meds: e.prescriptions as any[],
      }));
    },
    enabled: !!facilityId,
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Pharmacy & Dispensing</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : prescriptions.length === 0 ? (
        <div className="card-ehr p-8 text-center text-muted-foreground text-sm">
          No prescriptions yet. Prescriptions are created during consultations.
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx: any) => (
            <div key={rx.id} className="card-ehr p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-heading font-medium">{rx.patientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(rx.encounter_date).toLocaleDateString()} · Dx: {rx.diagnosis || 'N/A'}
                  </p>
                </div>
                <Pill className="h-5 w-5 text-primary shrink-0" />
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
          ))}
        </div>
      )}
    </div>
  );
}