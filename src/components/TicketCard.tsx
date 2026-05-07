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
  QrCode,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueueStore } from '@/store/useQueueStore';
import { Ticket } from '@/lib/db';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const { getQueueData, tickets, deleteTicket } = useQueueStore();
  const [queueData, setQueueData] = useState(getQueueData(ticket.id));
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
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

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUndo = async () => {
    if (confirm('Undo ticket creation? This will remove you from the queue protocol.')) {
      await deleteTicket(ticket.id);
      router.push('/');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'SyncQueue Ticket',
      text: `My queue position for ${ticket.service} is #${queueData.position}. Check it live!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showNotification('Link copied to clipboard', 'info');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  const handleSave = () => {
    // Simulate wallet pass generation
    showNotification('Ticket saved to protocol wallet', 'success');
  };

  const serviceLabels = {
    consultation: 'General consultation',
    lab: 'Laboratory analysis',
    pharmacy: 'Pharmacy supply'
  };

  const getAccentColor = (service: Ticket['service']) => {
    return 'brand-blue';
  };

  const accentColor = getAccentColor(liveTicket.service);

  // Calculate progress (just for visual flair)
  const progress = Math.max(5, 100 - (queueData.position * 15));

  return (
    <div className="w-full h-full flex items-center justify-center py-4 relative">
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl bg-brand-blue text-white shadow-2xl flex items-center gap-3 border border-white/10"
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Info className="w-4 h-4 text-brand-accent" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ 
          scale: 1.02,
          rotateY: 2,
          rotateX: -2,
          transition: { duration: 0.4, ease: "easeOut" }
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-[320px] bg-white rounded-lg border border-brand-blue/5 relative overflow-visible group/card"
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

        <div className="p-6 pb-2 relative z-10 overflow-hidden">
          {/* Shimmer Effect on Hover */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full -skew-x-12 z-20 pointer-events-none"
            initial={{ x: '-100%' }}
            whileHover={{ 
              x: '200%', 
              transition: { duration: 0.8, ease: "easeInOut" } 
            }}
          />
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className={cn("text-[9px] font-medium mb-1", `text-${accentColor}`)}>Health protocol</span>
              <h2 className="text-xl font-black text-brand-blue tracking-tighter italic leading-tight">
                {serviceLabels[liveTicket.service].toLowerCase()}
              </h2>
            </div>
            <motion.div 
              key={liveTicket.status}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "px-4 py-2 rounded-lg border font-medium text-[9px]",
                liveTicket.status === 'serving' ? "bg-green-50 border-green-200 text-green-600" :
                liveTicket.status === 'done' ? "bg-brand-blue text-white" : "bg-amber-50 border-amber-200 text-amber-600"
              )}
            >
              {liveTicket.status === 'serving' ? 'Serving' : liveTicket.status.charAt(0).toUpperCase() + liveTicket.status.slice(1)}
            </motion.div>
          </div>

          <div className="mb-4">
            <div className="flex items-end justify-between mb-2">
               <p className="text-[10px] font-medium text-brand-blue/40">Boarding sequence</p>
               <span className="text-[10px] font-medium text-brand-accent italic">04 May 26</span>
            </div>
            <p className="font-heading text-5xl font-black tracking-tighter text-brand-blue leading-none">
              {liveTicket.number < 100 ? (liveTicket.service === 'consultation' ? 'CN' : liveTicket.service === 'lab' ? 'LB' : 'PH') : ''}
              <span className={cn(`text-${accentColor}`)}>-{String(liveTicket.number).padStart(3, '0')}</span>
            </p>
          </div>

          {/* Progress Bar (Jesko Style) */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
               <span className="text-[9px] font-medium text-brand-blue/30 italic">Waiting progress</span>
               <span className={cn("text-[10px] font-medium italic", `text-${accentColor}`)}>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-brand-blue/[0.03] rounded-full overflow-hidden border border-brand-blue/5">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 transition={{ duration: 1.5, ease: "circOut" }}
                 className={cn("h-full rounded-full bg-brand-blue")}
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-y border-dashed border-brand-blue/10 mb-4">
            <div className="border-r border-brand-blue/5 pr-4">
              <p className="text-[9px] font-medium text-brand-blue/40 mb-1">Est. gate time</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={queueData.estimatedWaitTime}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-medium text-brand-blue tracking-tighter"
                >
                  {liveTicket.status === 'serving' ? 'Now' : `~${queueData.estimatedWaitTime}`}
                  <span className="text-xs font-medium text-brand-blue/20 ml-1">min</span>
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="pl-4">
              <p className="text-[9px] font-medium text-brand-blue/40 mb-1">Current rank</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={queueData.position}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn("text-2xl font-medium tracking-tighter", `text-${accentColor}`)}
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
            className="flex items-center gap-4 p-4 rounded-lg bg-brand-blue/[0.01] border border-brand-blue/5 mb-4"
          >
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 border border-brand-blue/5">
               <Activity className={cn("w-5 h-5", `text-${accentColor}`)} />
            </div>
            <p className="text-[10px] font-medium text-brand-blue/80 leading-relaxed">
               {queueData.message}
            </p>
          </motion.div>

          {/* PERFORATION LINE */}
          <div className="flex items-center gap-2 mb-4 opacity-20">
             <div className="h-px flex-1 border-t-2 border-dashed border-brand-blue" />
          </div>

          <div className="flex flex-col gap-4">
             <div className="flex gap-4">
                <button 
                  onClick={handleSave}
                  className="flex-1 px-4 py-3 rounded-lg bg-brand-blue text-white text-[10px] font-medium hover:bg-brand-blue/90 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-brand-blue/10"
                >
                   <Download className="w-4 h-4" /> Save pass
                </button>
                <button 
                  onClick={handleShare}
                  className="w-12 h-12 rounded-lg border-2 border-brand-blue/5 flex items-center justify-center text-brand-blue/40 hover:text-brand-accent hover:border-brand-accent/20 hover:bg-brand-accent/5 transition-all duration-300 cursor-pointer"
                >
                   <Share2 className="w-5 h-5" />
                </button>
             </div>
             
             <div className="flex items-center justify-between mt-2">
                <div className="flex flex-col">
                   <span className="text-[7px] font-medium text-brand-blue/20 mb-1">Pass hash</span>
                   <span className="text-[9px] font-mono font-medium text-brand-blue/30">{liveTicket.id.substring(0, 16)}</span>
                </div>
                <button 
                    onClick={handleUndo}
                    className="flex items-center gap-2 text-[8px] font-medium text-red-500/40 hover:text-red-500 transition-colors cursor-pointer"
                >
                    <RotateCcw className="w-3 h-3" /> Cancel protocol
                </button>
             </div>
          </div>
        </div>

        {/* BARCODE SECTION (Jesko Style) */}
        <div className="px-6 py-4 bg-brand-blue/[0.02] border-t border-brand-blue/5 flex items-center justify-between rounded-b-lg">
           <div className="flex flex-col gap-1 opacity-40 group hover:opacity-100 transition-opacity">
              <div className="flex gap-[2px]">
                 {[2,4,1,6,2,8,3,5,2,4,7,2,1,5,3,4,2,6,1,3,2,5].map((w, i) => (
                    <div key={i} className="bg-brand-blue" style={{ width: `${w}px`, height: '16px' }} />
                 ))}
              </div>
              <span className="text-[7px] font-mono font-medium text-brand-blue/40 text-center">Secure protocol auth</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <RefreshCw className="w-3 h-3 text-brand-accent animate-spin-slow" />
                 <span className="text-[8px] font-medium text-brand-blue/60">Syncing protocol</span>
              </div>
              <div className="flex gap-1">
                 {[0, 1, 2].map((i) => (
                    <motion.div 
                       key={i}
                       animate={{ opacity: [0.2, 1, 0.2] }}
                       transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                       className="w-1 h-1 rounded-full bg-brand-accent"
                    />
                 ))}
              </div>
           </div>
           <QrCode className="w-8 h-8 text-brand-blue/10" />
        </div>
      </motion.div>
    </div>
  );
}
