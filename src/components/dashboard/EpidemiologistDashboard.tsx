import { outbreakAlerts, weeklyDiseaseData, stateOutbreakData } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function EpidemiologistDashboard() {
  const activeAlerts = outbreakAlerts.filter(a => a.status !== 'Resolved');

  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="text-2xl font-heading font-medium">State Epidemiologist Dashboard — Kano State</h1>

      {/* Alert Feed */}
      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Active Alerts</h2>
        <div className="space-y-2">
          {activeAlerts.map(a => (
            <div key={a.id} className={`flex items-center justify-between px-3 py-2 rounded text-sm ${
              a.riskLevel === 'Critical' ? 'bg-destructive/10 text-destructive' :
              a.riskLevel === 'High' ? 'bg-warning/10 text-warning' :
              'bg-accent/10 text-accent'
            }`}>
              <span className="font-medium">{a.disease} — {a.lga}</span>
              <span>{a.caseCount} cases · {a.riskLevel}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top LGAs & Disease Chart */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">Top LGAs by Case Count (This Week)</h2>
          <div className="space-y-2">
            {stateOutbreakData.slice(0, 5).map(s => (
              <div key={s.state} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                <span>{s.state}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{s.activeCases}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.riskScore === 'High' ? 'badge-danger' : s.riskScore === 'Medium' ? 'badge-warning' : 'badge-success'
                  }`}>{s.riskScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">Disease Breakdown by Week</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyDiseaseData}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="lassa" fill="hsl(4, 70%, 46%)" name="Lassa" />
              <Bar dataKey="cholera" fill="hsl(28, 80%, 52%)" name="Cholera" />
              <Bar dataKey="measles" fill="hsl(43, 80%, 46%)" name="Measles" />
              <Bar dataKey="meningitis" fill="hsl(153, 100%, 26.5%)" name="Meningitis" />
              <Bar dataKey="diphtheria" fill="hsl(0, 0%, 40%)" name="Diphtheria" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
