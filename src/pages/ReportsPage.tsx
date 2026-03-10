import { weeklyDiseaseData, consultations, patients } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const totalConsults = consultations.length;
  const flaggedCount = consultations.filter(c => c.syndromicFlag).length;
  const completenessRate = 92;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-medium">Reports & Analytics</h1>
        <div className="flex gap-2">
          <button className="bg-secondary text-secondary-foreground border border-border px-3 py-2 rounded text-sm hover:bg-muted">Export CSV</button>
          <button className="bg-secondary text-secondary-foreground border border-border px-3 py-2 rounded text-sm hover:bg-muted">Export PDF</button>
          <button className="bg-primary text-primary-foreground px-3 py-2 rounded text-sm font-medium hover:bg-primary/90">IDSR Export</button>
        </div>
      </div>

      {/* Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><p className="text-2xl font-heading font-medium">{totalConsults}</p><p className="text-xs text-muted-foreground">Total Consultations</p></div>
        <div className="stat-card"><p className="text-2xl font-heading font-medium">{patients.length}</p><p className="text-xs text-muted-foreground">Registered Patients</p></div>
        <div className="stat-card"><p className="text-2xl font-heading font-medium text-accent">{flaggedCount}</p><p className="text-xs text-muted-foreground">Syndromic Flags</p></div>
        <div className="stat-card"><p className="text-2xl font-heading font-medium text-success">{completenessRate}%</p><p className="text-xs text-muted-foreground">Completeness Rate</p></div>
      </div>

      {/* Consultation Trend */}
      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Weekly Disease Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={weeklyDiseaseData}>
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="lassa" stroke="hsl(4, 70%, 46%)" strokeWidth={2} name="Lassa" />
            <Line type="monotone" dataKey="cholera" stroke="hsl(28, 80%, 52%)" strokeWidth={2} name="Cholera" />
            <Line type="monotone" dataKey="measles" stroke="hsl(43, 80%, 46%)" strokeWidth={2} name="Measles" />
            <Line type="monotone" dataKey="meningitis" stroke="hsl(153, 100%, 26.5%)" strokeWidth={2} name="Meningitis" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Report Links */}
      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Available Reports</h2>
        <div className="space-y-2">
          {['Daily Summary Report', 'Weekly HMIS 035B Report', 'Monthly Facility Report', 'Outbreak Situation Report (Lassa Fever)', 'Outbreak Situation Report (Cholera)', 'Disease-Specific: Measles Report', 'Facility Performance Scorecard'].map(r => (
            <div key={r} className="flex items-center justify-between border border-border rounded p-3 text-sm hover:bg-muted/30">
              <span>{r}</span>
              <button className="text-primary text-xs hover:underline">Generate</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
