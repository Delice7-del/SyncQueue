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
  consultation: 'brand-accent',
  lab: 'blue-500',
  pharmacy: 'emerald-500',
};

export default function QueueDisplay() {
  const { tickets } = useQueueStore();

  const getServiceData = (service: Ticket['service']) => {
    const serviceTickets = tickets.filter(t => t.service === service);
    
    // Done tickets (at the top)
    const completed = serviceTickets
      .filter(t => t.status === 'done')
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 2);

    // Serving ticket
    const serving = serviceTickets.find(t => t.status === 'serving');
    
    // Waiting tickets
    const waiting = serviceTickets
      .filter(t => t.status === 'waiting')
      .sort((a, b) => a.createdAt - b.createdAt);
    
    return { serving, waiting, completed };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 min-w-[900px] lg:min-w-0">
      {(['consultation', 'lab', 'pharmacy'] as const).map(service => {
        const { serving, waiting, completed } = getServiceData(service);
        const Icon = serviceIcons[service];
        const accentColor = serviceColors[service];
        
        return (
          <motion.div 
            layout
            key={service} 
            className="flex flex-col bg-white/40 backdrop-blur-sm rounded-[40px] p-8 border border-brand-blue/5 shadow-soft hover:shadow-premium transition-all duration-500"
          >
            {/* Service Header */}
            <div className="flex items-center gap-4 mb-10">
               <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border border-brand-blue/5 shadow-soft shrink-0", `bg-${accentColor}/10`)}>
                  <Icon className={cn("w-7 h-7", `text-${accentColor}`)} />
               </div>
               <div className="min-w-0">
                  <h3 className="font-heading text-xl font-black text-brand-blue tracking-tighter truncate">{serviceLabels[service]}</h3>
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-black text-brand-blue/60 italic">Active stack</span>
                     <div className="w-1 h-1 rounded-full bg-brand-blue/10"></div>
                     <span className={cn("text-[9px] font-black", `text-${accentColor}`)}>{waiting.length + (serving ? 1 : 0)} active</span>
                  </div>
               </div>
            </div>

            {/* Ranking Timeline Flow */}
            <div className="relative flex flex-col gap-3">
               {/* Vertical Connector Line */}
               <div className="absolute left-[27px] top-6 bottom-6 w-[2px] bg-brand-blue/[0.1] z-0"></div>

               <AnimatePresence mode="popLayout">
                  {/* 1. COMPLETED TICKETS (TOP RANK) */}
                  {completed.map((ticket) => (
                    <motion.div
                      key={`done-${ticket.id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative z-10 flex items-center gap-4"
                    >
                      <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center border-4 border-white shadow-soft shrink-0">
                         <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex-1 bg-white/60 border border-brand-blue/5 rounded-2xl p-4 flex justify-between items-center opacity-80">
                         <div>
                            <h4 className="font-heading text-sm font-black text-brand-blue tracking-tighter italic">
                               {service.substring(0, 3).toUpperCase()}-{ticket.number.toString().padStart(3, '0')}
                            </h4>
                            <p className="text-[8px] font-bold text-brand-blue/60">{serviceLabels[service]}</p>
                         </div>
                         <span className="text-[9px] font-black text-green-600">Done</span>
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
                         <div className={cn("w-14 h-14 rounded-full flex items-center justify-center border-4 border-white shadow-premium relative z-10", `bg-${accentColor}`)}>
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                         </div>
                         <div className={cn("absolute inset-0 rounded-full animate-ping opacity-20", `bg-${accentColor}`)}></div>
                      </div>

                      <div className={cn("flex-1 bg-white border-2 rounded-2xl p-4 shadow-premium flex justify-between items-center", `border-${accentColor}/30`)}>
                         <div>
                            <h4 className="font-heading text-xl font-black text-brand-blue tracking-tighter">
                               {service.substring(0, 3).toUpperCase()}-{serving.number.toString().padStart(3, '0')}
                            </h4>
                            <p className="text-[8px] font-bold text-brand-blue/60">{serviceLabels[service]}</p>
                         </div>
                         <div className="text-right">
                            <span className={cn("text-[9px] font-black block", `text-${accentColor}`)}>Now serving</span>
                            <span className="text-[8px] font-bold text-brand-blue/40 italic">Active protocol</span>
                         </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 3. WAITING LIST (QUEUE RANK) */}
                  {waiting.slice(0, 4).map((ticket, idx) => (
                    <motion.div
                      key={`waiting-${ticket.id}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative z-10 flex items-center gap-4 group"
                    >
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-soft shrink-0 group-hover:border-brand-accent/40 transition-all">
                         <span className="text-xs font-black text-brand-blue/60 group-hover:text-brand-accent transition-colors">{serving ? idx + 2 : idx + 1}</span>
                      </div>
                      <div className="flex-1 bg-white border border-brand-blue/10 rounded-2xl p-4 group-hover:border-brand-blue/30 group-hover:bg-white transition-all flex justify-between items-center">
                         <div>
                            <h4 className="font-heading text-base font-black text-brand-blue/60 group-hover:text-brand-blue transition-colors tracking-tighter italic">
                               {service.substring(0, 3).toUpperCase()}-{ticket.number.toString().padStart(3, '0')}
                            </h4>
                            <p className="text-[8px] font-bold text-brand-blue/40 group-hover:text-brand-blue/60">{serviceLabels[service]}</p>
                         </div>
                         <div className="text-right">
                             <span className="text-[9px] font-black text-brand-accent block">
                               {serving ? `Position ${idx + 2}` : (idx === 0 ? 'Now serving' : `Position ${idx + 1}`)}
                             </span>
                             <span className="text-[10px] font-black text-brand-blue tracking-tight">
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
                                 return serving ? `~${mins}m` : (idx === 0 ? 'Now' : `~${mins}m`);
                               })()}
                             </span>
                         </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* MORE INDICATOR */}
                  {waiting.length > 4 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pl-[72px] py-1">
                       <span className="text-[8px] font-black text-brand-blue/60">
                          + {waiting.length - 4} more in stack
                       </span>
                    </motion.div>
                  )}

                  {/* EMPTY STATE */}
                  {!serving && waiting.length === 0 && completed.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 opacity-40">
                       <Clock className="w-12 h-12 text-brand-blue mb-4" />
                       <p className="text-[10px] font-black text-brand-blue">Standby mode</p>
                    </div>
                  )}
               </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
