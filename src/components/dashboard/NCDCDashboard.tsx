import { stateOutbreakData, weeklyDiseaseData, outbreakAlerts } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const allStates = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara',
  'Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau',
  'Rivers','Sokoto','Taraba','Yobe','Zamfara'
];

export default function NCDCDashboard() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-medium">NCDC National Overview</h1>
        <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90">
          Export IDSR Weekly Report
        </button>
      </div>

      {/* National alert feed */}
      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Real-time Alert Feed</h2>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {outbreakAlerts.map(a => (
            <div key={a.id} className={`flex items-center justify-between px-3 py-2 rounded text-sm ${
              a.riskLevel === 'Critical' ? 'bg-destructive/10' : a.riskLevel === 'High' ? 'bg-warning/10' : 'bg-accent/10'
            }`}>
              <span className="font-medium">{a.disease} — {a.lga}, {a.state}</span>
              <div className="flex items-center gap-2">
                <span>{a.caseCount} cases</span>
                <span className={a.riskLevel === 'Critical' ? 'badge-danger' : a.riskLevel === 'High' ? 'badge-warning' : 'badge-accent'}>
                  {a.riskLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* State cards grid + trend chart */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">Outbreak Risk by State</h2>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {allStates.map(state => {
              const data = stateOutbreakData.find(s => s.state === state);
              const risk = data?.riskScore || 'Low';
              return (
                <div key={state} className="flex items-center justify-between text-xs py-1.5 px-2 hover:bg-muted/50 rounded">
                  <span>{state}</span>
                  <span className={risk === 'High' ? 'badge-danger' : risk === 'Medium' ? 'badge-warning' : 'badge-success'}>{risk}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 card-ehr p-4">
          <h2 className="font-heading font-medium text-sm mb-3">National Case Trends — Last 12 Weeks</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyDiseaseData}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="lassa" stroke="hsl(4, 70%, 46%)" strokeWidth={2} name="Lassa" />
              <Line type="monotone" dataKey="cholera" stroke="hsl(28, 80%, 52%)" strokeWidth={2} name="Cholera" />
              <Line type="monotone" dataKey="measles" stroke="hsl(43, 80%, 46%)" strokeWidth={2} name="Measles" />
              <Line type="monotone" dataKey="meningitis" stroke="hsl(153, 100%, 26.5%)" strokeWidth={2} name="Meningitis" />
              <Line type="monotone" dataKey="diphtheria" stroke="hsl(0, 0%, 40%)" strokeWidth={2} name="Diphtheria" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
