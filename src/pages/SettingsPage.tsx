import { useState } from 'react';

export default function SettingsPage() {
  const [facility] = useState({
    name: 'Tudun Wada PHC',
    type: 'Primary Health Centre',
    lga: 'Kano Municipal',
    state: 'Kano',
    lat: '12.0022',
    lng: '8.5920',
    ownership: 'Public',
    hours: '08:00 - 16:00',
  });

  const thresholds = [
    { disease: 'Lassa Fever', current: 3 },
    { disease: 'Cholera', current: 5 },
    { disease: 'Meningitis', current: 5 },
    { disease: 'Measles', current: 10 },
    { disease: 'Diphtheria', current: 3 },
  ];

  const auditLog = [
    { time: '2026-03-10 09:15', user: 'Amina Bello', action: 'Created consultation for Abubakar Sani' },
    { time: '2026-03-10 08:45', user: 'Dr. Emeka Okafor', action: 'Updated patient record: Blessing Okonkwo' },
    { time: '2026-03-10 08:30', user: 'Ibrahim Musa', action: 'Registered new patient: Zubaida Malam' },
    { time: '2026-03-09 16:20', user: 'Fatima Usman', action: 'Administered vaccine: Measles to Chidinma Eze' },
    { time: '2026-03-09 15:00', user: 'Ngozi Adeyemi', action: 'Updated facility alert thresholds' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-heading font-medium">Facility Settings</h1>

      {/* Facility Profile */}
      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Facility Profile</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {Object.entries(facility).map(([key, val]) => (
            <div key={key}>
              <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="font-medium">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="card-ehr p-4">
        <h2 className="font-heading font-medium text-sm mb-3">Alert Thresholds (per disease, per week)</h2>
        <div className="space-y-2">
          {thresholds.map(t => (
            <div key={t.disease} className="flex items-center justify-between border border-border rounded p-3 text-sm">
              <span>{t.disease}</span>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue={t.current} min={1} className="w-16 px-2 py-1 border border-input rounded bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring" />
                <span className="text-xs text-muted-foreground">cases</span>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-3 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:bg-primary/90">Save Thresholds</button>
      </div>

      {/* Audit Log */}
      <div className="card-ehr overflow-hidden">
        <h2 className="font-heading font-medium text-sm px-4 pt-4 pb-2">System Audit Log</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-2 font-medium">Time</th>
              <th className="text-left px-4 py-2 font-medium">User</th>
              <th className="text-left px-4 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {auditLog.map((l, i) => (
              <tr key={i} className="border-b border-border">
                <td className="px-4 py-2 text-muted-foreground">{l.time}</td>
                <td className="px-4 py-2 font-medium">{l.user}</td>
                <td className="px-4 py-2">{l.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
