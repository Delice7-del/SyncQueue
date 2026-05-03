"use client";

import React, { useMemo } from 'react';
import { Ticket } from '@/lib/db';
import { useQueueStore } from '@/store/useQueueStore';
import { motion } from 'framer-motion';
import { Clock, User, Activity, Pill, Microscope, ShieldCheck, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const serviceIcons = {
  consultation: Activity,
  lab: Microscope,
  pharmacy: Pill,
};

const serviceLabels = {
  consultation: 'General Consultation',
  lab: 'Laboratory Analysis',
  pharmacy: 'Pharmacy Service',
};

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const { getQueueData } = useQueueStore();
  const queueData = useMemo(() => getQueueData(ticket.id), [ticket.id, getQueueData]);
  
  const Icon = serviceIcons[ticket.service];
  const prefix = ticket.service.substring(0, 3).toUpperCase();
  const formattedNumber = ticket.number.toString().padStart(3, '0');

  // Progress calculation
  const progress = ticket.status === 'serving' ? 100 : ticket.status === 'done' ? 100 : Math.max(5, 100 - (queueData.position * 15));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 120 }}
      className="relative w-full max-w-2xl mx-auto group"
    >
      {/* Outer Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-blue to-brand-purple rounded-3xl blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
      
      <div className="relative flex flex-col md:flex-row glass-dark rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Left Section (Main Ticket) */}
        <div className="flex-[2] p-8 relative overflow-hidden">
          {/* Subtle Background Icon */}
          <Icon className="absolute -right-8 -bottom-8 w-48 h-48 text-white/[0.02] -rotate-12 pointer-events-none" />

          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue mb-2">Hospital Protocol</p>
              <h3 className="font-heading text-3xl font-black text-white italic tracking-tight">{serviceLabels[ticket.service]}</h3>
            </div>
            <div className={cn(
              "px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
              ticket.status === 'serving' 
                ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue glow-status-serving" 
                : ticket.status === 'done'
                ? "bg-green-500/10 border-green-500/30 text-green-500"
                : "bg-amber-500/10 border-amber-500/30 text-amber-500"
            )}>
              {ticket.status === 'serving' && <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-ping" />}
              {ticket.status}
            </div>
          </div>

          <div className="flex items-end justify-between relative z-10">
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Ticket Assignment</p>
               <h1 className="font-heading text-7xl font-black tracking-tighter text-white">
                 {prefix}<span className="text-brand-blue">-{formattedNumber}</span>
               </h1>
            </div>
            
            <div className="text-right">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Secure ID</p>
               <p className="font-mono text-sm font-bold text-white/40">{ticket.id.split('-')[0].toUpperCase()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 pt-6 border-t border-white/5">
             <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Process Completion</span>
                <span className="text-[10px] font-black text-brand-blue italic">{Math.round(progress)}%</span>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 2, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-brand-blue to-brand-purple rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                />
             </div>
          </div>
        </div>

        {/* Divider (Boarding Pass Tear) */}
        <div className="relative w-full md:w-px h-px md:h-auto border-l border-dashed border-white/20 my-4 md:my-0">
          <div className="absolute -top-4 -left-4 md:-left-4 md:top-[-16px] w-8 h-8 rounded-full bg-bg-navy border border-white/10 hidden md:block"></div>
          <div className="absolute -bottom-4 -left-4 md:-left-4 md:bottom-[-16px] w-8 h-8 rounded-full bg-bg-navy border border-white/10 hidden md:block"></div>
        </div>

        {/* Right Section (Stub) */}
        <div className="flex-1 bg-white/[0.02] p-8 flex flex-col justify-between items-center md:items-start relative overflow-hidden">
           <div className="w-full">
              <div className="flex items-center gap-2 mb-6 opacity-40">
                 <Clock className="w-3 h-3" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Live Wait Data</span>
              </div>
              
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Est. Wait</p>
                    <p className="font-heading text-3xl font-black text-white italic tracking-tighter">~{queueData.estimatedWaitTime}M</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">In Line</p>
                    <p className="font-heading text-3xl font-black text-brand-blue italic tracking-tighter">#{queueData.position}</p>
                 </div>
              </div>
           </div>

           <div className="mt-8 pt-8 border-t border-white/5 w-full">
              <div className="flex items-center gap-2 text-white/40 mb-3">
                 <Info className="w-3 h-3 text-brand-blue" />
                 <p className="text-[9px] font-black uppercase tracking-widest">Protocol</p>
              </div>
              <p className="text-[10px] font-medium text-white/60 leading-relaxed italic">{queueData.message}</p>
           </div>
        </div>
      </div>

      {!ticket.synced && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 text-brand-blue bg-bg-navy/80 backdrop-blur-xl px-5 py-2 rounded-2xl border border-brand-blue/30 shadow-2xl z-20">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Syncing to Protocol</span>
        </div>
      )}
    </motion.div>
  );
}
