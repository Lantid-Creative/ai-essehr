import { useState } from 'react';
import { outbreakAlerts, consultations, weeklyDiseaseData } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, ArrowUpRight, CheckCircle, MessageSquare } from 'lucide-react';

export default function SurveillancePage() {
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  const flaggedCases = consultations.filter(c => c.syndromicFlag);

  const diseaseCounts = flaggedCases.reduce<Record<string, number>>((acc, c) => {
    const disease = c.syndromicFlag!.replace('Possible ', '');
    acc[disease] = (acc[disease] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-heading font-medium">Disease Surveillance & Outbreak Alerts</h1>

      {/* Active Alerts */}
      <div className="space-y-3">
        <h2 className="font-heading font-medium text-sm">Active Outbreak Alerts</h2>
        {outbreakAlerts.map(a => (
          <div key={a.id} className={`card-ehr p-4 border-l-4 ${
            a.riskLevel === 'Critical' ? 'border-l-destructive' : a.riskLevel === 'High' ? 'border-l-warning' : 'border-l-accent'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${a.riskLevel === 'Critical' ? 'text-destructive' : 'text-warning'}`} />
                  <span className="font-heading font-medium">{a.disease}</span>
                  <span className={a.riskLevel === 'Critical' ? 'badge-danger' : a.riskLevel === 'High' ? 'badge-warning' : 'badge-accent'}>
                    {a.riskLevel}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {a.lga}, {a.state} · {a.caseCount} cases · Triggered {a.dateTriggered}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Status: <strong>{a.status}</strong></p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="inline-flex items-center gap-1 bg-warning text-warning-foreground px-3 py-1.5 rounded text-xs font-medium hover:bg-warning/90">
                  <ArrowUpRight className="h-3 w-3" /> Escalate
                </button>
                <button className="inline-flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded text-xs font-medium hover:bg-primary/90">
                  <CheckCircle className="h-3 w-3" /> Mark Reviewed
                </button>
              </div>
            </div>
            {/* Notes */}
            <div className="mt-3 space-y-1">
              {a.notes.map((n, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-start gap-1"><MessageSquare className="h-3 w-3 mt-0.5 shrink-0" /> {n}</p>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input type="text" placeholder="Add investigation note..." value={noteInputs[a.id] || ''} onChange={e => setNoteInputs(prev => ({...prev, [a.id]: e.target.value}))}
                className="flex-1 px-3 py-1.5 border border-input rounded bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
              <button onClick={() => setNoteInputs(prev => ({...prev, [a.id]: ''}))} className="bg-secondary text-secondary-foreground border border-border px-3 py-1.5 rounded text-xs hover:bg-muted">Add Note</button>
            </div>
          </div>
        ))}
      </div>

      {/* Priority Disease Tracker */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">Priority Disease Case Counts</h2>
          <div className="space-y-2">
            {Object.entries(diseaseCounts).map(([disease, count]) => (
              <div key={disease} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                <span>{disease}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{count} cases</span>
                  <span className={count >= 5 ? 'badge-danger' : count >= 3 ? 'badge-warning' : 'badge-success'}>
                    {count >= 5 ? 'Above Threshold' : count >= 3 ? 'Approaching' : 'Normal'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">Weekly Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyDiseaseData}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="lassa" fill="hsl(4, 70%, 46%)" name="Lassa" />
              <Bar dataKey="cholera" fill="hsl(28, 80%, 52%)" name="Cholera" />
              <Bar dataKey="measles" fill="hsl(43, 80%, 46%)" name="Measles" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Syndromic Case Log */}
      <div className="card-ehr overflow-hidden">
        <h2 className="font-heading font-medium text-sm px-4 pt-4 pb-2">Syndromic Case Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left px-4 py-2 font-medium">Date</th>
                <th className="text-left px-4 py-2 font-medium">Patient</th>
                <th className="text-left px-4 py-2 font-medium">Flag</th>
                <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Symptoms</th>
                <th className="text-left px-4 py-2 font-medium">Disposition</th>
              </tr>
            </thead>
            <tbody>
              {flaggedCases.map(c => (
                <tr key={c.id} className="border-b border-border">
                  <td className="px-4 py-2">{c.date}</td>
                  <td className="px-4 py-2 font-medium">{c.patientName}</td>
                  <td className="px-4 py-2"><span className="badge-warning">{c.syndromicFlag}</span></td>
                  <td className="px-4 py-2 text-xs text-muted-foreground hidden md:table-cell">{c.symptoms.join(', ')}</td>
                  <td className="px-4 py-2">{c.disposition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
