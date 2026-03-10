import { Wifi, WifiOff, RefreshCw, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { useSyncState } from '@/hooks/useOfflineSync';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function SyncPage() {
  const { isOnline, pending, syncing, lastSynced, logs, triggerSync } = useSyncState();

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-heading font-medium">Sync & Connectivity</h1>

      <div className="card-ehr p-6">
        <div className="flex items-center gap-3 mb-4">
          {isOnline ? (
            <Wifi className="h-8 w-8 text-success" />
          ) : (
            <WifiOff className="h-8 w-8 text-warning" />
          )}
          <div>
            <p className="font-heading font-medium text-lg">
              {syncing ? 'Syncing…' : isOnline ? 'Online' : 'Offline'}
            </p>
            <p className="text-sm text-muted-foreground">
              All data entry works fully offline
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="stat-card flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {lastSynced ? format(new Date(lastSynced), 'HH:mm:ss') : 'Never'}
              </p>
              <p className="text-xs text-muted-foreground">Last Synced</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 text-accent ${syncing ? 'animate-spin' : ''}`} />
            <div>
              <p className="text-sm font-medium">{pending}</p>
              <p className="text-xs text-muted-foreground">Pending Upload</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <div>
              <p className="text-sm font-medium">
                {logs.reduce((s, l) => s + l.recordCount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Records Synced</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <div>
              <p className="text-sm font-medium">
                {logs.filter((l) => l.status === 'failed').length}
              </p>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
          </div>
        </div>

        <Button
          onClick={triggerSync}
          disabled={syncing || !isOnline || pending === 0}
          className="mt-4"
        >
          {syncing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Sync Now
        </Button>
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
            {logs.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                  No sync history yet
                </td>
              </tr>
            )}
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-border">
                <td className="px-4 py-2">
                  {format(new Date(l.syncedAt), 'yyyy-MM-dd HH:mm')}
                </td>
                <td className="px-4 py-2">{l.recordCount}</td>
                <td className="px-4 py-2">
                  <span
                    className={
                      l.status === 'success'
                        ? 'badge-success'
                        : l.status === 'partial'
                        ? 'badge-warning'
                        : 'badge-destructive'
                    }
                  >
                    {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
