"use client";

import React from 'react';
import { useQueueStore } from '@/store/useQueueStore';
import { Wifi, WifiOff, Zap, SignalHigh, SignalLow, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function NetworkStatus() {
  const { networkStatus, initialized } = useQueueStore();

  if (!initialized) return null;

  const statusConfig = {
    strong: { icon: SignalHigh, text: 'Strong network', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    fair: { icon: Wifi, text: 'Fair connection', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    poor: { icon: SignalLow, text: 'Slow network', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    offline: { icon: WifiOff, text: 'Offline protocol', color: 'text-red-500', bg: 'bg-red-500/10' }
  };

  const current = statusConfig[networkStatus];
  const Icon = current.icon;

  return (
    <div className="fixed top-6 right-6 z-[200]">
      <AnimatePresence mode="wait">
        <motion.div
          key={networkStatus}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className={cn(
            "px-4 py-2 rounded-2xl backdrop-blur-xl border border-white/10 shadow-premium flex items-center gap-3 transition-colors duration-500",
            current.bg
          )}
        >
          <div className="relative">
             <Icon className={cn("w-4 h-4", current.color)} />
             {networkStatus === 'strong' && (
               <motion.div 
                 animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
               />
             )}
          </div>
          
          <div className="flex flex-col">
            <span className={cn("text-[9px] font-black uppercase tracking-widest", current.color)}>
              {current.text}
            </span>
            {networkStatus === 'poor' && (
              <span className="text-[7px] font-bold text-orange-500/60 -mt-0.5">
                Latency detected
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
