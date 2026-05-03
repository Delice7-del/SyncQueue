"use client";

import React, { useEffect } from 'react';
import { useQueueStore } from '@/store/useQueueStore';
import { startQueueSimulation } from '@/lib/simulation';
import { Wifi, WifiOff, RefreshCw, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { init, isOffline, isSyncing } = useQueueStore();

  useEffect(() => {
    init();
    startQueueSimulation();
  }, [init]);

  return (
    <div className="relative min-h-screen w-full bg-bg-navy overflow-hidden font-body selection:bg-brand-blue/30">
      {/* Layered Diagonal Background */}
      <div className="diagonal-bg"></div>
      
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-purple/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-6 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto group cursor-pointer">
          <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:border-brand-blue/50 transition-all duration-500">
            <span className="font-heading text-sm font-black tracking-tighter text-brand-blue">SQ</span>
          </div>
          <span className="font-heading text-sm font-black tracking-[0.3em] text-white/90">SYNCQUEUE</span>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          <Link href="/dashboard" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-blue/40 transition-all group">
             <BarChart3 className="w-3.5 h-3.5 text-white/40 group-hover:text-brand-blue transition-colors" />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Admin Dashboard</span>
          </Link>

          <AnimatePresence>
            {isSyncing && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-brand-blue animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Syncing...</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-500",
            isOffline 
              ? "bg-red-500/10 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
              : "bg-green-500/10 border border-green-500/30"
          )}>
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Offline Mode</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-green-500">System Online</span>
              </>
            )}
          </div>
        </div>
      </div>

      <main className="relative z-10 pt-24 pb-16 px-8 max-w-7xl mx-auto">
        {children}
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 px-8 py-10 border-t border-white/5 flex justify-between items-end opacity-40">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-2">Developed by</p>
          <p className="font-heading text-xl font-black tracking-tighter text-white">ANTIGRAVITY <span className="text-brand-blue">SYSTEMS</span></p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">© 2026 SyncQueue Protocol. V1.0</p>
        </div>
      </footer>
    </div>
  );
}
