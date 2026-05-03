"use client";

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import TicketCard from '@/components/TicketCard';
import QueueDisplay from '@/components/QueueDisplay';
import { useQueueStore } from '@/store/useQueueStore';
import { Ticket } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Microscope, Pill, ArrowRight, ChevronRight, QrCode, RefreshCw, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function Home() {
  const { createTicket, tickets } = useQueueStore();
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);

  const handleTakeTicket = async (service: Ticket['service']) => {
    setIsIssuing(true);
    // Add a slight delay for "premium" feel
    await new Promise(r => setTimeout(r, 1200));
    const ticket = await createTicket(service);
    setActiveTicket(ticket);
    setIsIssuing(false);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-24">
        {/* Hero Section */}
        <div className="flex flex-col xl:flex-row justify-between items-center xl:items-end gap-12 text-center xl:text-left">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-center xl:justify-start gap-4 mb-8"
            >
              <div className="w-12 h-px bg-brand-blue/50"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-blue">Protocol-Based Queue Management</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="font-heading text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-white mb-8 italic"
            >
              PRECISION <br />
              <span className="text-white/10 uppercase not-italic">FLOW CONTROL.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-white/40 max-w-xl leading-relaxed font-medium italic"
            >
              SyncQueue leverages secure protocols to streamline patient movement. 
              Real-time synchronization for high-end healthcare environments.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="flex flex-col gap-4 relative"
          >
             {/* Floating Glow */}
             <div className="absolute inset-0 bg-brand-blue/20 blur-3xl rounded-full"></div>
             <div className="relative glass-dark p-6 rounded-[32px] border border-white/10 flex items-center gap-5 shadow-2xl backdrop-blur-3xl group cursor-pointer hover:border-brand-blue/40 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20 group-hover:scale-110 transition-transform duration-500">
                   <QrCode className="w-7 h-7 text-brand-blue" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Secure Protocol</p>
                   <p className="text-base font-black text-white italic tracking-tight">SCAN TO AUTHORIZE</p>
                </div>
             </div>
          </motion.div>
        </div>

        {/* Live Status Dashboard */}
        <section className="relative">
          <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
            <div>
              <h2 className="font-heading text-4xl font-black tracking-tighter text-white italic">Live Dashboard</h2>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-1">Real-Time Synchronization Active</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-brand-blue animate-ping"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-blue">Sync Mode: 1ms</span>
            </div>
          </div>
          <QueueDisplay />
        </section>

        {/* Action Section */}
        <section className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 to-brand-purple/5 rounded-[48px] blur-3xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative z-10 glass-dark py-24 px-12 rounded-[48px] border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Activity className="w-64 h-64 text-white -mr-32 -mt-32" />
            </div>
            
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <h2 className="font-heading text-5xl md:text-6xl font-black tracking-tighter text-white mb-4 italic">
                  INITIALIZE <span className="text-white/20 uppercase not-italic">SESSION</span>
                </h2>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Select Department to Request Protocol</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {[
                  { id: 'consultation', label: 'Consultation', icon: Activity, desc: 'Medical Analysis' },
                  { id: 'lab', label: 'Laboratory', icon: Microscope, desc: 'Diagnostics Engine' },
                  { id: 'pharmacy', label: 'Pharmacy', icon: Pill, desc: 'Supplies Protocol' },
                ].map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    onClick={() => handleTakeTicket(item.id as Ticket['service'])}
                    disabled={isIssuing}
                    className="group relative glass rounded-[32px] p-10 border border-white/10 hover:border-brand-blue/40 transition-all duration-700 text-left overflow-hidden bg-white/[0.01] hover:bg-white/[0.03]"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 translate-x-6 group-hover:translate-x-0 transition-all duration-700">
                      <ChevronRight className="w-8 h-8 text-brand-blue" />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-brand-blue/10 group-hover:border-brand-blue/30 transition-all duration-700 mb-8 shadow-inner">
                      <item.icon className="w-7 h-7 text-white/40 group-hover:text-brand-blue transition-all duration-700" />
                    </div>
                    <h4 className="font-heading text-2xl font-black text-white mb-2 italic tracking-tight">{item.label}</h4>
                    <p className="text-xs font-bold text-white/20 group-hover:text-white/40 uppercase tracking-widest transition-all duration-700">{item.desc}</p>
                    
                    {/* Hover Glow */}
                    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-brand-blue/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Active Ticket Overlay */}
        <AnimatePresence>
          {activeTicket && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-bg-navy/90 backdrop-blur-2xl"
              onClick={() => setActiveTicket(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, x: -40 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0.9, opacity: 0, x: 40 }}
                className="w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-center mb-8">
                   <button 
                    onClick={() => setActiveTicket(null)}
                    className="flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                   >
                     <RefreshCw className="w-3 h-3 text-white/40 group-hover:rotate-180 transition-transform duration-700" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white transition-colors">Terminate View</span>
                   </button>
                </div>
                <TicketCard ticket={activeTicket} />
                <div className="mt-12 text-center flex flex-col items-center gap-6">
                  <Link 
                    href={`/my-ticket?id=${activeTicket.id}`}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-brand-blue text-white font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                  >
                    Go to Digital Pass
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Protocol Saved to Local Environment</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing Tickets Section (Conditional) */}
        {tickets.length > 0 && !activeTicket && (
          <section className="pb-12">
             <div className="flex justify-center">
                <Link 
                  href="/my-ticket?id=" 
                  onClick={(e) => {
                    e.preventDefault();
                    // Just go to the most recent one for simplicity in this demo link
                    const lastTicket = [...tickets].sort((a,b) => b.createdAt - a.createdAt)[0];
                    window.location.href = `/my-ticket?id=${lastTicket.id}`;
                  }}
                  className="px-10 py-5 rounded-[24px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all flex items-center gap-4 group"
                >
                   <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20">
                      <ShieldCheck className="w-5 h-5 text-brand-blue" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-0.5">Existing Protocol Detected</p>
                      <p className="text-sm font-black text-white italic tracking-tight uppercase group-hover:text-brand-blue transition-colors">Resume Active Session</p>
                   </div>
                   <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-brand-blue transition-colors ml-4" />
                </Link>
             </div>
          </section>
        )}

        {/* Issuing Overlay */}
        <AnimatePresence>
          {isIssuing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center bg-bg-navy/60 backdrop-blur-3xl"
            >
              <div className="flex flex-col items-center gap-8">
                <div className="relative">
                   <RefreshCw className="w-20 h-20 text-brand-blue animate-spin" />
                   <div className="absolute inset-0 bg-brand-blue/20 blur-2xl rounded-full"></div>
                </div>
                <div className="text-center">
                   <p className="font-heading text-4xl font-black tracking-widest text-white italic animate-pulse">GENERATING PROTOCOL...</p>
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.8em] mt-2">Connecting to Secure Engine</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
