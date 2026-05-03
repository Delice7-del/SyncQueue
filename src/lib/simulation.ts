import { useQueueStore } from '@/store/useQueueStore';

let simulationInterval: NodeJS.Timeout | null = null;

export function startQueueSimulation() {
  if (simulationInterval) return;

  // Run simulation logic every 3 seconds for better responsiveness
  simulationInterval = setInterval(() => {
    const { tickets, updateStatus } = useQueueStore.getState();
    
    const services: ('consultation' | 'lab' | 'pharmacy')[] = ['consultation', 'lab', 'pharmacy'];
    
    services.forEach(service => {
      const serviceTickets = tickets.filter(t => t.service === service);
      const currentServing = serviceTickets.find(t => t.status === 'serving');
      
      if (currentServing) {
        // More realistic: service takes 2-6 mins (simulated as 10-20% chance per tick)
        // We use a random threshold to simulate variable service times
        const chance = service === 'consultation' ? 0.1 : service === 'lab' ? 0.05 : 0.15;
        if (Math.random() < chance) {
          updateStatus(currentServing.id, 'done');
        }
      } else {
        const nextWaiting = serviceTickets
          .filter(t => t.status === 'waiting')
          .sort((a, b) => a.createdAt - b.createdAt)[0];
          
        if (nextWaiting) {
          updateStatus(nextWaiting.id, 'serving');
        }
      }
    });
  }, 3000);
}

export function stopQueueSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}
