import { useState, useEffect, useCallback } from 'react';
import { onSyncStateChange, syncAll } from '@/lib/syncManager';
import { getPendingMutations, getSyncLogs, type SyncLogEntry } from '@/lib/offlineDb';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return isOnline;
}

export function useSyncState() {
  const isOnline = useOnlineStatus();
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [logs, setLogs] = useState<SyncLogEntry[]>([]);

  useEffect(() => {
    getPendingMutations().then((m) => setPending(m.length));
    getSyncLogs().then(setLogs);

    const unsub = onSyncStateChange((state) => {
      setPending(state.pending);
      setSyncing(state.syncing);
      setLastSynced(state.lastSynced);
      getSyncLogs().then(setLogs);
    });

    return unsub;
  }, []);

  const triggerSync = useCallback(async () => {
    if (!isOnline) return;
    return syncAll();
  }, [isOnline]);

  return { isOnline, pending, syncing, lastSynced, logs, triggerSync };
}
