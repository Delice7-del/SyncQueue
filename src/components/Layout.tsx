"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
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
import { getTickets } from '@/lib/db';
import { NetworkStatus } from './NetworkStatus';
import { InstallPrompt } from './InstallPrompt';
import { SyncOverlay } from './SyncOverlay';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { tickets, isOffline, init } = useQueueStore();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [activeHash, setActiveHash] = useState('');
  const [manualTab, setManualTab] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<{ title: string; content: string } | null>(null);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isBottomHovered, setIsBottomHovered] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const runInit = async () => {
      // Non-blocking start for simulation
      startQueueSimulation();
      
      try {
        await init();
      } catch (e) {
        console.warn('[Layout] Init sequence delayed:', e);
      }
      setMounted(true);
    };
    
    runInit();

    // Fallback sync: Proactively check IDB every 2s for cross-tab updates when offline
    const syncInterval = setInterval(async () => {
       try {
         const tickets = await getTickets().catch(() => []);
         const currentTickets = useQueueStore.getState().tickets;
         
         // Only update if there's a real difference to avoid render loops
         if (JSON.stringify(tickets) !== JSON.stringify(currentTickets)) {
            console.log('[Layout] Heartbeat Sync: Updating tickets from local vault');
            useQueueStore.setState({ tickets: tickets.sort((a,b) => a.createdAt - b.createdAt) });
         }
       } catch (e) {
         console.warn('[Layout] Heartbeat Sync failed:', e);
       }
    }, 2000);
    
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

    // Prefetch common routes to ensure JS chunks are cached for offline use
    router.prefetch('/');
    router.prefetch('/dashboard');

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerHeight - e.clientY < 100) {
        setIsBottomHovered(true);
      } else {
        setIsBottomHovered(false);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      stopQueueSimulation();
    };
  }, [init, pathname, router]);

  const navItems = [
    { id: 'sync', label: 'Sync', icon: RefreshCw, href: '/#features' },
    { id: 'home', label: 'Home', icon: Home, href: '/' },
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
      <nav className="fixed top-0 left-0 right-0 z-[120] bg-white/80 backdrop-blur-[20px] border-b border-white/20">
        <div className="max-w-[1700px] mx-auto px-4 md:px-8 h-16 sm:h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-1.5 md:py-2 rounded-lg bg-white/40 backdrop-blur-xl border border-white/20 group transition-all hover:bg-white/60"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-white group-hover:scale-110 transition-transform border border-brand-blue/5 overflow-hidden">
                <Image 
                  src="/logo.png" 
                  alt="SyncQueue Logo" 
                  width={40} 
                  height={40} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-heading text-lg md:text-2xl font-black tracking-tighter text-brand-blue">SyncQueue</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <NetworkStatus />
          </div>
        </div>
      </nav>

      {/* ── MASTER NAV SYSTEM ── */}
      <div className={cn(
        "fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[400px] px-6 transition-all duration-700 ease-in-out",
        (isNavVisible || isBottomHovered) ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0"
      )}>
        <div className="relative w-full h-16 sm:h-20">
          <motion.div 
            className="absolute top-0 w-1/3 h-full flex flex-col items-center justify-center"
            initial={false}
            animate={{ left: `${activeIndex * 33.33}%` }} 
            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
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

      <main className="max-w-[1800px] mx-auto px-4 md:px-12 pt-16 sm:pt-20 pb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-brand-accent/[0.04] to-transparent pointer-events-none -z-10" />
        {children}
      </main>

      {/* ── UNIFIED NAVY FOOTER ── */}
      <footer className="bg-brand-blue pt-20 pb-12 text-white">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Left Card: CTA */}
            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-6 sm:p-10 flex flex-col items-start relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <Globe className="w-48 h-48 text-white" />
              </div>
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-brand-accent/20 border border-brand-accent/30 mb-6">
                <ShieldCheck className="w-4 h-4 text-brand-accent" />
                <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Security Protocol</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-white tracking-tighter mb-4 leading-tight italic">
                Optimize flow:<br />Join protocol
              </h2>
              <p className="text-xs font-medium text-white/50 max-w-sm leading-relaxed mb-8">
                Engineering high-precision queue management protocols for modern healthcare infrastructure.
              </p>
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg bg-transparent border border-white/20 text-white font-black text-[9px] sm:text-[10px] hover:bg-white hover:text-brand-blue cursor-pointer whitespace-nowrap"
              >
                ACCESS PORTAL
              </button>
            </div>

            {/* Right Card: Brand & Connect */}
            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-6 sm:p-10 flex flex-col justify-between">
              <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-transparent border border-white/10 overflow-hidden shadow-premium">
                    <Image 
                      src="/logo.png" 
                      alt="SyncQueue Logo" 
                      width={48} 
                      height={48} 
                      className="w-full h-full object-cover p-1"
                    />
                  </div>
                  <span className="font-heading text-2xl font-black tracking-tighter text-white">SyncQueue.</span>
                </div>
                <div className="flex flex-col items-start md:items-end gap-3">
                  <Link href="#features" className="text-[9px] font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest">Infrastructure</Link>
                  <Link href="#about" className="text-[9px] font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest">About systems</Link>
                  <Link href="/#contact" className="text-[9px] font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest">Contact</Link>
                </div>
              </div>

              <div className="mb-10">
                <p className="text-2xl font-black tracking-tight text-white mb-1">+250 791 926 765</p>
                <p className="text-xs font-bold text-white/40 mb-6 italic">support@syncqueue.org</p>
                <div className="flex items-center gap-3 mb-6">
                  {[Globe, MessageCircle, Share2, Mail].map((Icon, i) => (
                    <button key={i} className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-300 cursor-pointer">
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
                  className="px-5 py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-[8px] font-black text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  TERMINATE LOCAL CACHE
                </button>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-lg border border-white/5 bg-white/[0.02]">
                <Info className="w-4 h-4 text-white/40 shrink-0" />
                <p className="text-[9px] leading-relaxed font-bold text-white/40 uppercase tracking-tight">
                  PWA solution. Data stored in IndexedDB. Offline resilient protocol active.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-6">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">© 2026 SyncQueue Protocol Infrastructure</p>
            <div className="flex items-center gap-6">
              <button onClick={() => setLegalModal(legalContent.privacy)} className="text-[9px] font-black text-white/40 hover:text-white cursor-pointer uppercase tracking-widest">Privacy</button>
              <button onClick={() => setLegalModal(legalContent.terms)} className="text-[9px] font-black text-white/40 hover:text-white cursor-pointer uppercase tracking-widest">Terms</button>
              <button onClick={() => setLegalModal(legalContent.security)} className="text-[9px] font-black text-white/40 hover:text-white cursor-pointer uppercase tracking-widest">Security</button>
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
              className="w-full max-w-lg bg-white rounded-lg p-10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setLegalModal(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-lg bg-brand-blue/5 flex items-center justify-center text-brand-blue/40 hover:text-brand-blue transition-colors cursor-pointer"
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
                  className="w-full py-4 rounded-lg bg-brand-blue text-white font-black text-xs cursor-pointer"
                >
                  Acknowledge protocol
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ADVANCED SYSTEM OVERLAYS ── */}
      <InstallPrompt />
      <SyncOverlay />
    </div>
  );
}
