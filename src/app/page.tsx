"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Clock, 
  MapPin, 
  LayoutDashboard,
  ChevronRight,
  RefreshCw,
  Plus,
  Wifi,
  WifiOff,
  Database,
  Users,
  Loader2,
  Lock,
  BarChart3,
  Server,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueueStore } from '@/store/useQueueStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import QueueDisplay from '@/components/QueueDisplay';
import Magnetic from '@/components/Magnetic';

import HeroVisual from '@/components/HeroVisual';
import BackgroundParticles from '@/components/BackgroundParticles';
import { startQueueSimulation } from '@/lib/simulation';

export default function Home() {
  const { createTicket } = useQueueStore();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetService, setTargetService] = useState('');

  React.useEffect(() => {
    // Broad prefetch to ensure all possible code chunks are in cache for offline
    router.prefetch('/dashboard');
    router.prefetch('/my-ticket/preheat');
    router.prefetch('/offline');
  }, [router]);

  const handleCreateTicket = async (service: 'consultation' | 'lab' | 'pharmacy') => {
    setIsProcessing(true);
    setTargetService(service);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const ticket = await createTicket(service);
      
      // If offline, use a hard navigation to force the Service Worker to intercept
      // and serve the App Shell. This is more reliable than SPA routing in some offline scenarios.
      if (!navigator.onLine) {
        window.location.href = `/my-ticket/${ticket.id}`;
      } else {
        router.push(`/my-ticket/${ticket.id}`);
      }
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  const services = [
    { 
      id: 'consultation', 
      title: 'Consultation', 
      desc: 'Expert medical diagnostics and consultation protocols.', 
      icon: Activity,
      color: 'brand-accent',
      wait: '3-6m'
    },
    { 
      id: 'lab', 
      title: 'Laboratory', 
      desc: 'High-precision diagnostic testing and blood work.', 
      icon: Zap,
      color: 'brand-blue',
      wait: '2-5m'
    },
    { 
      id: 'pharmacy', 
      title: 'Pharmacy', 
      desc: 'Rapid medication supply and pharmaceutical care.', 
      icon: Clock,
      color: 'brand-blue',
      wait: '1-3m'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

    const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "circOut" as const }
    }
  };

  return (
    <div className="relative">
      <BackgroundParticles />

      {/* Loading overlay for ticket creation */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-brand-blue/95 backdrop-blur-xl flex flex-col items-center justify-center text-white"
          >
            <div className="relative mb-8">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border-2 border-white/10 border-t-brand-accent"
              />
              <Activity className="absolute inset-0 m-auto w-8 h-8 text-brand-accent animate-pulse" />
            </div>
            <h2 className="font-heading text-3xl font-black italic tracking-tighter mb-2">Establishing connection</h2>
            <p className="text-[10px] font-black text-white/40 italic">Syncing with hospital protocol...</p>
            
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: "0%" }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 2, ease: "easeInOut" }}
                 className="h-full bg-brand-accent"
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative pt-4 pb-20 overflow-hidden">
        <HeroVisual />
        
        <div className="max-w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-brand-accent/10 border border-brand-accent/20 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
              </span>
              <span className="text-[10px] font-medium text-brand-accent">System 2.0 ready</span>
            </div>
            
            <h1 className="font-heading text-7xl lg:text-8xl font-black text-brand-blue tracking-tighter mb-8 leading-[0.85] italic">
              Smart<br />
              queue<br />
              <span className="relative inline-block">
                <span className="text-brand-accent">control.</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.8, ease: "circOut" }}
                  className="absolute -bottom-2 left-0 w-full h-2 bg-brand-accent/20 origin-left"
                />
              </span>
            </h1>
            
            <p className="text-sm font-medium text-brand-blue/60 max-w-md leading-relaxed mb-10">
              The next-generation hospital orchestration protocol. Real-time synchronization, offline resilience, and high-precision patient flow.
            </p>

            <div className="flex flex-col gap-2 mb-6">
              <span className="text-[10px] font-medium text-brand-blue/30 uppercase tracking-[0.2em]">Initial sequence</span>
              <p className="text-xs font-medium text-brand-blue/60">Start your journey by accessing the portal or monitoring the live queue.</p>
            </div>
            
            <div className="flex items-center gap-6">
              <Magnetic>
                 <button 
                   onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                   className="group px-8 py-5 rounded-lg bg-brand-blue text-white font-medium text-xs flex items-center gap-3 cursor-pointer"
                 >
                   Access portal
                   <ArrowRight className="w-4 h-4" />
                 </button>
              </Magnetic>
              
              <Magnetic>
                 <button 
                   onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
                   className="group text-xs font-medium text-brand-blue hover:text-brand-accent transition-colors flex items-center gap-2 relative py-1 cursor-pointer"
                 >
                   View live dashboard
                   <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   <motion.span 
                      className="absolute bottom-0 left-0 w-0 h-[1px] bg-brand-accent"
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                   />
                   <motion.span 
                      className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-blue/5"
                   />
                 </button>
               </Magnetic>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="relative hidden lg:flex items-center justify-end"
          >
            <div className="absolute inset-0 bg-brand-accent/10 blur-[80px] rounded-full scale-75" />
            
            <div className="relative">
              {/* Status badges */}
              <motion.div 
                initial={{ opacity: 0, y: -20, x: -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="absolute -bottom-6 -left-20 z-30 bg-brand-blue rounded-lg p-4 flex items-center gap-3 min-w-[160px]"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                  <Activity className="w-4 h-4 text-brand-accent" />
                </div>
                <div>
                    <p className="text-[11px] font-medium text-white/60 mb-1">Departments</p>
                    <p className="text-[12px] font-medium text-white tracking-tight">3 Active queues</p>
                </div>
              </motion.div>

              <div className="relative w-full max-w-[320px] bg-white rounded-lg border border-brand-blue/5 overflow-visible">
                <div className="absolute left-[-10px] top-[68%] w-5 h-5 bg-bg-light rounded-full border border-brand-blue/5 z-20" />
                <div className="absolute right-[-10px] top-[68%] w-5 h-5 bg-bg-light rounded-full border border-brand-blue/5 z-20" />
                <div className="h-2 w-full bg-brand-blue rounded-t-lg" />
                <div className="p-6 pb-2 relative overflow-hidden">
                   <motion.div 
                    animate={{ 
                      translateX: ['-100%', '200%'],
                      opacity: [0, 0.3, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "linear",
                      repeatDelay: 1
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent w-full h-full -skew-x-12 z-10 pointer-events-none"
                  />
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[11px] font-black text-brand-accent mb-1">Health protocol</p>
                      <p className="text-[15px] font-medium text-brand-blue tracking-tight leading-tight">General consultation</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="text-[10px] font-black text-amber-600">Waiting</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-[11px] font-medium text-brand-blue/80 mb-1">Boarding sequence</p>
                    <p className="font-heading text-4xl font-black tracking-tighter text-brand-blue leading-none">
                      CON<span className="text-brand-accent">-003</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-brand-blue/5">
                    <div>
                      <p className="text-[11px] font-medium text-brand-blue/80 mb-1">Gate time</p>
                      <p className="text-xl font-medium text-brand-blue tracking-tighter">~12<span className="text-sm font-medium text-brand-blue/40">M</span></p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-brand-blue/80 mb-1">Rank</p>
                      <p className="text-xl font-medium text-brand-blue tracking-tighter">#3</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-black text-brand-blue/80">Protocol progress</span>
                      <span className="text-[10px] font-black text-brand-accent">62%</span>
                    </div>
                    <div className="h-1.5 bg-brand-blue/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '62%' }}
                        transition={{ duration: 2, delay: 1, ease: 'circOut' }}
                        className="h-full bg-brand-blue rounded-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-6 flex items-center gap-2 mb-2 opacity-10">
                  <div className="h-px flex-1 border-t border-dashed border-brand-blue" />
                </div>
                <div className="px-6 py-4 bg-brand-blue/[0.02] border-t border-brand-blue/5 flex items-center justify-between rounded-b-lg">
                  <div className="flex flex-col gap-1 opacity-30">
                     <div className="flex gap-[1px]">
                        {[2,3,1,4,2,3,1,2,5,2,1,3,2].map((w, i) => (
                           <div key={i} className="bg-brand-blue" style={{ width: `${w}px`, height: '10px' }} />
                        ))}
                     </div>
                     <span className="text-[6px] font-mono font-medium text-brand-blue/40 uppercase">Auth-id: SQ-PROT-77X-B4</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <RefreshCw className="w-3 h-3 text-brand-accent animate-spin-slow" />
                        <span className="text-[9px] font-medium tracking-widest text-brand-blue/70 uppercase">Syncing protocol</span>
                     </div>
                     <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                           <motion.div 
                              key={i}
                              animate={{ opacity: [0.2, 1, 0.2] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                              className="w-1 h-1 rounded-full bg-brand-accent"
                           />
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

       <motion.section 
          id="dashboard" 
          className="relative scroll-mt-32 pb-20 max-w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
       >
          <motion.div variants={itemVariants} className="text-center mb-16">
             <h2 className="font-heading text-4xl font-black text-brand-blue tracking-tighter mb-4 italic">Live monitor</h2>
             <p className="text-[12px] font-medium text-brand-blue/85 max-w-lg mx-auto">Monitor the active patient flow and department throughput in real-time. View serving status and waiting positions below.</p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white rounded-lg border border-brand-blue/5 p-12 overflow-hidden">
             <QueueDisplay />
          </motion.div>
       </motion.section>

       <motion.section 
        id="services" 
        className="relative scroll-mt-32 pb-20 max-w-full mx-auto px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-20">
           <h2 className="font-heading text-4xl font-black text-brand-blue tracking-tighter mb-4 italic">Initialize session</h2>
           <p className="text-[12px] font-medium text-brand-blue/80 max-w-lg mx-auto">Select a department protocol below to generate your unique priority ticket and enter the synchronized hospital queue.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {services.map((service, i) => (
              <Magnetic key={service.id}>
                <motion.div
                 variants={itemVariants}
                 className="group relative bg-white rounded-lg p-6 border border-brand-blue/10 overflow-hidden flex flex-col h-full cursor-pointer transition-all duration-300"
                 onClick={() => handleCreateTicket(service.id as any)}
               >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 <div className="mb-6 flex items-center justify-between">
                   <div className="w-12 h-12 rounded-lg bg-brand-blue/5 flex items-center justify-center transition-all duration-500 group-hover:bg-brand-blue group-hover:text-white">
                     <service.icon className="w-6 h-6 text-brand-blue group-hover:text-white transition-all" />
                   </div>
                   <span className="text-[11px] font-medium text-brand-blue/70">{service.wait} wait</span>
                 </div>
                 <h3 className="font-heading text-xl font-black text-brand-blue tracking-tighter mb-4 italic leading-tight group-hover:text-brand-accent transition-colors">{service.title}</h3>
                 <p className="text-[12px] font-medium text-brand-blue/80 leading-relaxed mb-6 flex-grow">{service.desc}</p>
                
                <div className="flex items-center justify-between text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] mt-auto pt-6 border-t border-brand-blue/5">
                   <span className="group-hover:text-brand-accent transition-colors">Initialize protocol</span>
                   <ArrowRight className="w-3.5 h-3.5 text-brand-blue group-hover:text-brand-accent group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </Magnetic>
          ))}
        </div>
      </motion.section>

       <motion.section 
          id="about" 
          className="relative pb-20 scroll-mt-32 max-w-full mx-auto px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
       >
           <motion.div variants={itemVariants} className="text-center mb-10">
              <h2 className="font-heading text-5xl font-black text-brand-blue tracking-tighter mb-4 italic leading-none">About systems.</h2>
              <p className="text-[12px] font-medium text-brand-blue/80 max-w-lg mx-auto leading-relaxed">Explore the mission-critical engineering and resilient infrastructure protocols that power our zero-latency smart queue orchestration.</p>
           </motion.div>
          
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20">
            {[
              { 
                title: 'Dynamic Protocol', 
                desc: 'Real-time orchestration and patient flow management protocol.', 
                icon: Activity,
                num: '01'
              },
              { 
                title: 'Offline Resilience', 
                desc: 'Total operational integrity without internet connection.', 
                icon: WifiOff,
                num: '02'
              },
              { 
                title: 'P2P Synchronization', 
                desc: 'Peer-to-peer reactive data synchronization engine.', 
                icon: RefreshCw,
                num: '03'
              },
              { 
                title: 'Secure Persistence', 
                desc: 'Encrypted local storage via secure IndexedDB nodes.', 
                icon: Lock,
                num: '04'
              }
            ].map((item, i) => (
               <motion.div 
                 key={i} 
                 variants={itemVariants}
                 className="relative group py-10"
               >
                {/* LARGE BACKGROUND NUMBER */}
                <span className="absolute -top-4 -left-8 text-[140px] font-black text-brand-blue/[0.03] select-none group-hover:text-brand-accent/[0.06] transition-colors duration-700 leading-none">
                  {item.num}
                </span>
                
                <div className="relative z-10 flex flex-col">
                  <div className="w-12 h-12 rounded-lg bg-brand-blue/5 flex items-center justify-center mb-8 group-hover:bg-brand-accent/10 transition-colors">
                    <item.icon className="w-6 h-6 text-brand-blue group-hover:text-brand-accent transition-colors" />
                  </div>
                   <h4 className="font-heading text-2xl font-black italic mb-4 tracking-tight text-brand-blue group-hover:text-brand-accent transition-colors">{item.title}</h4>
                  <p className="text-[12px] font-medium text-brand-blue/60 leading-relaxed mb-6 max-w-[200px]">
                    {item.desc}
                  </p>
                  <div className="w-10 h-1 bg-brand-blue/10 rounded-full group-hover:w-16 group-hover:bg-brand-accent transition-all duration-500" />
                </div>
               </motion.div>
             ))}
          </motion.div>
       </motion.section>

      {/* Offline resiliency details */}
      <section id="features" className="relative pb-20 scroll-mt-28 max-w-full mx-auto px-8">
         <div className="bg-brand-blue rounded-lg px-10 py-8 relative overflow-hidden text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/20 to-transparent opacity-50" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
               {/* Left: heading block */}
               <div className="lg:w-2/5 shrink-0">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 border border-white/10 mb-4">
                     <WifiOff className="w-3.5 h-3.5 text-brand-accent" />
                     <span className="text-[10px] font-medium text-white">Resilience protocol</span>
                  </div>
                  <h2 className="font-heading text-3xl font-black tracking-tighter mb-3 italic leading-tight">Offline Resilience<br />Infrastructure.</h2>
                  <p className="text-[12px] font-medium text-white/80 leading-relaxed">
                     Secure local nodes maintain total protocol integrity without an internet connection, ensuring hospital operations never stop.
                  </p>
               </div>
               {/* Right: feature items */}
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:flex-1">
                  {[
                    { title: 'Local Persistence', desc: 'Encrypted IndexedDB storage on-device.', icon: Database },
                    { title: 'P2P Synchronization', desc: 'Real-time reactive sync engine.', icon: Wifi },
                    { title: 'Zero Latency', desc: 'Instant local ticket generation.', icon: Zap }
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                       <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 shrink-0 mt-0.5">
                          <feature.icon className="w-4 h-4 text-brand-accent" />
                       </div>
                       <div>
                          <h3 className="font-heading text-sm font-black italic mb-1">{feature.title}</h3>
                          <p className="text-[11px] font-medium text-white/60 leading-relaxed">{feature.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Contact */}
      <section id="contact" className="relative pb-20 scroll-mt-32 max-w-full mx-auto px-8">
         <div className="bg-white/40 backdrop-blur-md rounded-lg border border-brand-blue/5 p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
               <div className="bg-white rounded-lg p-8 border border-brand-blue/5 flex flex-col h-full">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-blue/5 border border-brand-blue/10 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                    <span className="text-[9px] font-medium tracking-widest text-brand-blue uppercase">Contact Protocol</span>
                  </div>
                   <h2 className="font-heading text-2xl font-black text-brand-blue tracking-tighter mb-2 italic">Inquiry form</h2>
                  <p className="text-[12px] font-medium text-brand-blue/80 mb-6 leading-relaxed">
                     Fill out the form below to initiate an administrative support sequence or request a technical consultation.
                  </p>
                  <form className="space-y-5">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="relative group">
                           <input 
                              type="text" 
                              id="first-name"
                              className="peer w-full bg-transparent border-b border-brand-blue/10 py-2 text-[13px] text-brand-blue focus:outline-none placeholder-transparent" 
                              placeholder="First name" 
                           />
                           <label 
                              htmlFor="first-name"
                              className="absolute left-0 -top-3 text-brand-blue/60 text-[11px] font-normal transition-all peer-placeholder-shown:text-[12px] peer-placeholder-shown:text-brand-blue/40 peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-brand-accent peer-focus:text-[11px]"
                           >
                              First name
                           </label>
                           <div className="absolute bottom-0 left-0 h-[1px] bg-brand-blue/5 w-full -z-10" />
                        </div>
                        <div className="relative group">
                           <input 
                              type="text" 
                              id="second-name"
                              className="peer w-full bg-transparent border-b border-brand-blue/10 py-2 text-[13px] text-brand-blue focus:outline-none placeholder-transparent" 
                              placeholder="Second name" 
                           />
                           <label 
                              htmlFor="second-name"
                              className="absolute left-0 -top-3 text-brand-blue/60 text-[11px] font-normal transition-all peer-placeholder-shown:text-[12px] peer-placeholder-shown:text-brand-blue/40 peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-brand-accent peer-focus:text-[11px]"
                           >
                              Second name
                           </label>
                           <div className="absolute bottom-0 left-0 h-[1px] bg-brand-blue/5 w-full -z-10" />
                        </div>
                     </div>
                     
                     <div className="relative group">
                        <input 
                           type="text" 
                           id="username"
                           className="peer w-full bg-transparent border-b border-brand-blue/10 py-2 text-[13px] text-brand-blue focus:outline-none placeholder-transparent" 
                           placeholder="Administrative lead" 
                        />
                        <label 
                           htmlFor="username"
                           className="absolute left-0 -top-3 text-brand-blue/60 text-[11px] font-normal transition-all peer-placeholder-shown:text-[12px] peer-placeholder-shown:text-brand-blue/40 peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-brand-accent peer-focus:text-[11px]"
                        >
                           Administrative lead
                        </label>
                        <div className="absolute bottom-0 left-0 h-[1px] bg-brand-blue/5 w-full -z-10" />
                     </div>
   
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="relative group">
                           <input 
                              type="email" 
                              id="auth-email"
                              className="peer w-full bg-transparent border-b border-brand-blue/10 py-2 text-[13px] text-brand-blue focus:outline-none placeholder-transparent" 
                              placeholder="Auth email" 
                           />
                           <label 
                              htmlFor="auth-email"
                              className="absolute left-0 -top-3 text-brand-blue/60 text-[11px] font-normal transition-all peer-placeholder-shown:text-[12px] peer-placeholder-shown:text-brand-blue/40 peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-brand-accent peer-focus:text-[11px]"
                           >
                              Auth email
                           </label>
                           <div className="absolute bottom-0 left-0 h-[1px] bg-brand-blue/5 w-full -z-10" />
                        </div>
                        <div className="relative group">
                           <input 
                              type="text" 
                              id="priority"
                              className="peer w-full bg-transparent border-b border-brand-blue/10 py-2 text-[13px] text-brand-blue focus:outline-none placeholder-transparent" 
                              placeholder="Priority level" 
                           />
                           <label 
                              htmlFor="priority"
                              className="absolute left-0 -top-3 text-brand-blue/60 text-[11px] font-normal transition-all peer-placeholder-shown:text-[12px] peer-placeholder-shown:text-brand-blue/40 peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-brand-accent peer-focus:text-[11px]"
                           >
                              Priority level
                           </label>
                           <div className="absolute bottom-0 left-0 h-[1px] bg-brand-blue/5 w-full -z-10" />
                        </div>
                     </div>
   
                     <div className="relative group">
                        <textarea 
                           id="sequence-message"
                           className="peer w-full bg-transparent border-b border-brand-blue/10 py-2 text-[13px] text-brand-blue focus:outline-none placeholder-transparent h-20 resize-none" 
                           placeholder="Sequence message"
                        ></textarea>
                        <label 
                           htmlFor="sequence-message"
                           className="absolute left-0 -top-3 text-brand-blue/60 text-[11px] font-normal transition-all peer-placeholder-shown:text-[12px] peer-placeholder-shown:text-brand-blue/40 peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-brand-accent peer-focus:text-[11px]"
                        >
                           Sequence message
                        </label>
                        <div className="absolute bottom-0 left-0 h-[1px] bg-brand-blue/5 w-full -z-10" />
                     </div>
                     <Magnetic>
                        <motion.button 
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           className="w-fit px-10 py-3 rounded-lg bg-brand-blue text-white font-normal text-[12px] transition-all cursor-pointer relative overflow-hidden group"
                        >
                           <span className="relative z-10">Transmit protocol</span>
                           <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"
                           />
                        </motion.button>
                     </Magnetic>
                  </form>
               </div>
               <div className="bg-white rounded-lg p-8 border border-brand-blue/5 flex flex-col h-full">
                  <div>
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-accent/5 border border-brand-accent/10 mb-4">
                       <span className="text-[10px] font-medium tracking-widest text-brand-accent uppercase">Infrastructure</span>
                     </div>
                     <h3 className="font-heading text-2xl font-black text-brand-blue tracking-tighter italic mb-4 leading-tight">Global Support Systems.</h3>
                     
                     <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-brand-blue/5 flex items-center justify-center border border-brand-blue/5 shrink-0">
                              <MapPin className="w-4 h-4 text-brand-blue" />
                           </div>
                            <div>
                              <p className="text-[11px] font-bold text-brand-blue/70 uppercase">Location</p>
                              <p className="text-[12px] font-bold text-brand-blue leading-tight">Main Campus, Kigali</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-brand-blue/5 flex items-center justify-center border border-brand-blue/5 shrink-0">
                              <Clock className="w-4 h-4 text-brand-blue" />
                           </div>
                            <div>
                              <p className="text-[11px] font-bold text-brand-blue/70 uppercase">Availability</p>
                              <p className="text-[12px] font-bold text-brand-blue leading-tight">24/7 Operations</p>
                           </div>
                        </div>
                     </div>
   
                     <div className="space-y-3 border-t border-brand-blue/5 pt-4">
                        <p className="text-[12px] font-black text-brand-blue uppercase tracking-[0.2em] mb-2">Protocol FAQs</p>
                        {[
                           { q: 'How to generate ticket?', a: 'Select department and transmit request.' },
                           { q: 'Offline synchronization?', a: 'Edge nodes sync via P2P local protocol.' },
                           { q: 'Data security?', a: 'Full encryption via IndexedDB local vault.' }
                        ].map((faq, i) => (
                            <div key={i} className="group cursor-default">
                              <p className="text-[12px] font-bold text-brand-blue italic mb-1 group-hover:text-brand-accent transition-colors">{faq.q}</p>
                              <p className="text-[11px] font-medium text-brand-blue/80 leading-relaxed">{faq.a}</p>
                           </div>
                        ))}
                     </div>
                  </div>
   
                  <div className="mt-auto pt-6 relative group">
                     <div className="relative bg-brand-blue/[0.02] p-5 rounded-lg border border-brand-blue/5 flex items-center justify-between">
                        <div>
                           <p className="text-[8px] font-bold text-brand-blue/40 mb-1 uppercase">Emergency service</p>
                           <p className="text-xl font-black text-brand-blue tracking-tighter text-brand-blue">+250 791 926 765</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                           <ShieldCheck className="w-5 h-5 text-red-500" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
      
    </div>
  );
}
