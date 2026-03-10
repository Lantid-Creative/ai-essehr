import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';
import { UserPlus, Stethoscope, Activity, AlertTriangle, Loader2 } from 'lucide-react';

export default function FacilityDashboard() {
  const { facilityId } = useAppContext();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', facilityId],
    queryFn: async () => {
      if (!facilityId) return { patients: 0, encounters: 0, alerts: 0, todayEncounters: 0 };
      const today = new Date().toISOString().split('T')[0];

      const [pRes, eRes, aRes, tRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
        supabase.from('encounters').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId),
        supabase.from('surveillance_alerts').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId).in('status', ['pending', 'investigating']),
        supabase.from('encounters').select('id', { count: 'exact', head: true }).eq('facility_id', facilityId).gte('encounter_date', today),
      ]);

      return {
        patients: pRes.count || 0,
        encounters: eRes.count || 0,
        alerts: aRes.count || 0,
        todayEncounters: tRes.count || 0,
      };
    },
    enabled: !!facilityId,
  });

  const { data: recentEncounters = [] } = useQuery({
    queryKey: ['recent-encounters', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('encounters')
        .select('id, encounter_date, chief_complaint, diagnosis, is_syndromic_alert, patient_id')
        .eq('facility_id', facilityId)
        .order('encounter_date', { ascending: false })
        .limit(5);
      if (!data || data.length === 0) return [];

      // Fetch patient names
      const patientIds = [...new Set(data.map(e => e.patient_id))];
      const { data: patients } = await supabase.from('patients').select('id, first_name, last_name').in('id', patientIds);
      const patientMap = Object.fromEntries((patients || []).map(p => [p.id, `${p.first_name} ${p.last_name}`]));

      return data.map(e => ({ ...e, patientName: patientMap[e.patient_id] || 'Unknown' }));
    },
    enabled: !!facilityId,
  });

  const { data: activeAlerts = [] } = useQuery({
    queryKey: ['dashboard-alerts', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];
      const { data } = await supabase.from('surveillance_alerts')
        .select('id, disease_name, severity')
        .eq('facility_id', facilityId)
        .in('status', ['pending', 'investigating'])
        .limit(5);
      return data || [];
    },
    enabled: !!facilityId,
  });

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-heading font-medium">Dashboard</h1>

      {activeAlerts.length > 0 && (
        <div className="alert-banner-red flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="font-medium text-sm">
            {activeAlerts.length} Active Alert{activeAlerts.length > 1 ? 's' : ''}: {activeAlerts.map(a => `${a.disease_name} (${a.severity})`).join(', ')}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Today's Consultations" value={stats?.todayEncounters || 0} icon={<Activity className="h-5 w-5 text-primary" />} />
        <StatCard label="Total Patients" value={stats?.patients || 0} icon={<UserPlus className="h-5 w-5 text-primary" />} />
        <StatCard label="Total Encounters" value={stats?.encounters || 0} icon={<Stethoscope className="h-5 w-5 text-accent" />} />
        <StatCard label="Active Alerts" value={stats?.alerts || 0} icon={<AlertTriangle className="h-5 w-5 text-warning" />} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/patients?action=new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors">
          <UserPlus className="h-4 w-4" /> Register Patient
        </Link>
        <Link to="/consultation" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors">
          <Stethoscope className="h-4 w-4" /> New Consultation
        </Link>
      </div>

      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Recent Consultations</h2>
        {recentEncounters.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No consultations yet. Start by registering a patient and recording a consultation.</p>
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
