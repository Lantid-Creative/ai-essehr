import { syncStatus } from '@/data/mockData';
import { Wifi, WifiOff, RefreshCw, CheckCircle, Clock } from 'lucide-react';

const syncLog = [
  { time: '2026-03-10 08:45', records: 12, status: 'Success' },
  { time: '2026-03-10 06:30', records: 8, status: 'Success' },
  { time: '2026-03-09 22:00', records: 15, status: 'Success' },
  { time: '2026-03-09 18:15', records: 5, status: 'Partial' },
  { time: '2026-03-09 14:00', records: 20, status: 'Success' },
];

export default function SyncPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-heading font-medium">Sync & Connectivity</h1>

      <div className="card-ehr p-6">
        <div className="flex items-center gap-3 mb-4">
          {syncStatus.isOnline ? <Wifi className="h-8 w-8 text-success" /> : <WifiOff className="h-8 w-8 text-warning" />}
          <div>
            <p className="font-heading font-medium text-lg">{syncStatus.isOnline ? 'Online' : 'Offline'}</p>
            <p className="text-sm text-muted-foreground">All data entry works fully offline</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="stat-card flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">{syncStatus.lastSynced}</p><p className="text-xs text-muted-foreground">Last Synced</p></div></div>
          <div className="stat-card flex items-center gap-2"><RefreshCw className="h-4 w-4 text-accent" /><div><p className="text-sm font-medium">{syncStatus.recordsPending}</p><p className="text-xs text-muted-foreground">Pending Upload</p></div></div>
          <div className="stat-card flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /><div><p className="text-sm font-medium">{syncStatus.recordsSynced.toLocaleString()}</p><p className="text-xs text-muted-foreground">Records Synced</p></div></div>
          <div className="stat-card flex items-center gap-2"><div><p className="text-sm font-medium">{syncStatus.errors}</p><p className="text-xs text-muted-foreground">Errors</p></div></div>
        </div>

        <button className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Sync Now
        </button>
      </div>

      <div className="card-ehr overflow-hidden">
        <h2 className="font-heading font-medium text-sm px-4 pt-4 pb-2">Sync History</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-4 py-2 font-medium">Time</th>
              <th className="text-left px-4 py-2 font-medium">Records</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {syncLog.map((l, i) => (
              <tr key={i} className="border-b border-border">
                <td className="px-4 py-2">{l.time}</td>
                <td className="px-4 py-2">{l.records}</td>
                <td className="px-4 py-2">
                  <span className={l.status === 'Success' ? 'badge-success' : 'badge-warning'}>{l.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
