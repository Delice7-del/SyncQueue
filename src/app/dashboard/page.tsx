"use client";

import React from 'react';
import Layout from '@/components/Layout';
import QueueDisplay from '@/components/QueueDisplay';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, BarChart3, Zap } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-16">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-10 border-b border-brand-blue/5 pb-8">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-10 h-px bg-brand-accent"></div>
            <span className="text-[10px] font-black text-brand-accent">Administrative protocol</span>
          </motion.div>
          <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tighter text-brand-blue italic leading-none">
            Queue <span className="text-brand-blue/20 not-italic">monitor.</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
           <div className="bg-white px-6 py-4 rounded-lg border border-brand-blue/5 flex items-center gap-5">
              <div className="w-12 h-12 rounded-lg bg-brand-blue/[0.03] flex items-center justify-center">
                 <BarChart3 className="w-6 h-6 text-brand-blue" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-brand-blue/20 mb-0.5">Throughput</p>
                 <p className="text-2xl font-black text-brand-blue italic tracking-tighter">98.4%</p>
              </div>
           </div>
           <div className="bg-white px-6 py-4 rounded-lg border border-brand-blue/5 flex items-center gap-5">
              <div className="w-12 h-12 rounded-lg bg-brand-accent/5 flex items-center justify-center">
                 <ShieldCheck className="w-6 h-6 text-brand-accent" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-brand-blue/20 mb-0.5">Security</p>
                 <p className="text-2xl font-black text-brand-accent italic tracking-tighter">AES-256</p>
              </div>
           </div>
        </div>
      </div>

      {/* Full Queue View */}
      <section className="relative z-10">
         <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-brand-blue/[0.03] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-brand-blue animate-pulse" />
               </div>
               <h2 className="font-heading text-3xl font-black text-brand-blue tracking-tight italic">Active streams</h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-lg bg-brand-accent/5 border border-brand-accent/10">
               <Zap className="w-3 h-3 text-brand-accent" />
               <span className="text-[9px] font-black text-brand-accent">Real-time node</span>
            </div>
         </div>
         
         <QueueDisplay />
      </section>

      {/* Dashboard Stats / Background Elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
         <div className="p-8 rounded-lg bg-white border border-brand-blue/5 flex flex-col items-center justify-center text-center group hover:bg-brand-blue/[0.01] transition-all duration-700">
            <div className="w-1 h-12 bg-brand-blue/10 rounded-full mb-8 group-hover:bg-brand-accent transition-colors duration-700"></div>
            <span className="text-[10px] font-black text-brand-blue/20">Telemetry alpha</span>
            <p className="text-xs font-bold text-brand-blue/40 mt-4 max-w-[200px]">Synchronized with edge nodes for minimal latency tracking.</p>
         </div>
         <div className="p-8 rounded-lg bg-white border border-brand-blue/5 flex flex-col items-center justify-center text-center group hover:bg-brand-blue/[0.01] transition-all duration-700">
            <div className="w-1 h-12 bg-brand-blue/10 rounded-full mb-8 group-hover:bg-brand-accent transition-colors duration-700"></div>
            <span className="text-[10px] font-black text-brand-blue/20">Telemetry beta</span>
            <p className="text-xs font-bold text-brand-blue/40 mt-4 max-w-[200px]">Encrypted protocol verification across global instances.</p>
         </div>
      </div>
    </div>
  );
}
