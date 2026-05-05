"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Heart, Plus, Zap, Circle } from 'lucide-react';

const icons = [Activity, ShieldCheck, Heart, Plus, Zap, Circle];

export default function BackgroundParticles() {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * -20,
      iconIndex: Math.floor(Math.random() * icons.length),
      opacity: Math.random() * 0.05 + 0.02,
    }));
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
      {particles.map((p) => {
        const Icon = icons[p.iconIndex];
        return (
          <motion.div
            key={p.id}
            initial={{ 
              x: `${p.x}%`, 
              y: `${p.y}%`, 
              opacity: 0,
              rotate: 0 
            }}
            animate={{ 
              y: [`${p.y}%`, `${(p.y + 15) % 100}%`, `${p.y}%`],
              x: [`${p.x}%`, `${(p.x + 5) % 100}%`, `${p.x}%`],
              opacity: [p.opacity, p.opacity * 2, p.opacity],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: p.duration, 
              repeat: Infinity, 
              ease: "linear",
              delay: p.delay
            }}
            style={{ 
              position: 'absolute',
              width: p.size,
              height: p.size,
            }}
          >
            <Icon 
              className="w-full h-full text-brand-blue" 
              strokeWidth={1}
            />
          </motion.div>
        );
      })}
      
      {/* Subtle Grid Lines */}
      <div className="absolute inset-0 opacity-[0.02]" 
           style={{ 
             backgroundImage: 'radial-gradient(circle, #0A2540 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }} 
      />
    </div>
  );
}
