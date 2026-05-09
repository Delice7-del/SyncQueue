import { useQueueStore } from '@/store/useQueueStore';
import { Ticket } from '@/lib/db';

// fallback durations if missing
const FALLBACK_DURATION_MS: Record<string, number> = {
  consultation: 270000, // 4.5m
  lab:          210000, // 3.5m
  pharmacy:     120000, // 2.0m
};

const POLL_INTERVAL_MS = 2000; 

let masterInterval: ReturnType<typeof setInterval> | null = null;
const serveStartTime: Record<string, number> = {};

export function startQueueSimulation() {
  if (masterInterval !== null) return;
  // run tick immediately on mount
  tick();
  masterInterval = setInterval(tick, POLL_INTERVAL_MS);
}

export function stopQueueSimulation() {
  if (masterInterval !== null) {
    clearInterval(masterInterval);
    masterInterval = null;
  }
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

function tick() {
  const { tickets, updateStatus } = useQueueStore.getState();
  const services = ['consultation', 'lab', 'pharmacy'] as const;
  const now = Date.now();

  services.forEach(service => {
    const serviceTickets = tickets.filter(t => t.service === service);
    const serving = serviceTickets.find(t => t.status === 'serving');

    if (serving) {
      if (!serveStartTime[serving.id]) {
        // restore exact start time
        serveStartTime[serving.id] = serving.servedAt || now;
      }

      const elapsed = now - serveStartTime[serving.id];
      // fallback to defaults if legacy
      const duration = serving.estimatedDuration || FALLBACK_DURATION_MS[service];

      if (elapsed >= duration) {
        delete serveStartTime[serving.id];
        updateStatus(serving.id, 'done');
        
        // promote next
        const afterDoneWaiting = serviceTickets
          .filter(t => t.id !== serving.id && t.status === 'waiting')
          .sort((a, b) => a.createdAt - b.createdAt)[0];

        if (afterDoneWaiting) {
          updateStatus(afterDoneWaiting.id, 'serving');
          serveStartTime[afterDoneWaiting.id] = now;
        }
      }
    } else {
      const nextWaiting = serviceTickets
        .filter(t => t.status === 'waiting')
        .sort((a, b) => a.createdAt - b.createdAt)[0];

      if (nextWaiting) {
        // set duration if missing
        if (!nextWaiting.estimatedDuration) {
          nextWaiting.estimatedDuration = getServiceDuration(nextWaiting.service);
        }
        updateStatus(nextWaiting.id, 'serving');
        serveStartTime[nextWaiting.id] = now;
      }
    }
  });
}
