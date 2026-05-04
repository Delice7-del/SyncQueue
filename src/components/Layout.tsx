"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueueStore } from '@/store/useQueueStore';
import { 
  ShieldCheck, 
  Globe, 
  MessageCircle, 
  Share2, 
  Mail, 
  Info,
  Activity,
  Zap,
  LayoutDashboard,
  Home,
  RefreshCw,
  Wifi,
  WifiOff,
  ArrowRight,
  ChevronRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { startQueueSimulation, stopQueueSimulation } from '@/lib/simulation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { tickets, isOffline, init } = useQueueStore();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [activeHash, setActiveHash] = useState('');
  const [manualTab, setManualTab] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    init();
    
    const handleLocationChange = () => {
      setActiveHash(window.location.hash);
      if (window.location.hash === '#features') {
        setActiveHash('#features');
      } else {
        setActiveHash('');
      }
    };
    
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange();

    startQueueSimulation();

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
      stopQueueSimulation();
    };
  }, [init, pathname]);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'sync', label: 'Sync', icon: RefreshCw, href: '/#features' },
    { id: 'queue', label: 'Queue', icon: LayoutDashboard, href: '/dashboard' },
  ];

  const getActiveItem = () => {
    if (manualTab) return manualTab;
    if (pathname === '/dashboard') return 'queue';
    if (activeHash === '#features') return 'sync';
    return 'home';
  };

  const activeItem = getActiveItem();
  const activeIndex = navItems.findIndex(item => item.id === activeItem);

  useEffect(() => {
    setManualTab(null);
  }, [pathname]);

  const maskStyle = useMemo(() => {
    if (!mounted) return {};
    const xPercent = (activeIndex * 33.33) + 16.66; 
    const holeWidth = 22; 
    
    const maskSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="80" viewBox="0 0 400 80">
        <path d="M 0 0 L ${400 * (xPercent - holeWidth)/100} 0 
                 C ${400 * (xPercent - holeWidth/2)/100} 0 ${400 * (xPercent - holeWidth/2)/100} 42 ${400 * xPercent/100} 42
                 C ${400 * (xPercent + holeWidth/2)/100} 42 ${400 * (xPercent + holeWidth/2)/100} 0 ${400 * (xPercent + holeWidth)/100} 0
                 L 400 0 L 400 80 L 0 80 Z" fill="white" />
      </svg>
    `.replace(/\n/g, "").replace(/\s+/g, " ");

    const encoded = typeof window !== 'undefined' ? window.btoa(maskSvg) : '';
    const maskUrl = `url(data:image/svg+xml;base64,${encoded})`;
    
    return {
      WebkitMaskImage: maskUrl,
      maskImage: maskUrl
    } as React.CSSProperties;
  }, [activeIndex, mounted]);

  const legalContent = {
    privacy: {
      title: "Privacy Protocol",
      content: "SyncQueue operates on an offline-first architecture. All patient data and ticket sequences are stored locally in your browser's IndexedDB. We do not transmit medical identities or personal data to third-party servers. Your data remains on your device."
    },
    terms: {
      title: "Service Terms",
      content: "By using SyncQueue, you acknowledge that this is a queue management tool. It does not provide medical diagnosis. Protocol sequences are deterministic and should be followed according to hospital staff instructions."
    },
    security: {
      title: "Security Infrastructure",
      content: "Our system uses 256-bit local encryption for data persistence. The Peer-to-Peer synchronization engine ensures that even in network-isolated environments, the integrity of your queue position is maintained."
    }
  };

  return (
    <div className="min-h-screen bg-bg-light selection:bg-brand-blue/10 selection:text-brand-blue font-body">
      {/* ── TOP STATUS BAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-[120] bg-white/60 backdrop-blur-[40px] border-b border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
        <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-premium group-hover:scale-110 transition-transform border border-brand-blue/5 overflow-hidden">
                <Image 
                  src="/logo.png" 
                  alt="SyncQueue Logo" 
                  width={40} 
                  height={40} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-heading text-2xl font-black tracking-tighter text-brand-blue">SyncQueue</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <AnimatePresence mode="wait">
              {mounted && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={isOffline ? "text-red-500 flex items-center gap-2" : "text-brand-accent flex items-center gap-2"}
                >
                  {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                  <span className="text-[10px] font-black tracking-widest uppercase italic">
                    {isOffline ? 'Offline mode' : 'Protocol active'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* ── MASTER NAV SYSTEM ── */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[400px] px-6">
        <div className="relative w-full h-20">
          <motion.div 
            className="absolute top-0 w-1/3 h-full flex flex-col items-center justify-center"
            initial={false}
            animate={{ left: `${activeIndex * 33.33}%` }} 
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
            style={{ zIndex: 110 }}
          >
            <div className="nav-circle-bg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeItem}
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  className="text-brand-blue"
                >
                  {React.createElement(navItems[activeIndex]?.icon || Home, { 
                    className: "w-7 h-7 animate-pulse-slow" 
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          <div 
            className="nav-container absolute inset-0 h-full flex items-center justify-around"
            style={{ ...maskStyle, zIndex: 100 }}
          >
            {navItems.map((item, i) => {
              const isActive = activeIndex === i;
              return (
                <Link 
                  key={item.id}
                  href={item.href}
                  onClick={() => setManualTab(item.id)}
                  className="relative flex flex-col items-center justify-center w-1/3 h-full z-[130] cursor-pointer"
                >
                  <div className={cn(
                    "flex flex-col items-center transition-all duration-500",
                    isActive ? "opacity-100" : "opacity-30 hover:opacity-100"
                  )}>
                    <div className={cn("transition-all duration-300", isActive ? "invisible opacity-0" : "visible opacity-100")}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={cn("nav-label", isActive && "nav-label-active")}>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 pt-20 pb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-brand-accent/[0.04] to-transparent pointer-events-none -z-10" />
        {children}
      </main>

      {/* ── REFINED FOOTER ── */}
      <footer className="bg-white border-t border-brand-blue/5 pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-brand-blue/[0.02] border border-brand-blue/5 rounded-[40px] p-10 flex flex-col items-start relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <Globe className="w-48 h-48 text-brand-blue" />
              </div>
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 mb-6">
                <ShieldCheck className="w-4 h-4 text-brand-accent" />
                <span className="text-[10px] font-black tracking-widest text-brand-accent uppercase">Security first</span>
              </div>
              <h2 className="font-heading text-4xl font-black text-brand-blue tracking-tighter mb-4 leading-tight italic">
                Optimize flow:<br />Join protocol
              </h2>
              <p className="text-xs font-medium text-brand-blue/70 max-w-sm leading-relaxed mb-8">
                Engineering high-precision queue management protocols for modern infrastructure.
              </p>
              <button 
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 rounded-xl bg-brand-blue text-white font-black text-[10px] tracking-widest shadow-premium hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                Access portal
              </button>
            </div>

            <div className="bg-white rounded-[40px] p-10 shadow-premium border border-brand-blue/5 flex flex-col justify-between">
              <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-brand-blue/5 overflow-hidden">
                    <Image 
                      src="/logo.png" 
                      alt="SyncQueue Logo" 
                      width={48} 
                      height={48} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-heading text-2xl font-black tracking-tighter text-brand-blue">SyncQueue</span>
                </div>
                <div className="flex flex-col items-start md:items-end gap-3">
                  <Link href="#features" className="text-[9px] font-black tracking-[0.2em] text-brand-blue/70 hover:text-brand-accent transition-colors uppercase">Infrastructure</Link>
                  <Link href="#about" className="text-[9px] font-black tracking-[0.2em] text-brand-blue/70 hover:text-brand-accent transition-colors uppercase">About systems</Link>
                  <Link href="/#contact" className="text-[9px] font-black tracking-[0.2em] text-brand-blue/70 hover:text-brand-accent transition-colors uppercase">Contact</Link>
                </div>
              </div>

              <div className="mb-10">
                <p className="text-lg font-black tracking-tight text-brand-blue mb-1">+250 788 000 000</p>
                <p className="text-xs font-bold text-brand-blue/70 mb-6 italic">support@syncqueue.org</p>
                <div className="flex items-center gap-3 mb-6">
                  {[Globe, MessageCircle, Share2, Mail].map((Icon, i) => (
                    <button key={i} className="w-10 h-10 rounded-full border border-brand-blue/10 flex items-center justify-center text-brand-blue/40 hover:text-brand-accent hover:border-brand-accent/30 transition-all duration-300 cursor-pointer">
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => {
                     if (confirm('Reset all system queues? This will clear all local protocol data.')) {
                        indexedDB.deleteDatabase('syncqueue_db');
                        window.location.reload();
                     }
                  }}
                  className="px-5 py-2.5 rounded-lg border border-red-500/20 bg-red-500/5 text-[8px] font-black tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer uppercase"
                >
                  Clear cache
                </button>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl border border-brand-blue/5 bg-brand-blue/[0.02]">
                <Info className="w-4 h-4 text-brand-blue/60 shrink-0" />
                <p className="text-[9px] leading-relaxed font-bold text-brand-blue/60 tracking-widest uppercase">
                  PWA solution. Data stored in IndexedDB. Offline resilient.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-brand-blue/5 gap-6">
            <p className="text-[9px] font-black text-brand-blue/60 tracking-[0.3em] uppercase">© 2026 SyncQueue Protocol</p>
            <div className="flex items-center gap-6">
              <button onClick={() => setLegalModal(legalContent.privacy)} className="text-[9px] font-black text-brand-blue/60 hover:text-brand-accent tracking-widest uppercase cursor-pointer">Privacy</button>
              <button onClick={() => setLegalModal(legalContent.terms)} className="text-[9px] font-black text-brand-blue/60 hover:text-brand-accent tracking-widest uppercase cursor-pointer">Terms</button>
              <button onClick={() => setLegalModal(legalContent.security)} className="text-[9px] font-black text-brand-blue/60 hover:text-brand-accent tracking-widest uppercase cursor-pointer">Security</button>
            </div>
          </div>
        </div>
      </footer>

      {/* ── LEGAL PROTOCOL MODAL ── */}
      <AnimatePresence>
        {legalModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-brand-blue/40 backdrop-blur-md"
            onClick={() => setLegalModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white rounded-[32px] p-10 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setLegalModal(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-brand-blue/5 flex items-center justify-center text-brand-blue/40 hover:text-brand-blue transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-heading text-3xl font-black text-brand-blue tracking-tighter mb-6 italic">{legalModal.title}</h3>
              <p className="text-sm font-medium text-brand-blue/70 leading-relaxed">
                {legalModal.content}
              </p>
              <div className="mt-10 pt-6 border-t border-brand-blue/5">
                <button 
                  onClick={() => setLegalModal(null)}
                  className="w-full py-4 rounded-xl bg-brand-blue text-white font-black text-xs tracking-widest uppercase shadow-premium cursor-pointer"
                >
                  Acknowledge protocol
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
