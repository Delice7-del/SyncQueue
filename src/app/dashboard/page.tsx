"use client";

import React from 'react';
import Layout from '@/components/Layout';
import QueueDisplay from '@/components/QueueDisplay';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  return (
    <Layout>
      <div className="flex flex-col gap-12">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 pb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-8 h-px bg-brand-blue"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-blue">Administrative Control</span>
            </motion.div>
            <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tighter text-white italic">
              QUEUE <span className="text-white/20 uppercase not-italic">MONITOR</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
             <div className="glass-dark px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4">
                <BarChart3 className="w-6 h-6 text-brand-blue" />
                <div>
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Efficiency</p>
                   <p className="text-xl font-black text-white italic tracking-tighter">98.4%</p>
                </div>
             </div>
             <div className="glass-dark px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4">
                <ShieldCheck className="w-6 h-6 text-brand-blue" />
                <div>
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Protocol</p>
                   <p className="text-xl font-black text-white italic tracking-tighter">SECURE</p>
                </div>
             </div>
          </div>
        </div>

        {/* Full Queue View */}
        <section className="relative z-10">
           <div className="flex items-center gap-4 mb-10">
              <Activity className="w-5 h-5 text-brand-blue animate-pulse" />
              <h2 className="font-heading text-2xl font-black text-white/60 tracking-tight">Active Department Streams</h2>
           </div>
           
           <QueueDisplay />
        </section>

        {/* Dashboard Stats / Background Elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-20">
           <div className="h-32 rounded-3xl border border-dashed border-white/10 flex items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-[1em]">Telemetry Stream A</span>
           </div>
           <div className="h-32 rounded-3xl border border-dashed border-white/10 flex items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-[1em]">Telemetry Stream B</span>
           </div>
        </div>
      </div>
    </Layout>
  );
}
