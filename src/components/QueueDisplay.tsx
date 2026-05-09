"use client";

import React from 'react';
import { useQueueStore } from '@/store/useQueueStore';
import { Ticket } from '@/lib/db';
import { Activity, Microscope, Pill, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const serviceIcons = {
  consultation: Activity,
  lab: Microscope,
  pharmacy: Pill,
};

const serviceLabels = {
  consultation: 'General consultation',
  lab: 'Laboratory analysis',
  pharmacy: 'Pharmacy service',
};

const serviceColors = {
  consultation: {
    bg: 'bg-brand-blue',
    bgLight: 'bg-brand-blue/10',
    text: 'text-brand-blue',
    border: 'border-brand-blue/30',
  },
  lab: {
    bg: 'bg-brand-blue',
    bgLight: 'bg-brand-blue/10',
    text: 'text-brand-blue',
    border: 'border-brand-blue/30',
  },
  pharmacy: {
    bg: 'bg-brand-blue',
    bgLight: 'bg-brand-blue/10',
    text: 'text-brand-blue',
    border: 'border-brand-blue/30',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: "circOut" as const }
  }
};

export default function QueueDisplay() {
  const { tickets, initialized } = useQueueStore();

  if (!initialized) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
        <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Synchronizing stack...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-16 w-full overflow-x-hidden">
      {(['consultation', 'lab', 'pharmacy'] as const).map(service => (
        <ServiceColumn key={service} service={service} tickets={tickets} />
      ))}
    </div>
  );
}

