/**
 * Offline-aware mutation helpers.
 * When online → write directly to Supabase.
 * When offline → queue to IndexedDB and sync later.
 */
import { supabase } from '@/integrations/supabase/client';
import { enqueueMutation } from './offlineDb';
import { syncAll } from './syncManager';

export async function offlineInsert(
  table: string,
  payload: Record<string, unknown>
): Promise<{ offline: boolean; id?: string; error?: string }> {
  // Always generate an id client-side so we can track it
  const id = (payload.id as string) || crypto.randomUUID();
  const record = { ...payload, id };

  if (navigator.onLine) {
    const { error } = await supabase.from(table as any).insert(record as any);
    if (error) {
      // If Supabase fails while online, queue it
      await enqueueMutation(table, 'insert', record);
      return { offline: true, id, error: error.message };
    }
    return { offline: false, id };
  }

  await enqueueMutation(table, 'insert', record);
  return { offline: true, id };
}

export async function offlineUpdate(
  table: string,
  id: string,
  changes: Record<string, unknown>
): Promise<{ offline: boolean }> {
  const payload = { id, ...changes };

  if (navigator.onLine) {
    const { error } = await supabase.from(table as any).update(changes as any).eq('id', id);
    if (error) {
      await enqueueMutation(table, 'update', payload);
      return { offline: true };
    }
    return { offline: false };
  }

  await enqueueMutation(table, 'update', payload);
  return { offline: true };
}

// Trigger a sync attempt (called from UI "Sync Now")
export { syncAll };
