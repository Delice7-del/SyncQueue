import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'syncqueue_db';
const STORE_NAME = 'tickets';
const SYNC_OUTBOX = 'sync_outbox';

export interface Ticket {
  id: string;
  service: 'consultation' | 'lab' | 'pharmacy';
  number: number;
  status: 'waiting' | 'serving' | 'done';
  createdAt: number;
  synced: boolean;
}

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SYNC_OUTBOX)) {
        db.createObjectStore(SYNC_OUTBOX, { keyPath: 'id' });
      }
    },
  });
}

export async function saveTicket(ticket: Ticket) {
  const db = await initDB();
  await db.put(STORE_NAME, ticket);
}

export async function getTickets(): Promise<Ticket[]> {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function updateTicketStatus(id: string, status: Ticket['status']) {
  const db = await initDB();
  const ticket = await db.get(STORE_NAME, id);
  if (ticket) {
    ticket.status = status;
    await db.put(STORE_NAME, ticket);
  }
}
