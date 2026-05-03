import { create } from 'zustand';
import { Ticket, saveTicket, getTickets, updateTicketStatus } from '@/lib/db';

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
  
  // Actions
  init: () => Promise<void>;
  createTicket: (service: Ticket['service']) => Promise<Ticket>;
  updateStatus: (id: string, status: Ticket['status']) => Promise<void>;
  setOffline: (status: boolean) => void;
  syncOfflineTickets: () => Promise<void>;
  getQueueData: (ticketId: string) => QueueData;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  tickets: [],
  isOffline: typeof window !== 'undefined' ? !navigator.onLine : false,
  isSyncing: false,
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    const tickets = await getTickets();
    set({ tickets, initialized: true });
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        set({ isOffline: false });
        get().syncOfflineTickets();
      });
      window.addEventListener('offline', () => set({ isOffline: true }));
    }
  },

  createTicket: async (service) => {
    const { tickets } = get();
    // For ticket number, we count all tickets (even done ones) to keep it unique/sequential
    const serviceTickets = tickets.filter(t => t.service === service);
    const nextNumber = serviceTickets.length + 1;
    
    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      service,
      number: nextNumber,
      status: 'waiting',
      createdAt: Date.now(),
      synced: !get().isOffline,
    };

    set(state => ({ tickets: [...state.tickets, newTicket] }));
    await saveTicket(newTicket);
    
    return newTicket;
  },

  updateStatus: async (id, status) => {
    set(state => ({
      tickets: state.tickets.map(t => t.id === id ? { ...t, status } : t)
    }));
    await updateTicketStatus(id, status);
  },

  setOffline: (status) => set({ isOffline: status }),

  syncOfflineTickets: async () => {
    const { isOffline, tickets } = get();
    if (isOffline) return;

    set({ isSyncing: true });
    
    // Simulate API call for sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const updatedTickets = tickets.map(t => ({ ...t, synced: true }));
    set({ tickets: updatedTickets, isSyncing: false });
    
    // Save all to DB as synced
    for (const ticket of updatedTickets) {
      await saveTicket(ticket);
    }
  },

  getQueueData: (ticketId) => {
    const { tickets } = get();
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { position: 0, estimatedWaitTime: 0, message: 'Ticket not found' };
    if (ticket.status === 'done') return { position: 0, estimatedWaitTime: 0, message: 'Service completed' };
    if (ticket.status === 'serving') return { position: 0, estimatedWaitTime: 0, message: 'You are being served' };

    const serviceTickets = tickets.filter(t => t.service === ticket.service && t.status !== 'done');
    const waitingTickets = serviceTickets.filter(t => t.status === 'waiting');
    
    // Sort by createdAt to ensure correct queue order
    const sortedWaiting = [...waitingTickets].sort((a, b) => a.createdAt - b.createdAt);
    const position = sortedWaiting.findIndex(t => t.id === ticketId) + 1;
    
    // Average 5 mins per person
    const estimatedWaitTime = position * 5;

    let message = 'Preparing your session';
    if (position === 1) message = 'You are next in line';
    else if (position <= 3) message = 'Almost your turn';
    else message = 'Please wait for your turn';

    return { position, estimatedWaitTime, message };
  },
}));

