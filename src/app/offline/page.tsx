"use client";

import React from 'react';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 border border-brand-blue/5 relative overflow-hidden"
      >
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/20 via-red-500 to-red-500/20" />
        
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center relative">
            <WifiOff className="w-10 h-10 text-red-500" />
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-red-500 rounded-full -z-10"
            />
          </div>
        </div>

        <h1 className="font-heading text-3xl font-black text-brand-blue tracking-tighter italic mb-4">
          Protocol Interrupted.
        </h1>
        
        <p className="text-sm text-brand-blue/60 mb-8 leading-relaxed">
          The network synchronization has been suspended. Please check your connection to restore the real-time hospital queue stream.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-brand-blue/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-blue/20"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
          
          <Link 
            href="/"
            className="w-full py-4 rounded-xl bg-brand-blue/5 text-brand-blue font-bold text-sm hover:bg-brand-blue/10 transition-all flex items-center justify-center gap-3"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>

        <div className="mt-10 pt-6 border-t border-brand-blue/5">
          <p className="text-[10px] font-medium text-brand-blue/30 uppercase tracking-[0.2em]">
            SyncQueue Offline Protocol Active
          </p>
        </div>
      </motion.div>
    </div>
  );
}
