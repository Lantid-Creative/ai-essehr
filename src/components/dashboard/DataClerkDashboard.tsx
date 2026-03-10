import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { ClipboardList, UserPlus, BarChart3, Activity, Loader2 } from 'lucide-react';

export default function DataClerkDashboard() {
  const { facilityId } = useAppContext();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['clerk-stats', facilityId],
    queryFn: async () => {
      if (!facilityId) return { patients: 0, encounters: 0, labs: 0, immunizations: 0 };
      const [pRes, eRes, lRes, iRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
        supabase.from('encounters').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
        supabase.from('lab_results').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
        supabase.from('immunizations').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
      ]);
      return { patients: pRes.count || 0, encounters: eRes.count || 0, labs: lRes.count || 0, immunizations: iRes.count || 0 };
    },
    enabled: !!facilityId,
  });

  const { data: recentPatients = [] } = useQuery({
    queryKey: ['clerk-recent', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('patients').select('id, first_name, last_name, patient_code, created_at, gender')
        .eq('facility_id', facilityId).order('created_at', { ascending: false }).limit(8);
      return data || [];
    },
    enabled: !!facilityId,
  });

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-heading font-medium">Data Clerk Dashboard</h1>
      <p className="text-sm text-muted-foreground -mt-4">Data entry, patient registration, and records management</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Patients" value={stats?.patients || 0} icon={<UserPlus className="h-5 w-5 text-primary" />} />
        <StatCard label="Encounters" value={stats?.encounters || 0} icon={<Activity className="h-5 w-5 text-accent" />} />
        <StatCard label="Lab Tests" value={stats?.labs || 0} icon={<ClipboardList className="h-5 w-5 text-primary" />} />
        <StatCard label="Immunizations" value={stats?.immunizations || 0} icon={<BarChart3 className="h-5 w-5 text-accent" />} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/patients" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors">
          <UserPlus className="h-4 w-4" /> Register Patient
        </Link>
        <Link to="/reports" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-secondary/90 transition-colors">
          <BarChart3 className="h-4 w-4" /> View Reports
        </Link>
      </div>

      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Recent Patient Registrations</h2>
        {recentPatients.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No patients registered yet.</p>
        ) : (
          <div className="space-y-2">
            {recentPatients.map(p => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {p.first_name[0]}{p.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.first_name} {p.last_name}</p>
                  <p className="text-xs text-muted-foreground">{p.patient_code} · {p.gender}</p>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
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
