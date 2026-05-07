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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-brand-blue/90 backdrop-blur-2xl rounded-lg p-4 border border-white/10 flex items-center gap-4 relative shadow-2xl"
        >
          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
             <Smartphone className="w-6 h-6 text-brand-accent" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-heading text-base font-black text-white italic tracking-tight">SyncQueue Mobile.</h4>
            <p className="text-[9px] font-medium text-white/50 leading-tight">
              Instant real-time tracking and offline access.
            </p>
          </div>
          
          <div className="flex flex-col gap-2 min-w-[80px]">
             <button 
               onClick={installApp}
               className="px-4 py-2 rounded-lg bg-white text-brand-blue font-bold text-[9px] cursor-pointer hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-300"
             >
               Install
             </button>
             <button 
               onClick={() => setDismissed(true)}
               className="text-[8px] font-black text-white/40 cursor-pointer hover:text-white hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-widest text-center"
             >
               Later
             </button>
          </div>
          
          <button 
            onClick={() => setDismissed(true)}
            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-brand-blue border border-white/10 hover:bg-brand-accent transition-colors cursor-pointer shadow-lg"
          >
            <X className="w-2.5 h-2.5 text-white" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
