import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Heart, Syringe, UserPlus, BedDouble, Loader2 } from 'lucide-react';

export default function NurseDashboard() {
  const { facilityId } = useAppContext();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['nurse-stats', facilityId],
    queryFn: async () => {
      if (!facilityId) return { patients: 0, todayEncounters: 0, immunizations: 0 };
      const today = new Date().toISOString().split('T')[0];

      const [pRes, eRes, iRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
        supabase.from('encounters').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId).gte('encounter_date', today),
        supabase.from('immunizations').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
      ]);

      return {
        patients: pRes.count || 0,
        todayEncounters: eRes.count || 0,
        immunizations: iRes.count || 0,
      };
    },
    enabled: !!facilityId,
  });

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-heading font-medium">Nursing Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Patients" value={stats?.patients || 0} icon={<Heart className="h-5 w-5 text-primary" />} />
        <StatCard label="Today's Visits" value={stats?.todayEncounters || 0} icon={<BedDouble className="h-5 w-5 text-accent" />} />
        <StatCard label="Immunizations Given" value={stats?.immunizations || 0} icon={<Syringe className="h-5 w-5 text-primary" />} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/patients?action=new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors">
          <UserPlus className="h-4 w-4" /> Register Patient
        </Link>
        <Link to="/immunization" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-secondary/90 transition-colors">
          <Syringe className="h-4 w-4" /> Immunization
        </Link>
        <Link to="/wards" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-secondary/90 transition-colors">
          <BedDouble className="h-4 w-4" /> Wards
        </Link>
      </div>

      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Quick Actions</h2>
        <p className="text-sm text-muted-foreground">Record vital signs, administer immunizations, and manage patient intake from the navigation menu.</p>
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
