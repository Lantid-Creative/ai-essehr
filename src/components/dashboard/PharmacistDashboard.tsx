import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Pill, ClipboardList, Activity, Loader2 } from 'lucide-react';

export default function PharmacistDashboard() {
  const { facilityId } = useAppContext();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['pharma-stats', facilityId],
    queryFn: async () => {
      if (!facilityId) return { todayEncounters: 0, totalEncounters: 0 };
      const today = new Date().toISOString().split('T')[0];

      const [todayRes, totalRes] = await Promise.all([
        supabase.from('encounters').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId).gte('encounter_date', today),
        supabase.from('encounters').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
      ]);

      return {
        todayEncounters: todayRes.count || 0,
        totalEncounters: totalRes.count || 0,
      };
    },
    enabled: !!facilityId,
  });

  const { data: recentPrescriptions = [] } = useQuery({
    queryKey: ['pharma-recent', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('encounters')
        .select('id, encounter_date, prescriptions, patient_id')
        .eq('facility_id', facilityId)
        .not('prescriptions', 'eq', '[]')
        .order('encounter_date', { ascending: false })
        .limit(10);
      if (!data || data.length === 0) return [];

      const patientIds = [...new Set(data.map(e => e.patient_id))];
      const { data: patients } = await supabase.from('patients').select('id, first_name, last_name').in('id', patientIds);
      const patientMap = Object.fromEntries((patients || []).map(p => [p.id, `${p.first_name} ${p.last_name}`]));
      return data.map(e => ({
        ...e,
        patientName: patientMap[e.patient_id] || 'Unknown',
        rxCount: Array.isArray(e.prescriptions) ? (e.prescriptions as any[]).length : 0,
      }));
    },
    enabled: !!facilityId,
  });

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-heading font-medium">Pharmacy Dashboard</h1>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Today's Encounters" value={stats?.todayEncounters || 0} icon={<Activity className="h-5 w-5 text-primary" />} />
        <StatCard label="Total Encounters" value={stats?.totalEncounters || 0} icon={<ClipboardList className="h-5 w-5 text-accent" />} />
      </div>

      <Link to="/pharmacy" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors">
        <Pill className="h-4 w-4" /> Go to Pharmacy
      </Link>

      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Recent Prescriptions</h2>
        {recentPrescriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No prescriptions recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {recentPrescriptions.map((rx: any) => (
              <div key={rx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
                <div>
                  <p className="font-medium">{rx.patientName}</p>
                  <p className="text-xs text-muted-foreground">{rx.rxCount} medication(s)</p>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(rx.encounter_date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="stat-card flex items-center gap-3">
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-heading font-medium">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
