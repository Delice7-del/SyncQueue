"use client";

import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Info,
  Calendar,
  Share2,
  Download,
  CheckCircle2,
  Activity,
  ArrowRight,
  RotateCcw,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueueStore } from '@/store/useQueueStore';
import { Ticket } from '@/lib/db';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const { getQueueData, tickets, deleteTicket } = useQueueStore();
  const [queueData, setQueueData] = useState(getQueueData(ticket.id));
  const liveTicket = tickets.find(t => t.id === ticket.id) || ticket;
  const router = useRouter();

  useEffect(() => {
    const updateData = () => {
      setQueueData(getQueueData(ticket.id));
    };
    
    updateData();
    const interval = setInterval(updateData, 2000);
    return () => clearInterval(interval);
  }, [ticket.id, getQueueData, tickets]);

  const handleUndo = async () => {
    if (confirm('Undo ticket creation? This will remove you from the queue protocol.')) {
      await deleteTicket(ticket.id);
      router.push('/');
    }
  };

  const serviceLabels = {
    consultation: 'General Consultation',
    lab: 'Laboratory Analysis',
    pharmacy: 'Pharmacy Supply'
  };

  const getAccentColor = (service: Ticket['service']) => {
    switch (service) {
      case 'consultation': return 'brand-accent';
      case 'lab': return 'blue-500';
      case 'pharmacy': return 'emerald-500';
      default: return 'brand-accent';
    }
  };

  const accentColor = getAccentColor(liveTicket.service);

  // Calculate progress (just for visual flair)
  const progress = Math.max(5, 100 - (queueData.position * 15));

  return (
    <div className="w-full h-full flex items-center justify-center py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-sm bg-white rounded-[40px] shadow-2xl border border-brand-blue/5 relative overflow-visible"
      >
        {/* Glow behind card */}
        <motion.div 
          animate={{ 
            opacity: liveTicket.status === 'serving' ? [0.1, 0.15, 0.1] : 0 
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className={cn("absolute inset-0 blur-[80px] rounded-full scale-110 -z-10", `bg-${accentColor}/10`)}
        />

        {/* Boarding Pass Notches */}
        <div className="absolute left-[-12px] top-[68%] w-6 h-6 bg-bg-light rounded-full border border-brand-blue/5 z-20" />
        <div className="absolute right-[-12px] top-[68%] w-6 h-6 bg-bg-light rounded-full border border-brand-blue/5 z-20" />

        <div className={cn("h-2.5 w-full bg-gradient-to-r rounded-t-[40px]", `from-${accentColor} via-blue-400 to-indigo-500`)} />

        <div className="p-10 pb-6 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <span className={cn("text-[9px] font-black tracking-[0.3em] mb-1 uppercase", `text-${accentColor}`)}>Health Protocol</span>
              <h2 className="text-xl font-black text-brand-blue tracking-tighter italic leading-tight">
                {serviceLabels[liveTicket.service]}
              </h2>
            </div>
            <motion.div 
              key={liveTicket.status}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "px-4 py-2 rounded-2xl border font-black text-[9px] tracking-[0.2em] uppercase",
                liveTicket.status === 'serving' ? "bg-green-50 border-green-200 text-green-600 shadow-[0_0_15px_rgba(34,197,94,0.1)]" :
                liveTicket.status === 'done' ? "bg-brand-blue text-white" : "bg-amber-50 border-amber-200 text-amber-600"
              )}
            >
              {liveTicket.status === 'serving' ? 'Serving' : liveTicket.status.toUpperCase()}
            </motion.div>
          </div>

          <div className="mb-10">
            <div className="flex items-end justify-between mb-2">
               <p className="text-[10px] font-black tracking-[0.2em] text-brand-blue/40 uppercase">Boarding Sequence</p>
               <span className="text-[10px] font-black text-brand-accent tracking-widest uppercase italic">04 MAY 26</span>
            </div>
            <p className="font-heading text-7xl font-black tracking-tighter text-brand-blue leading-none">
              {liveTicket.number < 100 ? (liveTicket.service === 'consultation' ? 'CN' : liveTicket.service === 'lab' ? 'LB' : 'PH') : ''}
              <span className={cn(`text-${accentColor}`)}>-{String(liveTicket.number).padStart(3, '0')}</span>
            </p>
          </div>

          {/* Progress Bar (Jesko Style) */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-2">
               <span className="text-[9px] font-black tracking-[0.2em] text-brand-blue/30 uppercase italic">Waiting Progress</span>
               <span className={cn("text-[10px] font-black italic", `text-${accentColor}`)}>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-brand-blue/[0.03] rounded-full overflow-hidden border border-brand-blue/5">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 transition={{ duration: 1.5, ease: "circOut" }}
                 className={cn("h-full rounded-full bg-gradient-to-r", `from-${accentColor} to-blue-400`)}
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 py-8 border-y border-dashed border-brand-blue/10 mb-8">
            <div className="border-r border-brand-blue/5 pr-4">
              <p className="text-[9px] font-black tracking-[0.2em] text-brand-blue/40 mb-1 uppercase">Est. Gate Time</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={queueData.estimatedWaitTime}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-black text-brand-blue tracking-tighter"
                >
                  {liveTicket.status === 'serving' ? 'NOW' : `~${queueData.estimatedWaitTime}`}
                  <span className="text-xs font-bold text-brand-blue/20 ml-1">MIN</span>
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="pl-4">
              <p className="text-[9px] font-black tracking-[0.2em] text-brand-blue/40 mb-1 uppercase">Current Rank</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={queueData.position}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn("text-3xl font-black tracking-tighter", `text-${accentColor}`)}
                >
                  {liveTicket.status === 'serving' ? 'Active' : `#${queueData.position}`}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <motion.div 
            key={queueData.message}
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: 1, 
              x: 0,
            }}
            className="flex items-center gap-4 p-5 rounded-[24px] bg-brand-blue/[0.01] border border-brand-blue/5 mb-8"
          >
            <div className="w-10 h-10 rounded-2xl bg-white shadow-soft flex items-center justify-center shrink-0 border border-brand-blue/5">
               <Activity className={cn("w-5 h-5", `text-${accentColor}`)} />
            </div>
            <p className="text-[10px] font-black tracking-widest text-brand-blue/80 uppercase leading-relaxed">
              {queueData.message}
            </p>
          </motion.div>

          {/* PERFORATION LINE */}
          <div className="flex items-center gap-2 mb-8 opacity-20">
             <div className="h-px flex-1 border-t-2 border-dashed border-brand-blue" />
          </div>

          <div className="flex flex-col gap-4">
             <div className="flex gap-4">
                <button className="flex-1 px-6 py-5 rounded-2xl bg-brand-blue text-white text-[10px] font-black tracking-widest hover:bg-brand-blue/90 hover:-translate-y-1 hover:shadow-premium transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer uppercase shadow-lg shadow-brand-blue/10">
                   <Download className="w-4 h-4" /> Save Pass
                </button>
                <button className="w-16 h-16 rounded-2xl border-2 border-brand-blue/5 flex items-center justify-center text-brand-blue/40 hover:text-brand-accent hover:border-brand-accent/20 hover:bg-brand-accent/5 transition-all duration-300 cursor-pointer">
                   <Share2 className="w-5 h-5" />
                </button>
             </div>
             
             <div className="flex items-center justify-between mt-2">
                <div className="flex flex-col">
                   <span className="text-[7px] font-black text-brand-blue/20 tracking-[0.4em] uppercase mb-1">Pass Hash</span>
                   <span className="text-[9px] font-mono font-bold text-brand-blue/30">{liveTicket.id.substring(0, 16).toUpperCase()}</span>
                </div>
                <button 
                    onClick={handleUndo}
                    className="flex items-center gap-2 text-[8px] font-black text-red-500/40 hover:text-red-500 transition-colors uppercase cursor-pointer"
                >
                    <RotateCcw className="w-3 h-3" /> Cancel Protocol
                </button>
             </div>
          </div>
        </div>

        {/* BARCODE SECTION (Jesko Style) */}
        <div className="px-10 py-8 bg-brand-blue/[0.02] border-t border-brand-blue/5 flex items-center justify-between rounded-b-[40px]">
           <div className="flex flex-col gap-1 opacity-40 group hover:opacity-100 transition-opacity">
              <div className="flex gap-[2px]">
                 {[2,4,1,6,2,8,3,5,2,4,7,2,1,5,3,4,2,6,1,3,2,5].map((w, i) => (
                    <div key={i} className="bg-brand-blue" style={{ width: `${w}px`, height: '24px' }} />
                 ))}
              </div>
              <span className="text-[7px] font-mono font-bold text-brand-blue/40 tracking-[0.5em] text-center uppercase">Secure Protocol Auth</span>
           </div>
           <QrCode className="w-8 h-8 text-brand-blue/10" />
        </div>
      </motion.div>
    </div>
  );
}
