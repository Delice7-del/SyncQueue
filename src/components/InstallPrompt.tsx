"use client";

import React from 'react';
import { useQueueStore } from '@/store/useQueueStore';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function InstallPrompt() {
  const { canInstall, installApp } = useQueueStore();
  const [dismissed, setDismissed] = React.useState(false);

  // If already installed or dismissed this session, don't show
  if (!canInstall || dismissed) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-6">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-brand-blue/90 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl border border-white/10 flex items-center gap-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
             <Smartphone className="w-7 h-7 text-brand-accent" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-heading text-lg font-black text-white italic tracking-tight">SyncQueue Mobile.</h4>
            <p className="text-[10px] font-medium text-white/60 leading-tight">
              Install for high-precision real-time tracking and offline access.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
             <button 
               onClick={installApp}
               className="px-4 py-2 rounded-xl bg-brand-accent text-brand-blue font-black text-[10px] hover:bg-white transition-colors"
             >
               Install
             </button>
             <button 
               onClick={() => setDismissed(true)}
               className="text-[9px] font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest text-center"
             >
               Later
             </button>
          </div>
          
          <button 
            onClick={() => setDismissed(true)}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-3 h-3 text-white/40" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
