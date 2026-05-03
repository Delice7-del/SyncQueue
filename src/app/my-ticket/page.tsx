"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import TicketCard from '@/components/TicketCard';
import { useQueueStore } from '@/store/useQueueStore';
import { Ticket } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';

function TicketContent() {
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('id');
  const { tickets, initialized } = useQueueStore();
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (initialized && ticketId) {
      const found = tickets.find(t => t.id === ticketId);
      setTicket(found || null);
    }
  }, [ticketId, tickets, initialized]);

  if (!initialized) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <RefreshCw className="w-12 h-12 text-brand-blue animate-spin" />
        <p className="font-heading text-2xl font-black tracking-widest animate-pulse">INITIALIZING DATA...</p>
      </div>
    );
  }

  if (!ticketId || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h2 className="font-heading text-4xl font-black text-white mb-4">PROTOCOL NOT FOUND</h2>
        <p className="text-white/40 mb-8 max-w-sm uppercase tracking-widest text-[10px]">The requested ticket identifier does not exist in the local or cloud environment.</p>
        <Link href="/" className="px-8 py-3 rounded-2xl bg-brand-blue text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
          Return to Initialization
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-8">
        <Link href="/" className="group flex items-center gap-3 text-white/40 hover:text-brand-blue transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Home / Core</span>
        </Link>
        <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
          <Share2 className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Share Protocol</span>
        </button>
      </div>

      {/* Ticket Visualization */}
      <div className="py-8">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-5xl md:text-7xl font-black text-white italic tracking-tighter"
          >
            ACTIVE <span className="text-brand-blue uppercase not-italic">SESSION</span>
          </motion.h1>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mt-2">Personal Tracking Interface</p>
        </div>

        <TicketCard ticket={ticket} />
      </div>

      {/* Instructions / Info */}
      <div className="max-w-2xl mx-auto w-full">
         <div className="glass-dark p-8 rounded-[32px] border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue/30"></div>
            <h4 className="font-heading text-xl font-black text-white mb-4 uppercase italic">Important Protocol</h4>
            <ul className="space-y-4">
               {[
                 'Ensure your mobile device remains connected for real-time sync.',
                 'Approach the department desk when your status changes to "SERVING".',
                 'Keep this digital pass ready for scan authorization.',
               ].map((text, i) => (
                 <li key={i} className="flex gap-4 text-xs font-medium text-white/40 leading-relaxed italic">
                    <span className="text-brand-blue font-black not-italic">0{i+1}</span>
                    {text}
                 </li>
               ))}
            </ul>
         </div>
      </div>
    </div>
  );
}

export default function MyTicketPage() {
  return (
    <Layout>
      <Suspense fallback={<div>Loading search params...</div>}>
        <TicketContent />
      </Suspense>
    </Layout>
  );
}
