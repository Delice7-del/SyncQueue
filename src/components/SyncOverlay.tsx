"use client";

import React from 'react';
import { useQueueStore } from '@/store/useQueueStore';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SyncOverlay() {
  const { isSyncing } = useQueueStore();

  return (
    <AnimatePresence>
      {isSyncing && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[300]"
        >
          <div className="bg-brand-blue/90 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl">
            <RefreshCw className="w-4 h-4 text-brand-accent animate-spin" />
            <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] italic">
              Synchronizing protocol...
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
