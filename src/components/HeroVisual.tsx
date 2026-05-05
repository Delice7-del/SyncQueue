"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const FloatingNode = ({ delay = 0, x = 0, y = 0, size = 2 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.2, 0.5, 0.2], 
      scale: [1, 1.2, 1],
      x: [x, x + 10, x - 10, x],
      y: [y, y - 10, y + 10, y]
    }}
    transition={{ 
      duration: 5 + Math.random() * 5, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut" 
    }}
    className="absolute bg-brand-accent/40 rounded-full blur-[1px]"
    style={{ 
      width: size, 
      height: size, 
      left: `${50 + x}%`, 
      top: `${50 + y}%`,
      boxShadow: '0 0 10px var(--color-brand-accent)'
    }}
  />
);

export default function HeroVisual() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const nodes = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: 15 }).map((_, i) => ({
      delay: i * 0.5,
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
      size: 2 + Math.random() * 3
    }));
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-40 lg:opacity-100">
      <div className="relative w-full h-full max-w-[600px] max-h-[600px]">
        
        {/* ── CENTRAL CORE ── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 h-32 bg-brand-accent/20 rounded-full blur-[40px]"
          />
          <motion.div
            animate={{ 
              scale: [0.8, 1, 0.8],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 m-auto w-12 h-12 bg-brand-accent/40 rounded-full blur-[10px] border border-brand-accent/20"
          />
        </div>

        {/* ── 3D ROTATING RINGS ── */}
        <div className="absolute inset-0 flex items-center justify-center [perspective:1000px]">
          {/* Ring 1 - Vertical-ish */}
          <motion.div
            animate={{ rotateY: 360, rotateZ: 45 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute w-[300px] h-[300px] border border-brand-accent/20 rounded-full [transform-style:preserve-3d]"
          >
            <div className="absolute inset-0 border border-brand-accent/10 rounded-full blur-[1px]" />
          </motion.div>

          {/* Ring 2 - Horizontal-ish */}
          <motion.div
            animate={{ rotateX: 360, rotateZ: -45 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-[400px] h-[400px] border border-brand-accent/15 rounded-full [transform-style:preserve-3d]"
          >
             <div className="absolute inset-0 border border-brand-accent/5 rounded-full blur-[2px]" />
          </motion.div>

          {/* Ring 3 - Tilted */}
          <motion.div
            animate={{ rotateY: -360, rotateX: 180 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute w-[250px] h-[250px] border-t-2 border-brand-accent/30 rounded-full [transform-style:preserve-3d]"
          />
        </div>

        {/* ── RADAR SWEEP ── */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-10"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1/2 bg-gradient-to-t from-transparent to-brand-accent blur-[2px]" />
        </motion.div>

        {/* ── DATA NODES (FLOATING PARTICLES) ── */}
        {nodes.map((node, i) => (
          <FloatingNode key={i} {...node} />
        ))}

        {/* ── GLOWING LINES (CONNECTORS) ── */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 600 600">
          <motion.circle
            cx="300" cy="300" r="150"
            fill="none"
            stroke="var(--color-brand-accent)"
            strokeWidth="0.5"
            strokeDasharray="4 8"
            animate={{ strokeDashoffset: [0, -48] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle
            cx="300" cy="300" r="200"
            fill="none"
            stroke="var(--color-brand-accent)"
            strokeWidth="0.5"
            strokeDasharray="2 10"
            animate={{ strokeDashoffset: [0, 48] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>
    </div>
  );
}
