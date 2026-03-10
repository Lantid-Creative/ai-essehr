import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { Stethoscope, AlertTriangle, ClipboardList, Clock, Loader2 } from 'lucide-react';

export default function DoctorDashboard() {
  const { facilityId, user } = useAppContext();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['doctor-stats', facilityId, user?.id],
    queryFn: async () => {
      if (!facilityId || !user) return { todayConsults: 0, totalConsults: 0, pendingLabs: 0, alerts: 0 };
      const today = new Date().toISOString().split('T')[0];

      const [todayRes, totalRes, labRes, alertRes] = await Promise.all([
        supabase.from('encounters').select('id', { count: 'exact', head: true })
          .eq('clinician_id', user.id).gte('encounter_date', today),
        supabase.from('encounters').select('id', { count: 'exact', head: true })
          .eq('clinician_id', user.id),
        supabase.from('lab_results').select('id', { count: 'exact', head: true })
          .eq('facility_id', facilityId).is('result', null),
        supabase.from('surveillance_alerts').select('id', { count: 'exact', head: true })
          .eq('facility_id', facilityId).in('status', ['pending', 'investigating']),
      ]);

      return {
        todayConsults: todayRes.count || 0,
        totalConsults: totalRes.count || 0,
        pendingLabs: labRes.count || 0,
        alerts: alertRes.count || 0,
      };
    },
    enabled: !!facilityId && !!user,
  });

  const { data: recentEncounters = [] } = useQuery({
    queryKey: ['doctor-recent', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from('encounters')
        .select('id, encounter_date, chief_complaint, diagnosis, is_syndromic_alert, patient_id')
        .eq('clinician_id', user.id)
        .order('encounter_date', { ascending: false })
        .limit(8);
      if (!data || data.length === 0) return [];

      const patientIds = [...new Set(data.map(e => e.patient_id))];
      const { data: patients } = await supabase.from('patients').select('id, first_name, last_name').in('id', patientIds);
      const patientMap = Object.fromEntries((patients || []).map(p => [p.id, `${p.first_name} ${p.last_name}`]));
      return data.map(e => ({ ...e, patientName: patientMap[e.patient_id] || 'Unknown' }));
    },
    enabled: !!user,
  });

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-heading font-medium">Doctor's Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Today's Consults" value={stats?.todayConsults || 0} icon={<Clock className="h-5 w-5 text-primary" />} />
        <StatCard label="My Total Consults" value={stats?.totalConsults || 0} icon={<Stethoscope className="h-5 w-5 text-primary" />} />
        <StatCard label="Pending Lab Results" value={stats?.pendingLabs || 0} icon={<ClipboardList className="h-5 w-5 text-accent" />} />
        <StatCard label="Active Alerts" value={stats?.alerts || 0} icon={<AlertTriangle className="h-5 w-5 text-warning" />} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/consultation" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors">
          <Stethoscope className="h-4 w-4" /> New Consultation
        </Link>
        <Link to="/patients" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-secondary/90 transition-colors">
          <ClipboardList className="h-4 w-4" /> View Patients
        </Link>
      </div>

      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">My Recent Consultations</h2>
        {recentEncounters.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No consultations recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {recentEncounters.map((c: any) => (
              <div key={c.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {c.patientName.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.patientName}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.diagnosis || c.chief_complaint || 'No diagnosis'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">{new Date(c.encounter_date).toLocaleDateString()}</p>
                  {c.is_syndromic_alert && <span className="badge-warning mt-1 inline-block">⚠ Flagged</span>}
                </div>
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