function ServiceColumn({ service, tickets }: { service: Ticket['service'], tickets: Ticket[] }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const { serving, waiting, completed } = React.useMemo(() => {
    const serviceTickets = tickets.filter(t => t.service === service);
    
    const completed = serviceTickets
      .filter(t => t.status === 'done')
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    const serving = serviceTickets.find(t => t.status === 'serving');
    
    const waiting = serviceTickets
      .filter(t => t.status === 'waiting')
      .sort((a, b) => a.createdAt - b.createdAt);
    
    console.log(`[QueueDisplay] ${service}: ${waiting.length} waiting, ${serving ? '1 serving' : 'none serving'}`);
    
    return { serving, waiting, completed };
  }, [tickets, service]);
  const Icon = serviceIcons[service];
  const colors = serviceColors[service];

  const visibleWaiting = isExpanded ? waiting : waiting.slice(0, 4);

  return (
    <motion.div 
      layout
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="flex flex-col bg-brand-blue/[0.02] backdrop-blur-md rounded-lg p-5 sm:p-10 border border-brand-blue/10 hover:bg-brand-blue/[0.04] transition-all duration-500 h-fit"
    >
      {/* Service Header */}
      <div className="flex items-center gap-4 mb-6">
         <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center border border-brand-blue/5 shrink-0", colors.bgLight)}>
            <Icon className={cn("w-7 h-7", colors.text)} />
         </div>
         <div className="min-w-0">
            <h3 className="font-heading text-lg sm:text-xl font-black text-brand-blue tracking-tighter truncate">{serviceLabels[service]}</h3>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-medium text-brand-blue/60 italic">Active stack</span>
               <div className="w-1 h-1 rounded-full bg-brand-blue/10"></div>
               <span className={cn("text-[9px] font-medium", colors.text)}>{waiting.length + (serving ? 1 : 0)} active</span>
            </div>
         </div>
      </div>

      {/* Ranking Timeline Flow */}
      <div className="relative flex flex-col gap-6">
         {/* Vertical Connector Line */}
         <div className="absolute left-[23px] sm:left-[27px] top-6 bottom-6 w-[2px] bg-brand-blue/[0.1] z-0"></div>

         <AnimatePresence mode="popLayout">
            {/* 1. COMPLETED TICKETS (TOP RANK) */}
            {completed.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pl-14 sm:pl-[72px] mb-4">
                 <span className="text-[8px] font-medium text-green-600/60 uppercase tracking-widest">Historical Protocol</span>
              </motion.div>
            )}
            {completed.map((ticket) => (
              <motion.div
                key={`done-${ticket.id}`}
                variants={itemVariants}
                className="relative z-10 flex items-center gap-4"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-50 flex items-center justify-center border-4 border-white shrink-0">
                   <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1 bg-white/60 border border-brand-blue/5 rounded-lg px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center opacity-80">
                   <div>
                      <h4 className="font-heading text-sm font-medium text-brand-blue tracking-tighter italic">
                         {service.substring(0, 3).toUpperCase()}-{ticket.number.toString().padStart(3, '0')}
                      </h4>
                      <p className="text-[8px] font-medium text-brand-blue/60">{serviceLabels[service]}</p>
                   </div>
                   <span className="text-[9px] font-medium text-green-600/60">Status: Done</span>
                </div>
              </motion.div>
            ))}

            {/* 2. NOW SERVING (PRIMARY RANK) */}
            {serving && (
              <motion.div
                key={`serving-${serving.id}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 flex items-center gap-4"
              >
                <div className="relative shrink-0">
                   <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-4 border-white relative z-10", colors.bg)}>
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                   </div>
                   <div className={cn("absolute inset-0 rounded-full animate-ping opacity-20", colors.bg)}></div>
                </div>

                <div className={cn("flex-1 min-w-0 bg-white border-2 rounded-lg px-4 py-3 flex items-center justify-between gap-4 overflow-hidden", colors.border)}>
                   {/* 1. Ticket ID */}
                   <h4 className="font-heading text-base sm:text-lg font-black text-brand-blue tracking-tighter leading-none shrink-0">
                      {service.substring(0, 3).toUpperCase()}-{serving.number.toString().padStart(3, '0')}
                   </h4>

                   {/* 2. Service Info */}
                   <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                      <p className="text-[9px] font-medium text-brand-blue/60 truncate italic">{serviceLabels[service]}</p>
                   </div>

                   {/* 3. Serving Status & Time */}
                   <div className="flex flex-col items-end gap-1.5 shrink-0 pr-2">
                      <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-brand-blue/5 whitespace-nowrap", colors.text)}>Serving</span>
                      <div className="flex items-center gap-1.5 text-brand-blue">
                         <Clock className="w-3 h-3" />
                         <span className="text-xs font-black tracking-tight italic">
                            ~{Math.ceil((serving.estimatedDuration || 120000) / 60000)}m
                         </span>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {/* 3. WAITING LIST (QUEUE RANK) */}
             {visibleWaiting.map((ticket, idx) => (
              <motion.div
                key={`waiting-${ticket.id}`}
                layout
                variants={itemVariants}
                className="relative z-10 flex items-center gap-4 group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center border-4 border-white shrink-0 group-hover:border-brand-accent/40 transition-all">
                   <span className="text-xs font-medium text-brand-blue/60 group-hover:text-brand-accent transition-colors">{serving ? idx + 2 : idx + 1}</span>
                </div>
                <div className="flex-1 bg-white border border-brand-blue/10 rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between group-hover:border-brand-blue/30 transition-all">
                   <div className="flex flex-col gap-0.5">
                      <h4 className="font-heading text-base sm:text-lg font-black text-brand-blue/60 group-hover:text-brand-blue transition-colors tracking-tighter leading-none">
                         {service.substring(0, 3).toUpperCase()}-{ticket.number.toString().padStart(3, '0')}
                      </h4>
                      <p className="text-[10px] font-medium text-brand-blue/40 group-hover:text-brand-blue/60 transition-colors">{serviceLabels[service]}</p>
                   </div>
                   <div className="text-right flex flex-col gap-1 items-end">
                       <span className="text-[9px] font-black text-brand-accent uppercase tracking-widest px-1.5 py-0.5 rounded bg-brand-accent/5">
                         Pos {serving ? idx + 2 : idx + 1}
                       </span>
                       <div className="flex items-center gap-1 text-brand-blue/20 group-hover:text-brand-blue/30 transition-colors">
                         <Clock className="w-2.5 h-2.5" />
                         <span className="text-[10px] font-medium tracking-tight">
                          {(() => {
                            let totalMs = 0;
                            if (serving) {
                              const remain = Math.max(0, (serving.servedAt || Date.now()) + (serving.estimatedDuration || 300000) - Date.now());
                              totalMs += remain;
                            }
                            for (let i = 0; i < idx; i++) {
                              totalMs += (waiting[i].estimatedDuration || 300000);
                            }
                            const mins = Math.ceil(totalMs / 60000);
                            return `~${mins}m`;
                          })()}
                         </span>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}

            {waiting.length > 4 && (
              <motion.div layout className="pl-14 sm:pl-[72px] mt-2">
                 <button 
                   onClick={() => setIsExpanded(!isExpanded)}
                   className="text-[9px] font-black text-brand-accent uppercase tracking-widest hover:text-brand-blue transition-colors flex items-center gap-2 group/btn"
                 >
                   {isExpanded ? 'Compress sequence' : `View full stack (+${waiting.length - 4})`}
                   <Clock className={cn("w-3 h-3 transition-transform duration-500", isExpanded ? "rotate-180" : "group-hover:rotate-90")} />
                 </button>
              </motion.div>
            )}

            {!serving && waiting.length === 0 && completed.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 gap-4 opacity-30"
              >
                <div className="w-16 h-16 rounded-full border border-brand-blue/10 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-brand-blue" />
                </div>
                <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Standby mode</p>
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </motion.div>
  );
}
