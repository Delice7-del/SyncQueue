import { create } from 'zustand';
import {
  Ticket,
  saveTicket,
  getTickets,
  updateTicketInDB,
  getNextTicketNumber,
} from '@/lib/db';

interface QueueData {
  position: number;
  estimatedWaitTime: number;
  message: string;
}

interface QueueState {
  tickets: Ticket[];
  isOffline: boolean;
  isSyncing: boolean;
  initialized: boolean;
  networkStatus: 'strong' | 'fair' | 'poor' | 'offline';
  canInstall: boolean;
  deferredPrompt: any;


  init: () => Promise<void>;
  createTicket: (service: Ticket['service']) => Promise<Ticket>;
  updateStatus: (id: string, status: Ticket['status']) => Promise<void>;
  setOffline: (status: boolean) => void;
  syncOfflineTickets: () => Promise<void>;
  getQueueData: (ticketId: string) => QueueData;
  deleteTicket: (id: string) => Promise<void>;
  installApp: () => Promise<void>;
}

const getServiceDuration = (service: Ticket['service']) => {
  const ranges = {
    consultation: [3, 6],
    lab: [2, 5],
    pharmacy: [1, 3],
  };
  const [min, max] = ranges[service];
  const minutes = Math.random() * (max - min) + min;
  return Math.floor(minutes * 60 * 1000); 
};

// broadcast channel for multi-tab sync
const syncChannel = typeof window !== 'undefined' ? new BroadcastChannel('syncqueue_orchestrator') : null;

export const useQueueStore = create<QueueState>((set, get) => ({
  tickets: [],
  isOffline: false,
  isSyncing: false,
  initialized: false,
  networkStatus: 'strong',
  canInstall: false,
  deferredPrompt: null,

  init: async () => {
    if (get().initialized) return;

    if (typeof window !== 'undefined') {
      const updateNetwork = () => {
        const conn = (navigator as any).connection;
        let status: 'strong' | 'fair' | 'poor' | 'offline' = 'strong';
        
        if (!navigator.onLine) {
          status = 'offline';
        } else if (conn) {
          if (conn.effectiveType === '2g') status = 'poor';
          else if (conn.effectiveType === '3g') status = 'fair';
        }
        
        set({ 
          isOffline: !navigator.onLine,
          networkStatus: status
        });
      };

      updateNetwork();

      window.addEventListener('online', () => {
        updateNetwork();
        get().syncOfflineTickets();
      });
      window.addEventListener('offline', updateNetwork);
      
      const conn = (navigator as any).connection;
      if (conn) conn.addEventListener('change', updateNetwork);

      // handle PWA installation
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        set({ deferredPrompt: e, canInstall: true });
      });

      // sync state across tabs
      syncChannel?.addEventListener('message', async (event) => {
        if (event.data === 'SYNC_REQUEST') {
          const tickets = await getTickets();
          set({ tickets });
        }
      });
    }

    let tickets = await getTickets();

    const services = ['consultation', 'lab', 'pharmacy'] as const;
    for (const service of services) {
      const servingTickets = tickets
        .filter(t => t.service === service && t.status === 'serving')
        .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));

      if (servingTickets.length > 1) {
        const toReset = servingTickets.slice(1);
        for (const t of toReset) {
          await updateTicketInDB(t.id, { status: 'waiting', servedAt: undefined });
        }
        tickets = tickets.map(t =>
          toReset.find(r => r.id === t.id) ? { ...t, status: 'waiting', servedAt: undefined } : t
        );
      }
    }

    set({ tickets, initialized: true });
  },

  createTicket: async (service) => {
    const number = await getNextTicketNumber(service);
    const duration = getServiceDuration(service);

    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      service,
      number,
      status: 'waiting',
      createdAt: Date.now(),
      estimatedDuration: duration,
      synced: !get().isOffline,
    };

    await saveTicket(newTicket);
    set(state => ({ tickets: [...state.tickets, newTicket] }));
    syncChannel?.postMessage('SYNC_REQUEST');

    return newTicket;
  },

  updateStatus: async (id, status) => {
    const fields: Partial<Ticket> = { status };
    if (status === 'serving') fields.servedAt = Date.now();

    await updateTicketInDB(id, fields);
    set(state => ({
      tickets: state.tickets.map(t => t.id === id ? { ...t, ...fields } : t),
    }));
    syncChannel?.postMessage('SYNC_REQUEST');
  },

  setOffline: (status) => set({ isOffline: status }),

  syncOfflineTickets: async () => {
    if (get().isOffline) return;
    set({ isSyncing: true });
    // fake a network delay for the sync animation
    await new Promise(resolve => setTimeout(resolve, 1500));
    const updatedTickets = get().tickets.map(t => ({ ...t, synced: true }));
    for (const t of updatedTickets) await saveTicket(t);
    set({ tickets: updatedTickets, isSyncing: false });
    syncChannel?.postMessage('SYNC_REQUEST');
  },

  getQueueData: (ticketId) => {
    const { tickets } = get();
    const ticket = tickets.find(t => t.id === ticketId);
    const now = Date.now();

    if (!ticket) return { position: 0, estimatedWaitTime: 0, message: 'Ticket not found' };
    if (ticket.status === 'done') return { position: 0, estimatedWaitTime: 0, message: 'Your service is complete' };
    
    const serviceTickets = tickets.filter(t => t.service === ticket.service);
    const serving = serviceTickets.find(t => t.status === 'serving');
    
    if (ticket.status === 'serving') {
      return { position: 1, estimatedWaitTime: 0, message: 'You are now being served' };
    }

    const waiting = serviceTickets
      .filter(t => t.status === 'waiting')
      .sort((a, b) => a.createdAt - b.createdAt);

    const waitIndex = waiting.findIndex(t => t.id === ticketId);
    if (waitIndex === -1) return { position: 0, estimatedWaitTime: 0, message: 'Processing queue...' };

    const position = serving ? waitIndex + 2 : waitIndex + 1;

    let totalWaitMs = 0;
    
    if (serving) {
      const startTime = serving.servedAt || serving.createdAt;
      const duration = serving.estimatedDuration || (5 * 60 * 1000);
      const remaining = Math.max(0, (startTime + duration) - now);
      totalWaitMs += remaining; // current person remaining time
    }

    for (let i = 0; i < waitIndex; i++) {
      totalWaitMs += (waiting[i].estimatedDuration || (5 * 60 * 1000));
    }

    const estimatedWaitMinutes = Math.ceil(totalWaitMs / (60 * 1000));

    let message = 'You are in queue. Please wait.';
    if (position === 1) message = 'Prepare for your service';
    else if (position === 2 || position === 3) message = 'Almost your turn';

    return { 
      position, 
      estimatedWaitTime: estimatedWaitMinutes, 
      message 
    };
  },

  deleteTicket: async (id: string) => {
    const { deleteTicketFromDB } = await import('@/lib/db');
    await deleteTicketFromDB(id);
    set(state => ({
      tickets: state.tickets.filter(t => t.id !== id),
    }));
    syncChannel?.postMessage('SYNC_REQUEST');
  },

  installApp: async () => {
    const prompt = get().deferredPrompt;
    if (!prompt) return;

    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    
    if (outcome === 'accepted') {
      set({ canInstall: false, deferredPrompt: null });
    }
  },
}));
