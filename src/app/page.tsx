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

  const handleCreateTicket = async (service: 'consultation' | 'lab' | 'pharmacy') => {
    setIsProcessing(true);
    setTargetService(service);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const ticket = await createTicket(service);
      router.push(`/my-ticket/${ticket.id}`);
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
      color: 'blue-500',
      wait: '2-5m'
    },
    { 
      id: 'pharmacy', 
      title: 'Pharmacy', 
      desc: 'Rapid medication supply and pharmaceutical care.', 
      icon: Clock,
      color: 'emerald-500',
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
      <section className="relative pt-4 pb-32 overflow-hidden">
        <HeroVisual />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-brand-accent/10 border border-brand-accent/20 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
              </span>
              <span className="text-[10px] font-black text-brand-accent italic">System 2.0 ready</span>
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
            
            <div className="flex items-center gap-6">
              <Magnetic>
                <button 
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group px-8 py-5 rounded-2xl bg-brand-blue text-white font-black text-xs hover:bg-brand-blue/90 transition-all duration-300 flex items-center gap-3 cursor-pointer shadow-xl shadow-brand-blue/20"
                >
                  Access portal
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Magnetic>
              
              <Magnetic>
                 <button 
                   onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
                   className="group text-xs font-black text-brand-blue hover:text-brand-accent transition-colors flex items-center gap-2 italic relative py-1 cursor-pointer"
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
                className="absolute -bottom-6 -left-20 z-30 bg-brand-blue rounded-3xl p-6 shadow-2xl flex items-center gap-5 min-w-[200px]"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                  <Activity className="w-5 h-5 text-brand-accent" />
                </div>
                <div>
                   <p className="text-[8px] font-black text-white/40 mb-1">Departments</p>
                   <p className="text-xs font-black text-white tracking-tight">3 Active queues</p>
                </div>
              </motion.div>

              <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-premium border border-brand-blue/5 overflow-visible">
                <div className="absolute left-[-10px] top-[68%] w-5 h-5 bg-bg-light rounded-full border border-brand-blue/5 z-20" />
                <div className="absolute right-[-10px] top-[68%] w-5 h-5 bg-bg-light rounded-full border border-brand-blue/5 z-20" />
                <div className="h-2 w-full bg-gradient-to-r from-brand-accent via-blue-400 to-indigo-500 rounded-t-[40px]" />
                <div className="p-8 pb-4 relative overflow-hidden">
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
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-black text-brand-accent mb-1">Health protocol</p>
                      <p className="text-base font-black text-brand-blue tracking-tight leading-tight italic">General consultation</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="text-[9px] font-black text-amber-600">Waiting</span>
                    </div>
                  </div>
                  <div className="mb-6">
                    <p className="text-[10px] font-black text-brand-blue/60 mb-1">Boarding sequence</p>
                    <p className="font-heading text-5xl font-black tracking-tighter text-brand-blue leading-none">
                      CON<span className="text-brand-accent">-003</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-brand-blue/5">
                    <div>
                      <p className="text-[10px] font-black text-brand-blue/60 mb-1">Gate time</p>
                      <p className="text-2xl font-black text-brand-blue tracking-tighter">~12<span className="text-sm font-bold text-brand-blue/40">M</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-brand-blue/60 mb-1">Rank</p>
                      <p className="text-2xl font-black text-brand-accent tracking-tighter">#3</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[9px] font-black text-brand-blue/60">Protocol progress</span>
                      <span className="text-[9px] font-black text-brand-accent italic">62%</span>
                    </div>
                    <div className="h-1.5 bg-brand-blue/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '62%' }}
                        transition={{ duration: 2, delay: 1, ease: 'circOut' }}
                        className="h-full bg-gradient-to-r from-brand-accent to-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-8 flex items-center gap-2 mb-4 opacity-10">
                  <div className="h-px flex-1 border-t border-dashed border-brand-blue" />
                </div>
                <div className="px-8 py-5 bg-brand-blue/[0.02] border-t border-brand-blue/5 flex items-center justify-between rounded-b-[40px]">
                  <div className="flex flex-col gap-1 opacity-30">
                     <div className="flex gap-[1px]">
                        {[2,3,1,4,2,3,1,2,5,2,1,3,2].map((w, i) => (
                           <div key={i} className="bg-brand-blue" style={{ width: `${w}px`, height: '14px' }} />
                        ))}
                     </div>
                     <span className="text-[6px] font-mono font-bold text-brand-blue/40 uppercase">Auth-id: SQ-PROT-77X-B4</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <RefreshCw className="w-3 h-3 text-brand-accent animate-spin-slow" />
                        <span className="text-[8px] font-black tracking-widest text-brand-blue/40 uppercase">Syncing protocol</span>
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
          className="relative scroll-mt-32 pb-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
       >
          <motion.div variants={itemVariants} className="text-center mb-16">
             <h2 className="font-heading text-4xl font-black text-brand-blue tracking-tighter mb-4 italic">Live monitor</h2>
             <p className="text-[10px] font-black text-brand-blue/60 italic">Real-time protocol synchronization</p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white rounded-[40px] shadow-premium border border-brand-blue/5 overflow-hidden">
             <QueueDisplay />
          </motion.div>
       </motion.section>

       <motion.section 
        id="services" 
        className="relative scroll-mt-32 pb-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-20">
          <h2 className="font-heading text-4xl font-black text-brand-blue tracking-tighter mb-4 italic">Initialize session</h2>
          <p className="text-[10px] font-black text-brand-blue/60 italic">Select department protocol</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {services.map((service, i) => (
            <Magnetic key={service.id}>
               <motion.div
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="group relative bg-white rounded-[40px] p-10 shadow-premium border border-brand-blue/5 overflow-hidden flex flex-col h-full cursor-pointer"
                onClick={() => handleCreateTicket(service.id as any)}
              >
                <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[40px] opacity-10 transition-opacity group-hover:opacity-20", `bg-${service.color}`)} />
                <div className="mb-10 flex items-center justify-between">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500", `bg-${service.color}/10 group-hover:bg-${service.color} group-hover:text-white`)}>
                    <service.icon className={cn("w-6 h-6 transition-all", `text-${service.color} group-hover:text-white`)} />
                  </div>
                  <span className={cn("text-[9px] font-black italic", `text-${service.color}`)}>{service.wait} wait</span>
                </div>
                <h3 className="font-heading text-2xl font-black text-brand-blue tracking-tighter mb-4 italic leading-tight group-hover:text-brand-accent transition-colors">{service.title}</h3>
                <p className="text-xs font-medium text-brand-blue/60 leading-relaxed mb-10 flex-grow">{service.desc}</p>
                
                <div className="flex items-center gap-3 text-[9px] font-black text-brand-blue italic h-4 overflow-hidden relative">
                   <span className="transition-all duration-500 group-hover:-translate-y-full">Initialize session</span>
                   <span className="absolute left-0 top-full transition-all duration-500 group-hover:-translate-y-full text-brand-accent flex items-center gap-2">
                      Request access
                      <ArrowRight className="w-3 h-3" />
                   </span>
                </div>
              </motion.div>
            </Magnetic>
          ))}
        </div>
      </motion.section>

       <motion.section 
          id="about" 
          className="relative pb-32 scroll-mt-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
       >
          <motion.div variants={itemVariants} className="text-center mb-20">
             <h2 className="font-heading text-5xl font-black text-brand-blue tracking-tighter mb-4 italic leading-none">About systems.</h2>
             <p className="text-[10px] font-black text-brand-blue/30 italic">Engineering mission-critical infrastructure</p>
          </motion.div>
          
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
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
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="relative group"
              >
                {/* LARGE BACKGROUND NUMBER (4:47 PM Style) */}
                <span className="absolute -top-10 -left-6 text-[120px] font-black text-brand-blue/[0.03] select-none group-hover:text-brand-accent/[0.05] transition-colors duration-700">
                  {item.num}
                </span>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-brand-blue/5 flex items-center justify-center mb-6 group-hover:bg-brand-accent/10 transition-colors">
                    <item.icon className="w-6 h-6 text-brand-blue group-hover:text-brand-accent transition-colors" />
                  </div>
                  <h4 className="font-heading text-2xl font-black italic mb-4 tracking-tight text-brand-blue">{item.title}</h4>
                  <p className="text-xs font-medium text-brand-blue/60 leading-relaxed mb-6">
                    {item.desc}
                  </p>
                  <div className="w-10 h-1 bg-brand-blue/5 rounded-full group-hover:w-20 group-hover:bg-brand-accent transition-all duration-500" />
                </div>
               </motion.div>
             ))}
          </motion.div>
       </motion.section>

      {/* Offline resiliency details */}
      <section id="features" className="relative pb-32">
         <div className="bg-brand-blue rounded-[50px] p-16 relative overflow-hidden text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/20 to-transparent opacity-50" />
            <div className="relative z-10">
               <div className="max-w-2xl mb-16">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 mb-8">
                     <WifiOff className="w-4 h-4 text-brand-accent" />
                     <span className="text-[9px] font-black text-white">Resilience protocol</span>
                  </div>
                  <h2 className="font-heading text-5xl font-black tracking-tighter mb-6 italic">Offline Resilience<br />Infrastructure.</h2>
                  <p className="text-sm font-medium text-white/60 leading-relaxed">
                     Our mission-critical architecture ensures that hospital operations never stop. Even without an internet connection, SyncQueue maintains total protocol integrity through secure local nodes.
                  </p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {[
                    { title: 'Local Persistence', desc: 'Encrypted IndexedDB storage on-device.', icon: Database },
                    { title: 'P2P Synchronization', desc: 'Real-time reactive reactive sync engine.', icon: Wifi },
                    { title: 'Zero Latency', desc: 'Instant local ticket generation.', icon: Zap }
                  ].map((feature, i) => (
                    <div key={i} className="flex flex-col gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                          <feature.icon className="w-6 h-6 text-brand-accent" />
                       </div>
                       <h3 className="font-heading text-xl font-black italic">{feature.title}</h3>
                       <p className="text-[10px] font-bold text-white/40">{feature.desc}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Contact */}
      <section id="contact" className="relative pb-12 scroll-mt-32">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="bg-white rounded-[40px] p-12 shadow-premium border border-brand-blue/5">
               <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-brand-blue/5 border border-brand-blue/10 mb-6">
                 <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                 <span className="text-[9px] font-black tracking-widest text-brand-blue uppercase">Contact Protocol</span>
               </div>
               <h2 className="font-heading text-4xl font-black text-brand-blue tracking-tighter mb-6 italic">Inquiry form</h2>
               <p className="text-sm font-medium text-brand-blue/60 mb-10 leading-relaxed">
                  For administrative inquiries or infrastructure support, please initiate a contact sequence.
               </p>
               <form className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="relative group">
                        <input 
                           type="text" 
                           id="first-name"
                           className="peer w-full bg-transparent border-b border-brand-blue/10 py-3 text-sm text-brand-blue focus:outline-none placeholder-transparent" 
                           placeholder="First name" 
                        />
                        <label 
                           htmlFor="first-name"
                           className="absolute left-0 -top-3.5 text-brand-blue/40 text-[10px] font-black transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-blue/20 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-brand-accent peer-focus:text-[10px]"
                        >
                           First name
                        </label>
                        <motion.div 
                           className="absolute bottom-0 left-0 h-[2px] bg-brand-accent w-0"
                           whileFocus={{ width: '100%' }}
                           initial={false}
                        />
                        <div className="absolute bottom-0 left-0 h-[1px] bg-brand-blue/5 w-full -z-10" />
                     </div>
                     <div className="relative group">
                        <input 
                           type="text" 
                           id="second-name"
                           className="peer w-full bg-transparent border-b border-brand-blue/10 py-3 text-sm text-brand-blue focus:outline-none placeholder-transparent" 
                           placeholder="Second name" 
                        />
                        <label 
                           htmlFor="second-name"
                           className="absolute left-0 -top-3.5 text-brand-blue/40 text-[10px] font-black transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-blue/20 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-brand-accent peer-focus:text-[10px]"
                        >
                           Second name
                        </label>
                        <motion.div 
                           className="absolute bottom-0 left-0 h-[2px] bg-brand-accent w-0"
                           whileFocus={{ width: '100%' }}
                           initial={false}
                        />
                        <div className="absolute bottom-0 left-0 h-[1px] bg-brand-blue/5 w-full -z-10" />
                     </div>
                  </div>
                  
                  <div className="relative group">
                     <input 
                        type="text" 
                        id="username"
                        className="peer w-full bg-transparent border-b border-brand-blue/10 py-3 text-sm text-brand-blue focus:outline-none placeholder-transparent" 
                        placeholder="Administrative lead" 
                     />
                     <label 
                        htmlFor="username"
                        className="absolute left-0 -top-3.5 text-brand-blue/40 text-[10px] font-black transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-blue/20 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-brand-accent peer-focus:text-[10px]"
                     >
                        Administrative lead
                     </label>
                     <motion.div 
                        className="absolute bottom-0 left-0 h-[2px] bg-brand-accent w-0"
                        whileFocus={{ width: '100%' }}
                        initial={false}
                     />
                     <div className="absolute bottom-0 left-0 h-[1px] bg-brand-blue/5 w-full -z-10" />
                  </div>

                  <div className="relative group">
                     <input 
                        type="email" 
                        id="auth-email"
                        className="peer w-full bg-transparent border-b border-brand-blue/10 py-3 text-sm text-brand-blue focus:outline-none placeholder-transparent" 
                        placeholder="Auth email" 
                     />
                     <label 
                        htmlFor="auth-email"
                        className="absolute left-0 -top-3.5 text-brand-blue/40 text-[10px] font-black transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-blue/20 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-brand-accent peer-focus:text-[10px]"
                     >
                        Auth email
                     </label>
                     <motion.div 
                        className="absolute bottom-0 left-0 h-[2px] bg-brand-accent w-0"
                        whileFocus={{ width: '100%' }}
                        initial={false}
                     />
                     <div className="absolute bottom-0 left-0 h-[1px] bg-brand-blue/5 w-full -z-10" />
                  </div>

                  <div className="relative group">
                     <input 
                        type="text" 
                        id="priority"
                        className="peer w-full bg-transparent border-b border-brand-blue/10 py-3 text-sm text-brand-blue focus:outline-none placeholder-transparent" 
                        placeholder="Priority level" 
                     />
                     <label 
                        htmlFor="priority"
                        className="absolute left-0 -top-3.5 text-brand-blue/40 text-[10px] font-black transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-blue/20 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-brand-accent peer-focus:text-[10px]"
                     >
                        Priority level
                     </label>
                     <motion.div 
                        className="absolute bottom-0 left-0 h-[2px] bg-brand-accent w-0"
                        whileFocus={{ width: '100%' }}
                        initial={false}
                     />
                     <div className="absolute bottom-0 left-0 h-[1px] bg-brand-blue/5 w-full -z-10" />
                  </div>

                  <div className="relative group">
                     <textarea 
                        id="sequence-message"
                        className="peer w-full bg-transparent border-b border-brand-blue/10 py-3 text-sm text-brand-blue focus:outline-none placeholder-transparent h-32 resize-none" 
                        placeholder="Sequence message"
                     ></textarea>
                     <label 
                        htmlFor="sequence-message"
                        className="absolute left-0 -top-3.5 text-brand-blue/40 text-[10px] font-black transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-blue/20 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-brand-accent peer-focus:text-[10px]"
                     >
                        Sequence message
                     </label>
                     <motion.div 
                        className="absolute bottom-0 left-0 h-[2px] bg-brand-accent w-0"
                        whileFocus={{ width: '100%' }}
                        initial={false}
                     />
                     <div className="absolute bottom-0 left-0 h-[1px] bg-brand-blue/5 w-full -z-10" />
                  </div>
                  <Magnetic>
                     <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-5 rounded-2xl bg-brand-blue text-white font-black text-xs hover:shadow-2xl hover:shadow-brand-blue/30 transition-all cursor-pointer relative overflow-hidden group"
                     >
                        <span className="relative z-10">Transmit protocol</span>
                        <motion.div 
                           className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"
                        />
                     </motion.button>
                  </Magnetic>
               </form>
            </div>
            <div className="p-12">
               <div className="mb-12">
                  <p className="text-[10px] font-black text-brand-accent mb-4">Infrastructure</p>
                  <h3 className="font-heading text-5xl font-black text-brand-blue tracking-tighter italic mb-6 leading-tight">Global Support<br />Systems.</h3>
                  <div className="flex flex-col gap-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-blue/5 flex items-center justify-center border border-brand-blue/5">
                           <MapPin className="w-5 h-5 text-brand-blue" />
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-brand-blue/40">Location</p>
                           <p className="text-xs font-black text-brand-blue italic tracking-tight">Main Campus, Kigali City Center</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-blue/5 flex items-center justify-center border border-brand-blue/5">
                           <Clock className="w-5 h-5 text-brand-blue" />
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-brand-blue/40">Availability</p>
                           <p className="text-xs font-black text-brand-blue italic tracking-tight">24/7 Operations Protocol</p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-accent to-blue-500 rounded-[35px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-white p-10 rounded-[35px] border border-brand-blue/5 flex items-center justify-between shadow-premium">
                     <div>
                        <p className="text-[9px] font-black text-brand-blue/40 mb-1">Emergency service</p>
                        <p className="text-3xl font-black text-brand-blue tracking-tighter">+250 791 926 765</p>
                     </div>
                     <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <ShieldCheck className="w-7 h-7 text-red-500" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
      
      {/* Footer */}
      <footer className="pt-12 pb-8 border-t border-brand-blue/5 max-w-7xl mx-auto px-6">
         <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center">
                  <span className="text-white font-black text-[10px]">SQ</span>
               </div>
               <span className="font-heading text-lg font-black text-brand-blue italic tracking-tighter">SyncQueue.</span>
            </div>
            
            <div className="flex gap-10">
               {['Protocols', 'Security', 'Infrastructure', 'Global'].map((link) => (
                  <a key={link} href="#" className="text-[10px] font-black text-brand-blue/40 hover:text-brand-accent transition-colors italic">{link}</a>
               ))}
            </div>
            
            <p className="text-[9px] font-black text-brand-blue/20">© 2026 SyncQueue Infrastructure. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
}
