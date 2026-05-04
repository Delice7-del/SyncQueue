import { openDB } from 'idb';

const DB_NAME = 'syncqueue_db';
const DB_VERSION = 2;
const TICKETS_STORE = 'tickets';
const META_STORE = 'queue_meta';

export interface Ticket {
  id: string;
  service: 'consultation' | 'lab' | 'pharmacy';
  number: number;
  status: 'waiting' | 'serving' | 'done';
  createdAt: number;
  servedAt?: number;
  estimatedDuration?: number; // Random duration in ms
  synced: boolean;
}

export interface QueueMeta {
  service: 'consultation' | 'lab' | 'pharmacy';
  lastNumber: number;
}

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains(TICKETS_STORE)) {
        db.createObjectStore(TICKETS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'service' });
      }
    },
  });
}

export async function saveTicket(ticket: Ticket): Promise<void> {
  const db = await getDB();
  await db.put(TICKETS_STORE, ticket);
}

export async function getTickets(): Promise<Ticket[]> {
  const db = await getDB();
  return db.getAll(TICKETS_STORE);
}

export async function updateTicketInDB(id: string, fields: Partial<Ticket>): Promise<void> {
  const db = await getDB();
  const ticket = await db.get(TICKETS_STORE, id);
  if (ticket) {
    await db.put(TICKETS_STORE, { ...ticket, ...fields });
  }
}

/** Atomically get and increment the per-service counter */
export async function getNextTicketNumber(service: Ticket['service']): Promise<number> {
  const db = await getDB();
  const tx = db.transaction(META_STORE, 'readwrite');
  const store = tx.objectStore(META_STORE);
  const meta: QueueMeta | undefined = await store.get(service);
  const nextNumber = (meta?.lastNumber ?? 0) + 1;
  await store.put({ service, lastNumber: nextNumber });
  await tx.done;
  return nextNumber;
}

export async function deleteTicketFromDB(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(TICKETS_STORE, id);
}

export async function getMeta(service: Ticket['service']): Promise<QueueMeta | undefined> {
  const db = await getDB();
  return db.get(META_STORE, service);
}
