"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import TicketCard from '@/components/TicketCard';
import { useQueueStore } from '@/store/useQueueStore';
import { Ticket } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowLeft, Share2, Info, X } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center py-32 gap-8">
        <div className="relative">
           <RefreshCw className="w-16 h-16 text-brand-accent animate-spin" />
           <div className="absolute inset-0 bg-brand-accent/20 blur-2xl rounded-full"></div>
        </div>
        <p className="font-heading text-3xl font-black text-brand-blue animate-pulse italic">Initializing protocol...</p>
      </div>
    );
  }

  if (!ticketId || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-lg bg-red-50 flex items-center justify-center mb-8 border border-red-100">
           <Info className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="font-heading text-5xl font-black text-brand-blue mb-4 italic tracking-tighter">Protocol error</h2>
        <p className="text-brand-blue/40 mb-10 font-medium leading-relaxed">The requested session identifier could not be located in the secure local environment. Please re-authenticate.</p>
        <Link href="/" className="px-10 py-5 rounded-lg bg-brand-blue text-white font-black text-xs hover:bg-brand-accent transition-all">
          Return to home
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
          <span className="text-[10px] font-black uppercase tracking-widest">Exit session</span>
        </Link>
        <button className="flex items-center h-10 gap-2 px-5 rounded-lg bg-white border border-brand-blue/10 text-brand-blue/60 hover:text-brand-accent hover:border-brand-accent/30 transition-colors">
          <Share2 className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Share protocol</span>
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
            Active <span className="text-brand-accent not-italic">session.</span>
          </motion.h1>
          <p className="text-[10px] font-black text-brand-blue/20 mt-2 ml-4">Authorized personal interface</p>
        </div>

        <TicketCard ticket={ticket} />
      </div>

      {/* Instructions / Info */}
      <div className="max-w-2xl mx-auto w-full">
         <div className="bg-white p-10 rounded-lg border border-brand-blue/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-brand-accent opacity-20 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="flex items-center gap-4 mb-8">
               <Info className="w-6 h-6 text-brand-accent" />
               <h4 className="font-heading text-2xl font-black text-brand-blue italic tracking-tight">Security directives</h4>
            </div>
            <ul className="space-y-6">
               {[
                 'Maintain active connection for edge synchronization.',
                 'Proceed to department upon "SERVING" status update.',
                 'Digital pass authorization required for entry.',
               ].map((text, i) => (
                 <li key={i} className="flex gap-6 text-sm font-bold text-brand-blue/50 leading-relaxed italic">
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

export default function MyTicketPage() {
  return (
    <Layout>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-32 gap-8">
          <RefreshCw className="w-12 h-12 text-brand-accent animate-spin" />
          <p className="font-heading text-xl font-black text-brand-blue animate-pulse italic">Syncing search params...</p>
        </div>
      }>
        <TicketContent />
      </Suspense>
    </Layout>
  );
}
