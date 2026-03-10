import { Link } from 'react-router-dom';
import { UserPlus, Stethoscope, Activity, AlertTriangle, Clock } from 'lucide-react';
import { patients, consultations, outbreakAlerts, syncStatus } from '@/data/mockData';

const todayPatients = 14;
const newRegistrations = 3;
const pendingConsultations = 5;

export default function FacilityDashboard() {
  const activeAlerts = outbreakAlerts.filter(a => a.status !== 'Resolved');
  const recentConsultations = consultations.slice(0, 5);

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-heading font-medium">Dashboard</h1>

      {/* Active Outbreak Banner */}
      {activeAlerts.length > 0 && (
        <div className="alert-banner-red flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="font-medium text-sm">
            {activeAlerts.length} Active Outbreak Alert{activeAlerts.length > 1 ? 's' : ''}: {activeAlerts.map(a => `${a.disease} (${a.riskLevel})`).join(', ')}
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Today's Patients" value={todayPatients} icon={<Activity className="h-5 w-5 text-primary" />} />
        <StatCard label="New Registrations" value={newRegistrations} icon={<UserPlus className="h-5 w-5 text-primary" />} />
        <StatCard label="Pending Consults" value={pendingConsultations} icon={<Stethoscope className="h-5 w-5 text-accent" />} />
        <StatCard label="Total Patients" value={patients.length} icon={<UserPlus className="h-5 w-5 text-muted-foreground" />} />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/patients?action=new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors">
          <UserPlus className="h-4 w-4" /> Register Patient
        </Link>
        <Link to="/consultation" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors">
          <Stethoscope className="h-4 w-4" /> New Consultation
        </Link>
        <Link to="/consultation" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground border border-border px-4 py-2 rounded text-sm font-medium hover:bg-muted transition-colors">
          <Activity className="h-4 w-4" /> Record Vitals
        </Link>
      </div>

      {/* Recent Activity & Sync */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">Recent Consultations</h2>
          <div className="space-y-2">
            {recentConsultations.map(c => (
              <div key={c.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {c.patientName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.patientName}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.provisionalDiagnosis}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">{c.date}</p>
                  {c.syndromicFlag && <span className="badge-warning mt-1 inline-block">⚠ Flagged</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">Sync Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last synced</span>
              <span className="font-medium flex items-center gap-1"><Clock className="h-3 w-3" /> {syncStatus.lastSynced}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Records synced</span>
              <span className="font-medium">{syncStatus.recordsSynced.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pending upload</span>
              <span className={`font-medium ${syncStatus.recordsPending > 0 ? 'text-accent' : ''}`}>
                {syncStatus.recordsPending}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Errors</span>
              <span className="font-medium">{syncStatus.errors}</span>
            </div>
          </div>
        </div>
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
