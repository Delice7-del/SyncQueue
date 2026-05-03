"use client";

import React from 'react';
import { useQueueStore } from '@/store/useQueueStore';
import { Ticket } from '@/lib/db';
import { Activity, Microscope, Pill, Users, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const serviceIcons = {
  consultation: Activity,
  lab: Microscope,
  pharmacy: Pill,
};

const serviceLabels = {
  consultation: 'Consultation',
  lab: 'Laboratory',
  pharmacy: 'Pharmacy',
};

export default function QueueDisplay() {
  const { tickets } = useQueueStore();

  const getServiceData = (service: Ticket['service']) => {
    const serviceTickets = tickets.filter(t => t.service === service);
    const serving = serviceTickets.find(t => t.status === 'serving');
    const waiting = serviceTickets
      .filter(t => t.status === 'waiting')
      .sort((a, b) => a.createdAt - b.createdAt);
    const completed = serviceTickets
      .filter(t => t.status === 'done')
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 2); // Show last 2 completed
    
    return { serving, waiting, completed };
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
      {(['consultation', 'lab', 'pharmacy'] as const).map(service => {
        const { serving, waiting, completed } = getServiceData(service);
        const Icon = serviceIcons[service];
        
        return (
          <motion.div 
            layout
            key={service} 
            className="flex flex-col gap-8"
          >
            {/* Service Header */}
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 rounded-[20px] bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                  <Icon className="w-7 h-7 text-brand-blue" />
               </div>
               <div>
                  <h3 className="font-heading text-2xl font-black text-white italic tracking-tight uppercase">{serviceLabels[service]}</h3>
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Operational</span>
                     <div className="w-1 h-1 rounded-full bg-brand-blue/40"></div>
                     <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">{waiting.length} QUEUED</span>
                  </div>
               </div>
            </div>

            {/* Timeline Flow */}
            <div className="relative space-y-5 pl-2">
               {/* Vertical Line */}
               <div className="absolute left-7 top-8 bottom-8 w-px bg-gradient-to-b from-brand-blue/40 via-white/10 to-transparent border-l border-dashed border-white/10"></div>

               <AnimatePresence mode="popLayout">
                 {/* Current Serving Node */}
                 {serving ? (
                   <motion.div
                     key={`serving-${serving.id}`}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 20 }}
                     className="relative z-10 flex items-center gap-8"
                   >
                     <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-brand-blue flex items-center justify-center border-[6px] border-bg-navy shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                           <Activity className="w-6 h-6 text-white animate-pulse" />
                        </div>
                        <div className="absolute inset-0 rounded-2xl bg-brand-blue animate-ping opacity-20"></div>
                     </div>
                     <div className="flex-1 glass-dark border border-brand-blue/40 rounded-[24px] p-5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                           <Activity className="w-12 h-12 text-white" />
                        </div>
                        <div className="flex justify-between items-center mb-1.5">
                           <span className="text-[10px] font-black text-brand-blue uppercase tracking-[0.3em]">Now Serving</span>
                           <span className="text-[9px] font-black text-white/30 uppercase italic">Protocol Active</span>
                        </div>
                        <h4 className="font-heading text-4xl font-black text-white tracking-tighter italic">
                          {service.substring(0, 3).toUpperCase()}<span className="text-brand-blue">-{serving.number.toString().padStart(3, '0')}</span>
                        </h4>
                     </div>
                   </motion.div>
                 ) : (
                    <motion.div className="relative z-10 flex items-center gap-8 opacity-30">
                       <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border-[6px] border-bg-navy">
                          <Clock className="w-6 h-6 text-white" />
                       </div>
                       <div className="flex-1 border border-dashed border-white/10 rounded-[24px] p-5">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em]">System Standby</p>
                          <h4 className="font-heading text-4xl font-black italic tracking-tighter text-white/20">---</h4>
                       </div>
                    </motion.div>
                 )}

                 {/* Next in Line Nodes (Waiting) */}
                 {waiting.slice(0, 3).map((ticket, index) => (
                   <motion.div
                     key={`waiting-${ticket.id}`}
                     layout
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: index * 0.1 }}
                     className="relative z-10 flex items-center gap-8 group"
                   >
                     <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border-[6px] border-bg-navy group-hover:bg-white/10 transition-all duration-500">
                        <span className="text-sm font-black text-white/20 group-hover:text-brand-blue/60 transition-colors">{index + 1}</span>
                     </div>
                     <div className="flex-1 glass-dark border border-white/5 rounded-[24px] p-5 group-hover:border-white/20 transition-all duration-500">
                        <div className="flex justify-between items-center mb-1.5">
                           <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Queued</span>
                           <span className="text-[10px] font-black text-amber-500/60 uppercase italic">~{(index + 1) * 5}M</span>
                        </div>
                        <h4 className="font-heading text-2xl font-black text-white/60 group-hover:text-white transition-colors tracking-tighter italic">
                          {service.substring(0, 3).toUpperCase()}-{ticket.number.toString().padStart(3, '0')}
                        </h4>
                     </div>
                   </motion.div>
                 ))}

                 {/* More indicator */}
                 {waiting.length > 3 && (
                   <div className="pl-24 py-2">
                      <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                         <div className="w-1 h-1 rounded-full bg-brand-blue animate-pulse"></div>
                         <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">+ {waiting.length - 3} Additional Protocols</span>
                      </div>
                   </div>
                 )}

                 {/* Completed Nodes (Dimmed) */}
                 {completed.map((ticket) => (
                   <motion.div
                     key={`done-${ticket.id}`}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 0.3 }}
                     className="relative z-10 flex items-center gap-8 grayscale"
                   >
                     <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center border-[6px] border-bg-navy">
                        <CheckCircle2 className="w-5 h-5 text-green-500/40" />
                     </div>
                     <div className="flex-1 bg-white/[0.01] border border-white/5 rounded-[24px] p-4">
                        <span className="text-[9px] font-black text-green-500/40 uppercase tracking-[0.3em]">Terminated</span>
                        <h4 className="font-heading text-xl font-black text-white/20 line-through tracking-tighter italic">
                          {service.substring(0, 3).toUpperCase()}-{ticket.number.toString().padStart(3, '0')}
                        </h4>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
