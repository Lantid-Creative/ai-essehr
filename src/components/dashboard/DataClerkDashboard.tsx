import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { UserPlus, BarChart3, Wifi, ClipboardList, Loader2 } from 'lucide-react';

export default function DataClerkDashboard() {
  const { facilityId } = useAppContext();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['clerk-stats', facilityId],
    queryFn: async () => {
      if (!facilityId) return { patients: 0, encounters: 0, labs: 0 };

      const [pRes, eRes, lRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
        supabase.from('encounters').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
        supabase.from('lab_results').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
      ]);

      return {
        patients: pRes.count || 0,
        encounters: eRes.count || 0,
        labs: lRes.count || 0,
      };
    },
    enabled: !!facilityId,
  });

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-heading font-medium">Records & Data Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Patients" value={stats?.patients || 0} icon={<UserPlus className="h-5 w-5 text-primary" />} />
        <StatCard label="Total Encounters" value={stats?.encounters || 0} icon={<ClipboardList className="h-5 w-5 text-accent" />} />
        <StatCard label="Lab Records" value={stats?.labs || 0} icon={<BarChart3 className="h-5 w-5 text-primary" />} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/patients?action=new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors">
          <UserPlus className="h-4 w-4" /> Register Patient
        </Link>
        <Link to="/reports" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-secondary/90 transition-colors">
          <BarChart3 className="h-4 w-4" /> Reports
        </Link>
        <Link to="/sync" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-secondary/90 transition-colors">
          <Wifi className="h-4 w-4" /> Sync Status
        </Link>
      </div>

      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Data Management</h2>
        <p className="text-sm text-muted-foreground">Register patients, manage records, generate reports, and monitor data synchronization status.</p>
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
