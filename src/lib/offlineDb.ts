import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export interface QueuedMutation {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  payload: Record<string, unknown>;
  createdAt: string;
  retries: number;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
}

export interface SyncLogEntry {
  id: string;
  syncedAt: string;
  recordCount: number;
  status: 'success' | 'partial' | 'failed';
  errors?: string[];
}

interface OfflineDB extends DBSchema {
  mutationQueue: {
    key: string;
    value: QueuedMutation;
    indexes: { 'by-status': string; 'by-created': string };
  };
  syncLog: {
    key: string;
    value: SyncLogEntry;
    indexes: { 'by-date': string };
  };
  cachedData: {
    key: string;
    value: { key: string; data: unknown; cachedAt: string };
  };
}

let dbInstance: IDBPDatabase<OfflineDB> | null = null;

export async function getOfflineDb(): Promise<IDBPDatabase<OfflineDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<OfflineDB>('aiess-offline', 1, {
    upgrade(db) {
      const mutStore = db.createObjectStore('mutationQueue', { keyPath: 'id' });
      mutStore.createIndex('by-status', 'status');
      mutStore.createIndex('by-created', 'createdAt');

      const logStore = db.createObjectStore('syncLog', { keyPath: 'id' });
      logStore.createIndex('by-date', 'syncedAt');

      db.createObjectStore('cachedData', { keyPath: 'key' });
    },
  });

  return dbInstance;
}

export async function enqueueMutation(
  table: string,
  operation: 'insert' | 'update' | 'delete',
  payload: Record<string, unknown>
): Promise<string> {
  const db = await getOfflineDb();
  const id = crypto.randomUUID();
  const entry: QueuedMutation = {
    id,
    table,
    operation,
    payload,
    createdAt: new Date().toISOString(),
    retries: 0,
    status: 'pending',
  };
  await db.put('mutationQueue', entry);
  return id;
}

export async function getPendingMutations(): Promise<QueuedMutation[]> {
  const db = await getOfflineDb();
  return db.getAllFromIndex('mutationQueue', 'by-status', 'pending');
}

export async function getAllMutations(): Promise<QueuedMutation[]> {
  const db = await getOfflineDb();
  return db.getAll('mutationQueue');
}

export async function updateMutationStatus(
  id: string,
  status: QueuedMutation['status'],
  error?: string
): Promise<void> {
  const db = await getOfflineDb();
  const entry = await db.get('mutationQueue', id);
  if (entry) {
    entry.status = status;
    entry.retries += status === 'failed' ? 1 : 0;
    if (error) entry.error = error;
    await db.put('mutationQueue', entry);
  }
}

export async function removeMutation(id: string): Promise<void> {
  const db = await getOfflineDb();
  await db.delete('mutationQueue', id);
}

export async function addSyncLog(entry: SyncLogEntry): Promise<void> {
  const db = await getOfflineDb();
  await db.put('syncLog', entry);
}

export async function getSyncLogs(limit = 20): Promise<SyncLogEntry[]> {
  const db = await getOfflineDb();
  const all = await db.getAllFromIndex('syncLog', 'by-date');
  return all.reverse().slice(0, limit);
}

export async function cacheData(key: string, data: unknown): Promise<void> {
  const db = await getOfflineDb();
  await db.put('cachedData', { key, data, cachedAt: new Date().toISOString() });
}

export async function getCachedData<T = unknown>(key: string): Promise<T | null> {
  const db = await getOfflineDb();
  const entry = await db.get('cachedData', key);
  return entry ? (entry.data as T) : null;
}
