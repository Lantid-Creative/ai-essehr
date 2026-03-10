import { supabase } from '@/integrations/supabase/client';
import {
  getPendingMutations,
  updateMutationStatus,
  removeMutation,
  addSyncLog,
  type QueuedMutation,
} from './offlineDb';

type SyncListener = (state: { pending: number; syncing: boolean; lastSynced: string | null }) => void;

let listeners: SyncListener[] = [];
let syncing = false;
let lastSynced: string | null = null;

function notify(pending: number) {
  listeners.forEach((fn) => fn({ pending, syncing, lastSynced }));
}

export function onSyncStateChange(fn: SyncListener): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

async function executeMutation(m: QueuedMutation): Promise<void> {
  const table = m.table as any;
  if (m.operation === 'insert') {
    const { error } = await supabase.from(table).insert(m.payload as any);
    if (error) throw error;
  } else if (m.operation === 'update') {
    const { id, ...rest } = m.payload;
    const { error } = await supabase.from(table).update(rest as any).eq('id', id as string);
    if (error) throw error;
  } else if (m.operation === 'delete') {
    const { error } = await supabase.from(table).delete().eq('id', m.payload.id as string);
    if (error) throw error;
  }
}

export async function syncAll(): Promise<{ synced: number; failed: number }> {
  if (syncing) return { synced: 0, failed: 0 };
  if (!navigator.onLine) return { synced: 0, failed: 0 };

  syncing = true;
  const pending = await getPendingMutations();
  notify(pending.length);

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const m of pending) {
    await updateMutationStatus(m.id, 'syncing');
    try {
      await executeMutation(m);
      await removeMutation(m.id);
      synced++;
    } catch (err: any) {
      const msg = err?.message || 'Unknown error';
      errors.push(`${m.table}/${m.operation}: ${msg}`);
      await updateMutationStatus(m.id, m.retries >= 2 ? 'failed' : 'pending', msg);
      failed++;
    }
  }

  lastSynced = new Date().toISOString();
  syncing = false;

  if (pending.length > 0) {
    await addSyncLog({
      id: crypto.randomUUID(),
      syncedAt: lastSynced,
      recordCount: synced,
      status: failed === 0 ? 'success' : synced === 0 ? 'failed' : 'partial',
      errors: errors.length > 0 ? errors : undefined,
    });
  }

  const remaining = await getPendingMutations();
  notify(remaining.length);

  return { synced, failed };
}

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncAll();
  });
}
