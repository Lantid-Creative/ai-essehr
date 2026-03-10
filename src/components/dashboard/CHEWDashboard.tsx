import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Users, Syringe, AlertTriangle, Home, Loader2 } from 'lucide-react';

export default function CHEWDashboard() {
  const { facilityId } = useAppContext();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['chew-stats', facilityId],
    queryFn: async () => {
      if (!facilityId) return { patients: 0, immunizations: 0, alerts: 0, ancVisits: 0 };
      const [pRes, iRes, aRes, ancRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
        supabase.from('immunizations').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
        supabase.from('surveillance_alerts').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId).in('status', ['pending', 'investigating']),
        supabase.from('encounters').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId).eq('encounter_type', 'anc'),
      ]);
      return { patients: pRes.count || 0, immunizations: iRes.count || 0, alerts: aRes.count || 0, ancVisits: ancRes.count || 0 };
    },
    enabled: !!facilityId,
  });

  const { data: recentPatients = [] } = useQuery({
    queryKey: ['chew-recent-patients', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('patients').select('id, first_name, last_name, patient_code, created_at')
        .eq('facility_id', facilityId).order('created_at', { ascending: false }).limit(5);
      return data || [];
    },
    enabled: !!facilityId,
  });

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-heading font-medium">CHEW Dashboard</h1>
      <p className="text-sm text-muted-foreground -mt-4">Community Health Extension Worker — Community outreach & primary care</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Community Patients" value={stats?.patients || 0} icon={<Users className="h-5 w-5 text-primary" />} />
        <StatCard label="Immunizations" value={stats?.immunizations || 0} icon={<Syringe className="h-5 w-5 text-primary" />} />
        <StatCard label="ANC Visits" value={stats?.ancVisits || 0} icon={<Home className="h-5 w-5 text-accent" />} />
        <StatCard label="Active Alerts" value={stats?.alerts || 0} icon={<AlertTriangle className="h-5 w-5 text-warning" />} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/patients" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors">
          <Users className="h-4 w-4" /> Register Patient
        </Link>
        <Link to="/immunization" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-secondary/90 transition-colors">
          <Syringe className="h-4 w-4" /> Immunization
        </Link>
        <Link to="/mch" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-secondary/90 transition-colors">
          <Home className="h-4 w-4" /> MCH
        </Link>
        <Link to="/surveillance" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-secondary/90 transition-colors">
          <AlertTriangle className="h-4 w-4" /> Surveillance
        </Link>
      </div>

      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Recently Registered Patients</h2>
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
                  <p className="text-xs text-muted-foreground">{p.patient_code}</p>
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
