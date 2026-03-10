import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Heart, Syringe, UserPlus, Baby, Shield, Loader2 } from 'lucide-react';

export default function CHEWDashboard() {
  const { facilityId } = useAppContext();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['chew-stats', facilityId],
    queryFn: async () => {
      if (!facilityId) return { patients: 0, immunizations: 0, alerts: 0 };

      const [pRes, iRes, aRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
        supabase.from('immunizations').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
        supabase.from('surveillance_alerts').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId).in('status', ['pending', 'investigating']),
      ]);

      return {
        patients: pRes.count || 0,
        immunizations: iRes.count || 0,
        alerts: aRes.count || 0,
      };
    },
    enabled: !!facilityId,
  });

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-heading font-medium">Community Health Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Registered Patients" value={stats?.patients || 0} icon={<Heart className="h-5 w-5 text-primary" />} />
        <StatCard label="Immunizations" value={stats?.immunizations || 0} icon={<Syringe className="h-5 w-5 text-primary" />} />
        <StatCard label="Active Alerts" value={stats?.alerts || 0} icon={<Shield className="h-5 w-5 text-warning" />} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/patients?action=new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors">
          <UserPlus className="h-4 w-4" /> Register Patient
        </Link>
        <Link to="/immunization" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-secondary/90 transition-colors">
          <Syringe className="h-4 w-4" /> Immunization
        </Link>
        <Link to="/mch" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-secondary/90 transition-colors">
          <Baby className="h-4 w-4" /> MCH
        </Link>
        <Link to="/surveillance" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-secondary/90 transition-colors">
          <Shield className="h-4 w-4" /> Surveillance
        </Link>
      </div>

      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Community Outreach</h2>
        <p className="text-sm text-muted-foreground">Register patients, record immunizations, track maternal & child health, and report disease surveillance from the field.</p>
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
