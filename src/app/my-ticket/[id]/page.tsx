"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TicketCard from '@/components/TicketCard';
import { useQueueStore } from '@/store/useQueueStore';
import { Ticket } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Share2, Info } from 'lucide-react';
import Link from 'next/link';

export default function DynamicTicketPage() {
  const { id } = useParams();
  const router = useRouter();
  const { tickets, initialized } = useQueueStore();
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (initialized && id) {
      const found = tickets.find(t => t.id === id);
      setTicket(found || null);
    }
  }, [id, tickets, initialized]);

  if (!initialized) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-8">
        <div className="relative">
           <RefreshCw className="w-16 h-16 text-brand-accent animate-spin" />
           <div className="absolute inset-0 bg-brand-accent/20 blur-2xl rounded-full"></div>
        </div>
        <p className="font-heading text-3xl font-black text-brand-blue tracking-[0.2em] animate-pulse italic">INITIALIZING PROTOCOL...</p>
      </div>
    );
  }

  if (!id || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-lg bg-red-50 flex items-center justify-center mb-8 border border-red-100">
           <Info className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="font-heading text-5xl font-black text-brand-blue mb-4 italic tracking-tighter">PROTOCOL ERROR</h2>
        <p className="text-brand-blue/40 mb-10 font-medium leading-relaxed">The requested session identifier could not be located in the secure local environment. Please re-authenticate.</p>
        <Link href="/" className="px-10 py-5 rounded-lg bg-brand-blue text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-accent transition-all">
          RETURN TO HOME
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-16">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-brand-blue/5 pb-6 pt-2 mb-2">
        <Link href="/" className="group flex items-center h-10 gap-3 text-brand-blue/60 hover:text-brand-accent transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:bg-red-500 group-hover:border-red-500 transition-all duration-300">
            <X className="w-4 h-4 text-red-500 group-hover:text-white transition-colors" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">Exit Session</span>
        </Link>
        <button className="flex items-center h-10 gap-2 px-5 rounded-lg bg-white border border-brand-blue/10 text-brand-blue/60 hover:text-brand-accent hover:border-brand-accent/30 transition-colors">
          <Share2 className="w-3.5 h-3.5" />
          <span className="text-[11px] font-black uppercase tracking-widest hidden sm:inline">Share Protocol</span>
        </button>
      </div>

      {/* Ticket Visualization */}
      <div className="py-4">
        <div className="text-center mb-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-6xl md:text-8xl font-black text-brand-blue italic tracking-tighter leading-none"
          >
            ACTIVE <span className="text-brand-accent uppercase not-italic">SESSION.</span>
          </motion.h1>
          <p className="text-[11px] font-black text-brand-blue/30 uppercase tracking-[0.8em] mt-2 ml-4">Authorized Personal Interface</p>
        </div>

        <TicketCard ticket={ticket} />
      </div>

      {/* Instructions / Info */}
      <div className="max-w-2xl mx-auto w-full">
         <div className="bg-white p-10 rounded-lg border border-brand-blue/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-brand-accent opacity-20 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="flex items-center gap-4 mb-8">
               <Info className="w-6 h-6 text-brand-accent" />
               <h4 className="font-heading text-2xl font-black text-brand-blue uppercase italic tracking-tight">Security Directives</h4>
            </div>
            <ul className="space-y-6">
               {[
                 'Maintain active connection for edge synchronization.',
                 'Proceed to department upon "SERVING" status update.',
                 'Digital pass authorization required for entry.',
               ].map((text, i) => (
                 <li key={i} className="flex gap-6 text-[15px] font-bold text-brand-blue/80 leading-relaxed italic">
                    <span className="text-brand-accent font-black not-italic text-lg">0{i+1}</span>
                    {text}
                 </li>
               ))}
            </ul>
         </div>
      </div>
    </div>
  );
}
