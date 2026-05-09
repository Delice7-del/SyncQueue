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
      window.addEventListener('online', updateNetwork);
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
        if (event.data === 'SYNC_REQUEST' || event.data === 'TICKET_CREATED') {
          const tickets = await getTickets().catch(() => []);
          set({ tickets });
        }
      });
    }

    // Load tickets as a background task to avoid UI block
    getTickets().then(tickets => {
      // ensure only one person is serving per department
      const services = ['consultation', 'lab', 'pharmacy'] as const;
      let cleaned = [...tickets];
      
      for (const service of services) {
        const serving = cleaned.filter(t => t.service === service && t.status === 'serving');
        if (serving.length > 1) {
          const toReset = serving.slice(1);
          toReset.forEach(t => updateTicketInDB(t.id, { status: 'waiting', servedAt: undefined }));
          cleaned = cleaned.map(t => toReset.find(r => r.id === t.id) ? { ...t, status: 'waiting', servedAt: undefined } : t);
        }
      }

      set({ 
        tickets: cleaned.map(t => ({...t, estimatedDuration: t.estimatedDuration || getServiceDuration(t.service)})), 
        initialized: true 
      });
    }).catch(err => {
      console.error('[Store] Init failed:', err);
      set({ initialized: true }); // Still allow app to boot
    });
  },

  createTicket: async (service) => {
    const number = await getNextTicketNumber(service);
    const id = crypto.randomUUID();
    
    // Check if we should start serving immediately (if no one else is in queue for this service)
    const { tickets } = get();
    const serviceTickets = tickets.filter(t => t.service === service);
    const hasActive = serviceTickets.some(t => t.status === 'serving' || t.status === 'waiting');
    
    const ticket: Ticket = {
      id,
      service,
      number,
      status: hasActive ? 'waiting' : 'serving',
      createdAt: Date.now(),
      servedAt: hasActive ? undefined : Date.now(),
      estimatedDuration: getServiceDuration(service),
      synced: false,
    };

    console.log(`[Store] Created ticket ${id} for ${service}. Status: ${ticket.status}`);

    await saveTicket(ticket);
    set((state) => ({ tickets: [...state.tickets, ticket] }));
    syncChannel?.postMessage('TICKET_CREATED');
    return ticket;
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { tickets } = get();
    const updatedTickets = tickets.map(t => ({ ...t, synced: true }));
    
    for (const t of updatedTickets) await saveTicket(t);
    
    set({ 
      tickets: updatedTickets.sort((a, b) => a.createdAt - b.createdAt),
      isSyncing: false 
    });
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
    
    const getFallback = (svc: string) => {
      const fallbacks: Record<string, number> = { consultation: 4.5, lab: 3.5, pharmacy: 2 };
      return (fallbacks[svc] || 5) * 60 * 1000;
    };

    if (serving) {
      const startTime = serving.servedAt || serving.createdAt;
      const duration = serving.estimatedDuration || getFallback(serving.service);
      const remaining = Math.max(0, (startTime + duration) - now);
      totalWaitMs += remaining; // current person remaining time
    }

    for (let i = 0; i < waitIndex; i++) {
      totalWaitMs += (waiting[i].estimatedDuration || getFallback(waiting[i].service));
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
