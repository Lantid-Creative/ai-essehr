import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { FlaskConical, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function LabTechDashboard() {
  const { facilityId } = useAppContext();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['labtech-stats', facilityId],
    queryFn: async () => {
      if (!facilityId) return { pending: 0, completed: 0, abnormal: 0, todayOrders: 0 };
      const today = new Date().toISOString().split('T')[0];
      const [pendRes, compRes, abnRes, todayRes] = await Promise.all([
        supabase.from('lab_results').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId).is('result', null),
        supabase.from('lab_results').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId).not('result', 'is', null),
        supabase.from('lab_results').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId).eq('is_abnormal', true),
        supabase.from('lab_results').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId).gte('ordered_at', today),
      ]);
      return { pending: pendRes.count || 0, completed: compRes.count || 0, abnormal: abnRes.count || 0, todayOrders: todayRes.count || 0 };
    },
    enabled: !!facilityId,
  });

  const { data: pendingTests = [] } = useQuery({
    queryKey: ['labtech-pending', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('lab_results')
        .select('id, test_name, test_category, ordered_at, patient_id')
        .eq('facility_id', facilityId).is('result', null)
        .order('ordered_at', { ascending: true }).limit(10);
      if (!data || data.length === 0) return [];
      const patientIds = [...new Set(data.map(e => e.patient_id))];
      const { data: patients } = await supabase.from('patients').select('id, first_name, last_name').in('id', patientIds);
      const map = Object.fromEntries((patients || []).map(p => [p.id, `${p.first_name} ${p.last_name}`]));
      return data.map(e => ({ ...e, patientName: map[e.patient_id] || 'Unknown' }));
    },
    enabled: !!facilityId,
  });

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-heading font-medium">Lab Technician Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pending Tests" value={stats?.pending || 0} icon={<Clock className="h-5 w-5 text-warning" />} />
        <StatCard label="Completed" value={stats?.completed || 0} icon={<CheckCircle className="h-5 w-5 text-success" />} />
        <StatCard label="Abnormal Results" value={stats?.abnormal || 0} icon={<AlertTriangle className="h-5 w-5 text-destructive" />} />
        <StatCard label="Today's Orders" value={stats?.todayOrders || 0} icon={<FlaskConical className="h-5 w-5 text-accent" />} />
      </div>

      <Link to="/laboratory" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors">
        <FlaskConical className="h-4 w-4" /> Go to Lab Queue
      </Link>

      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3 text-warning">Pending Test Queue</h2>
        {pendingTests.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No pending tests. Tests are ordered from consultations.</p>
        ) : (
          <div className="space-y-2">
            {pendingTests.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
                <div>
                  <p className="font-medium">{t.patientName}</p>
                  <p className="text-xs text-muted-foreground">{t.test_name} · {t.test_category || 'General'}</p>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(t.ordered_at).toLocaleDateString()}</p>
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
