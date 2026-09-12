'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { 
  Lock, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Coins, 
  Cpu, 
  Activity,
  Play,
  Pause,
  Radio,
  Sliders,
  Layers,
  ArrowUpRight,
  GitBranch,
  Code,
  ExternalLink,
  FileCode,
  CheckCircle2,
  Globe,
  Sparkles,
  Database,
  Terminal as TerminalIcon,
  Copy,
  Check,
  BookOpen
} from 'lucide-react';

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

const FreighterConnect = dynamic(() => import('@/components/FreighterConnect'), { 
  ssr: false,
  loading: () => (
    <div className="h-10 px-4 bg-amber-500 border-2 border-obsidian font-mono text-xs font-bold uppercase flex items-center justify-center opacity-70">
      CONNECT FREIGHTER
    </div>
  )
});

const VoiceMicVisualizer = dynamic(() => import('@/components/VoiceMicVisualizer'), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-center font-mono text-xs text-amber-400 bg-obsidian border border-amber-500/30">
      LOADING ACOUSTIC MICROPHONE TESTBENCH...
    </div>
  ),
});

export default function Home() {
  const [isPlayingAudioSim, setIsPlayingAudioSim] = useState(true);
  const [simProgress, setSimProgress] = useState(42);
  const [stroopsStreamed, setStroopsStreamed] = useState(4200);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live simulated stream ticks
  useEffect(() => {
    if (!isPlayingAudioSim) return;
    const interval = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 100) return 6;
        return prev + 2.5;
      });
      setStroopsStreamed((prev) => (prev > 12000 ? 600 : prev + 250));
    }, 320);
    return () => clearInterval(interval);
  }, [isPlayingAudioSim]);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.04,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring' as const, 
        stiffness: 340, 
        damping: 24 
      } 
    },
  };

  const TREASURY_CONTRACT_ID = process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID || 'CCBZLHEHRUBAHGB72ZZLNHBT4RURGTW2SSSQC4DJDDILVDG4VR55FEJL';
  const ESCROW_CONTRACT_ID = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || 'CDJS3VHPBXVSFIPA6FUBVS3YXKUGZ75GQ7TQFVPMHBX3KHMREGGNMLFE';

  return (
    <main className="min-h-screen bg-alabaster text-obsidian selection:bg-obsidian selection:text-amber-400 overflow-x-hidden">
      {/* Top Sovereign Telemetry Bar */}
      <div className="bg-obsidian text-alabaster border-b-2 border-obsidian py-2.5 overflow-hidden select-none font-mono text-xs tracking-wider uppercase">
        <div className="flex w-max animate-marquee space-x-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center space-x-8 shrink-0">
              <span className="flex items-center gap-2 text-amber-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse"></span>
                SOVEREIGN VOICE-TO-VOICE PROTOCOL
              </span>
              <span className="text-obsidian-subtle">{"//"}</span>
              <span className="text-jade font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse"></span>
                100% OPEN SOURCE (MIT &amp; APACHE 2.0)
              </span>
              <span className="text-obsidian-subtle">{"//"}</span>
              <span className="text-jade font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse"></span>
                STELLAR SOROBAN: ACTIVE
              </span>
              <span className="text-obsidian-subtle">{"//"}</span>
              <span>x402 MACHINE-TO-MACHINE SPEC</span>
              <span className="text-obsidian-subtle">{"//"}</span>
              <span className="text-amber-200">ZERO-TRUST HTLC ESCROW</span>
              <span className="text-obsidian-subtle">{"//"}</span>
              <span>SUB-SECOND FINALITY &bull; 0.00001 XLM GAS</span>
              <span className="text-obsidian-subtle">{"//"}</span>
              <span className="text-alabaster">AUDITABLE RUST BYTECODE</span>
              <span className="text-obsidian-subtle">{"//"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sovereign Navigation Bar */}
      <Navbar />

      {/* Main Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 bg-alabaster bg-alabaster-grid border-b-2 border-obsidian overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-12 gap-12 items-center"
          >
            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2">
                <span className="bg-obsidian text-amber-300 px-3 py-1 font-mono text-xs md:text-sm font-bold uppercase border-2 border-obsidian shadow-brutal-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  AUTONOMOUS MACHINE COMMERCE
                </span>
                <span className="bg-white px-3 py-1 font-mono text-xs md:text-sm font-bold uppercase text-obsidian border-2 border-obsidian shadow-brutal-sm">
                  SOROBAN SMART CONTRACTS
                </span>
                <span className="bg-amber-100 text-amber-950 px-3 py-1 font-mono text-xs md:text-sm font-bold uppercase border-2 border-obsidian shadow-brutal-sm flex items-center gap-1.5">
                  <GithubIcon className="w-3.5 h-3.5" />
                  100% OPEN SOURCE
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1 
                variants={itemVariants}
                className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-black tracking-tight leading-[0.96] uppercase text-obsidian"
              >
                Sovereign <br />
                <span className="inline-block bg-amber-400 border-3 border-obsidian px-4 py-1 my-2 shadow-brutal-md text-obsidian -rotate-1">
                  Voice-to-Voice
                </span> <br />
                Commerce
              </motion.h1>

              {/* Subheadline */}
              <motion.p 
                variants={itemVariants}
                className="text-lg sm:text-xl md:text-2xl text-obsidian/90 font-medium leading-relaxed max-w-2xl bg-white border-2 border-obsidian p-5 shadow-brutal"
              >
                VoxTrade is the open source protocol empowering AI agents and humans to negotiate terms, lock escrows, and stream micropayments at sub-second voice cadence on Stellar Soroban.
              </motion.p>

              {/* Metric Cards */}
              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3.5 pt-2">
                <div className="bg-white border-2 border-obsidian p-4 shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5 transition-all">
                  <div className="font-mono text-xs font-bold text-obsidian/60 uppercase">SETTLEMENT</div>
                  <div className="font-extrabold text-2xl md:text-3xl text-obsidian mt-0.5">&lt; 1.2s</div>
                  <div className="text-[11px] font-mono text-obsidian/80 font-medium">Stellar SCP Finality</div>
                </div>
                <div className="bg-white border-2 border-obsidian p-4 shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5 transition-all">
                  <div className="font-mono text-xs font-bold text-obsidian/60 uppercase">BASE FEE</div>
                  <div className="font-extrabold text-2xl md:text-3xl text-obsidian mt-0.5">0.00001</div>
                  <div className="text-[11px] font-mono text-obsidian/80 font-medium">XLM on Stellar</div>
                </div>
                <div className="bg-white border-2 border-obsidian p-4 shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5 transition-all">
                  <div className="font-mono text-xs font-bold text-obsidian/60 uppercase">LICENSE</div>
                  <div className="font-extrabold text-2xl md:text-3xl text-obsidian mt-0.5">MIT / APACHE</div>
                  <div className="text-[11px] font-mono text-obsidian/80 font-medium">Public Good Code</div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="bg-amber-500 hover:bg-amber-600 text-obsidian hover:text-white font-bold text-base px-6 py-3.5 border-2 border-obsidian shadow-brutal flex items-center gap-2 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  <Radio className="w-5 h-5" />
                  <span>LAUNCH VOICE ROOM</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <a
                  href="#open-source"
                  className="bg-white hover:bg-alabaster text-obsidian font-mono text-xs font-bold uppercase px-5 py-3.5 border-2 border-obsidian shadow-brutal flex items-center gap-2 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>EXPLORE GITHUB CODE</span>
                </a>
              </motion.div>
            </div>

            {/* Right Column: Merchant Access Card */}
            <motion.div variants={itemVariants} className="lg:col-span-5">
              <div className="bg-white border-3 border-obsidian shadow-brutal-xl relative">
                {/* Header Window Bar */}
                <div className="bg-obsidian text-white p-4 border-b-2 border-obsidian flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block border border-obsidian"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block border border-obsidian"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-300 inline-block border border-obsidian"></span>
                  </div>
                  <span className="font-mono text-xs font-bold tracking-widest text-amber-300 uppercase">
                    TREASURY GATEWAY // AUTH
                  </span>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <div className="space-y-2 border-b border-obsidian/15 pb-5">
                    <div className="inline-block bg-amber-100 border border-amber-300 text-amber-900 px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider rounded-xs">
                      STEP 1: AUTHORIZE
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-obsidian">
                      Merchant Access
                    </h2>
                    <p className="text-sm font-medium text-obsidian/80 leading-relaxed">
                      Connect your Freighter wallet to configure your AI Treasury and establish 24-hour cryptographic spending limits.
                    </p>
                  </div>

                  {/* Wallet Connection Component */}
                  <div className="space-y-4">
                    <FreighterConnect />
                  </div>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-dashed border-obsidian/30"></div>
                    </div>
                    <span className="relative bg-white px-3 font-mono text-xs font-bold uppercase text-obsidian/60">
                      THEN PROCEED
                    </span>
                  </div>

                  {/* Proceed to Dashboard CTA */}
                  <Link
                    href="/dashboard"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-obsidian hover:text-white text-base md:text-lg font-bold uppercase tracking-wider py-4 px-6 border-2 border-obsidian shadow-brutal flex items-center justify-center gap-3 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-md active:translate-x-1 active:translate-y-1 active:shadow-none group text-center cursor-pointer"
                  >
                    <Radio className="w-5 h-5 text-obsidian group-hover:text-white" />
                    <span>Enter Voice Room &amp; Dashboard</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5] group-hover:translate-x-1.5 transition-transform" />
                  </Link>

                  <div className="bg-alabaster border border-obsidian/20 p-3 font-mono text-[11px] space-y-1 text-obsidian rounded-xs">
                    <div className="flex justify-between">
                      <span className="text-obsidian/60 font-medium">CONTRACT:</span>
                      <span className="font-bold truncate max-w-[170px]">AgentTreasury.wasm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-obsidian/60 font-medium">STANDARD:</span>
                      <span className="font-bold">x402 Micropayments</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-obsidian/60 font-medium">LICENSE:</span>
                      <span className="font-bold text-jade">Open Source (MIT / Apache)</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Acoustic Voice Simulation Widget (#telemetry) */}
      <section id="telemetry" className="scroll-mt-20 py-14 bg-obsidian text-alabaster border-b-2 border-obsidian relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-obsidian-surface border-2 border-amber-600/70 shadow-brutal-amber p-6 sm:p-8 rounded-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-obsidian-subtle pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-amber-500 text-obsidian px-2.5 py-0.5 font-mono text-xs font-bold uppercase">
                    ACOUSTIC TESTBENCH
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400 font-mono text-xs font-semibold">
                    <Radio className="w-4 h-4 animate-pulse text-amber-400" />
                    AUTONOMOUS VOICE-TO-VOICE TELEMETRY
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-alabaster">
                  Real-Time Voice Negotiation &amp; Stream Settlement
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlayingAudioSim(!isPlayingAudioSim)}
                  className="bg-amber-500 hover:bg-amber-400 text-obsidian font-mono text-xs font-bold uppercase px-4 py-2 border border-obsidian shadow-sm flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  {isPlayingAudioSim ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-obsidian" />
                      PAUSE SIMULATION
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-obsidian" />
                      RESUME SIMULATION
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Visualizer Grid */}
            <div className="grid md:grid-cols-12 gap-6 items-center">
              {/* Agent Alpha Node */}
              <div className="md:col-span-4 bg-obsidian border border-amber-700/40 p-4 space-y-3 rounded-xs">
                <div className="flex items-center justify-between border-b border-obsidian-subtle pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-amber-500 text-obsidian flex items-center justify-center font-bold text-xs">
                      A1
                    </div>
                    <span className="font-bold text-sm uppercase text-alabaster">Agent Alpha (Client)</span>
                  </div>
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 font-bold border border-amber-400/40">
                    BUYER
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="text-alabaster/60">INTENT: &quot;Stream voice audio 48kHz&quot;</div>
                  <div className="text-amber-300 font-bold bg-obsidian-surface border border-obsidian-subtle p-2">
                    DAILY CAP: 10.00 USDC
                  </div>
                  <div className="flex items-center gap-1.5 text-jade font-semibold text-[11px] pt-0.5">
                    <span className="w-2 h-2 rounded-full bg-jade animate-ping"></span>
                    <span>FREIGHTER AUTHORIZED</span>
                  </div>
                </div>
              </div>

              {/* Middle: 20 Acoustic Equalizer Bars & HTLC Lock */}
              <div className="md:col-span-4 flex flex-col items-center justify-center space-y-4 bg-obsidian border border-amber-500/50 p-5 rounded-xs">
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>SOROBAN HTLC LOCK ACTIVE</span>
                </div>

                {/* 20 Animated Audio Bars in Amber Gold */}
                <div className="flex items-center justify-center gap-1.5 h-14 w-full py-1">
                  {[16, 36, 12, 46, 26, 50, 20, 40, 14, 42, 30, 18, 44, 28, 14, 48, 22, 36, 16, 26].map((height, idx) => (
                    <div
                      key={idx}
                      style={{
                        height: isPlayingAudioSim ? `${Math.max(8, (height * (simProgress % 22 + 6)) / 16)}px` : '8px',
                        transition: 'height 0.2s ease'
                      }}
                      className="w-1.5 bg-amber-400 rounded-xs shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                    />
                  ))}
                </div>

                <div className="w-full bg-obsidian-surface border border-obsidian-subtle p-2.5 text-center rounded-xs">
                  <div className="font-mono text-xs font-bold text-alabaster flex justify-between px-1">
                    <span>RATE: 100 STROOPS / SEC</span>
                    <span className="text-amber-400">{stroopsStreamed.toLocaleString()} STROOPS</span>
                  </div>
                  <div className="w-full bg-obsidian border border-obsidian-subtle h-2.5 mt-2 overflow-hidden rounded-xs">
                    <div 
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${simProgress}%` }}
                    />
                  </div>
                  <div className="font-mono text-[10px] text-alabaster/60 mt-1.5">
                    PREIMAGE EXCHANGE: VERIFIED ON STELLAR &bull; {simProgress.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Agent Beta Node */}
              <div className="md:col-span-4 bg-obsidian border border-amber-700/40 p-4 space-y-3 rounded-xs">
                <div className="flex items-center justify-between border-b border-obsidian-subtle pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-alabaster text-obsidian flex items-center justify-center font-bold text-xs">
                      B2
                    </div>
                    <span className="font-bold text-sm uppercase text-alabaster">Agent Beta (Provider)</span>
                  </div>
                  <span className="bg-alabaster/20 text-alabaster text-[10px] font-mono px-2 py-0.5 font-bold border border-alabaster/30">
                    SYNTHESIZER
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="text-alabaster/60">SERVICE: &quot;Synthetic Speech Inference&quot;</div>
                  <div className="text-amber-300 font-bold bg-obsidian-surface border border-obsidian-subtle p-2">
                    SETTLEMENT: 0.05 USDC / MIN
                  </div>
                  <div className="flex items-center gap-1.5 text-jade font-semibold text-[11px] pt-0.5">
                    <span className="w-2 h-2 rounded-full bg-jade"></span>
                    <span>STELLAR TESTNET NODE #4</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Microphone Audio & Micropayment Streamer */}
            <div className="mt-8 pt-8 border-t border-obsidian-subtle">
              <VoiceMicVisualizer />
            </div>
          </div>
        </div>
      </section>

      {/* DEDICATED STELLAR SECTION: WHY STELLAR & HOW SOROBAN POWERS VOXTRADE (#stellar) */}
      <section id="stellar" className="scroll-mt-20 py-20 md:py-28 bg-white border-b-2 border-obsidian">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-block bg-amber-100 border border-amber-300 text-amber-900 px-4 py-1 font-mono text-xs md:text-sm font-bold uppercase rounded-xs">
              THE SETTLEMENT LAYER
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-obsidian">
              Why Stellar Powers Voice Commerce
            </h2>
            <p className="text-lg md:text-xl font-normal text-obsidian/80 leading-relaxed">
              Real-time voice AI requires sub-second payment cadence at fractional costs. Why traditional blockchains fail acoustic commerce, and how Stellar&apos;s Soroban architecture makes machine-to-machine streaming possible.
            </p>
          </div>

          {/* 4 Pillars of Stellar Advantage Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Sub-second Finality */}
            <div className="bg-alabaster border-2 border-obsidian p-6 shadow-brutal flex flex-col justify-between space-y-4 hover:shadow-brutal-md transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-amber-500 border-2 border-obsidian shadow-brutal-sm flex items-center justify-center font-bold text-obsidian">
                  <Zap className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="font-mono text-xs font-bold text-amber-800 uppercase">
                  SCP CONSENSUS // 01
                </div>
                <h3 className="text-xl font-extrabold uppercase text-obsidian">
                  Sub-Second Finality (~1.2s)
                </h3>
                <p className="text-xs sm:text-sm text-obsidian/80 font-medium leading-relaxed">
                  Human and AI dialogue occurs in milliseconds. 12-second block times (Ethereum) or probabilistic finality (PoW) stall conversations. Stellar&apos;s Federated Byzantine Agreement finalizes micro-settlements synchronously with speech cadence.
                </p>
              </div>
              <div className="bg-white border border-obsidian/20 p-2.5 font-mono text-[11px] font-bold text-obsidian rounded-xs">
                SCP: Deterministic Finality
              </div>
            </div>

            {/* Pillar 2: Microscopic Fees */}
            <div className="bg-alabaster border-2 border-obsidian p-6 shadow-brutal flex flex-col justify-between space-y-4 hover:shadow-brutal-md transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-obsidian border-2 border-obsidian shadow-brutal-sm flex items-center justify-center font-bold text-amber-400">
                  <Coins className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="font-mono text-xs font-bold text-amber-800 uppercase">
                  UNIT ECONOMICS // 02
                </div>
                <h3 className="text-xl font-extrabold uppercase text-obsidian">
                  Micro-Fees (0.00001 XLM)
                </h3>
                <p className="text-xs sm:text-sm text-obsidian/80 font-medium leading-relaxed">
                  When streaming 48kHz audio at 100 stroops per second, paying $0.50–$15 in L1/L2 gas ruins unit economics. Stellar&apos;s base fee is a fraction of a cent ($0.000001), enabling millions of micro-transfers without financial friction.
                </p>
              </div>
              <div className="bg-white border border-obsidian/20 p-2.5 font-mono text-[11px] font-bold text-obsidian rounded-xs">
                Base Fee: 100 Stroops / Tx
              </div>
            </div>

            {/* Pillar 3: Soroban Rust Contracts */}
            <div className="bg-alabaster border-2 border-obsidian p-6 shadow-brutal flex flex-col justify-between space-y-4 hover:shadow-brutal-md transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-amber-500 border-2 border-obsidian shadow-brutal-sm flex items-center justify-center font-bold text-obsidian">
                  <Cpu className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="font-mono text-xs font-bold text-amber-800 uppercase">
                  WASM ENGINE // 03
                </div>
                <h3 className="text-xl font-extrabold uppercase text-obsidian">
                  Soroban WebAssembly
                </h3>
                <p className="text-xs sm:text-sm text-obsidian/80 font-medium leading-relaxed">
                  Rust-powered Soroban smart contracts run deterministic WebAssembly bytecode directly on ledger. Zero MEV sandwich attacks, isolated state footprints, and native cryptographic SHA-256 verification primitives.
                </p>
              </div>
              <div className="bg-white border border-obsidian/20 p-2.5 font-mono text-[11px] font-bold text-obsidian rounded-xs">
                Rust Wasm: Zero MEV Spikes
              </div>
            </div>

            {/* Pillar 4: Native Stablecoin Liquidity */}
            <div className="bg-alabaster border-2 border-obsidian p-6 shadow-brutal flex flex-col justify-between space-y-4 hover:shadow-brutal-md transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-obsidian border-2 border-obsidian shadow-brutal-sm flex items-center justify-center font-bold text-amber-400">
                  <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="font-mono text-xs font-bold text-amber-800 uppercase">
                  STABLE RAILS // 04
                </div>
                <h3 className="text-xl font-extrabold uppercase text-obsidian">
                  Native USDC Settlement
                </h3>
                <p className="text-xs sm:text-sm text-obsidian/80 font-medium leading-relaxed">
                  Direct on-chain settlement in regulated Circle USDC on Stellar rails. No bridge hacks, wrapped tokens, or cross-chain relayers. Agents transact in pure dollar equivalents with cryptographic certainty.
                </p>
              </div>
              <div className="bg-white border border-obsidian/20 p-2.5 font-mono text-[11px] font-bold text-obsidian rounded-xs">
                Native USDC: Zero Bridge Risk
              </div>
            </div>
          </div>

          {/* How VoxTrade Implements Stellar: Live Architecture Callout */}
          <div className="border-3 border-obsidian bg-obsidian text-alabaster p-6 sm:p-10 shadow-brutal-xl space-y-8 rounded-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-obsidian-subtle pb-6">
              <div>
                <span className="bg-amber-500 text-obsidian px-2.5 py-0.5 font-mono text-xs font-bold uppercase">
                  ON-CHAIN IMPLEMENTATION
                </span>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-2">
                  How VoxTrade Executes On Stellar Testnet
                </h3>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-jade animate-pulse"></span>
                <span>SOROBAN PROTOCOL 22 ACTIVE</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Contract 1: AgentTreasury */}
              <div className="bg-obsidian-surface border-2 border-amber-600/60 p-5 sm:p-6 space-y-4 rounded-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-500 text-obsidian font-bold flex items-center justify-center text-xs">
                      T1
                    </div>
                    <h4 className="text-lg font-black uppercase text-white">AgentTreasury.wasm</h4>
                  </div>
                  <span className="bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 border border-amber-500/30">
                    HARD BUDGET GUARD
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-alabaster/80 leading-relaxed font-sans">
                  Prevents autonomous voice AI agents from draining accounts. Enforces rolling 24-hour cryptographic spending limits. Any agent call exceeding the merchant&apos;s authorized threshold is rejected directly by Soroban VM state.
                </p>
                <div className="bg-obsidian p-3 border border-obsidian-subtle space-y-1 font-mono text-xs">
                  <div className="text-alabaster/60 flex justify-between">
                    <span>TESTNET ADDRESS:</span>
                    <button
                      type="button"
                      onClick={() => copyText(TREASURY_CONTRACT_ID, 'treasury')}
                      className="text-amber-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'treasury' ? <Check className="w-3 h-3 text-jade" /> : <Copy className="w-3 h-3" />}
                      <span>COPY</span>
                    </button>
                  </div>
                  <div className="font-bold text-amber-300 truncate">{TREASURY_CONTRACT_ID}</div>
                </div>
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${TREASURY_CONTRACT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 hover:text-white transition-colors"
                >
                  <span>INSPECT ON STELLAREXPERT</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Contract 2: X402Escrow */}
              <div className="bg-obsidian-surface border-2 border-amber-600/60 p-5 sm:p-6 space-y-4 rounded-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-500 text-obsidian font-bold flex items-center justify-center text-xs">
                      E2
                    </div>
                    <h4 className="text-lg font-black uppercase text-white">X402Escrow.wasm</h4>
                  </div>
                  <span className="bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 border border-amber-500/30">
                    HTLC SETTLEMENT
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-alabaster/80 leading-relaxed font-sans">
                  Non-custodial Hash Time-Locked Escrow. Funds are locked with a 32-byte SHA-256 hash. When speech inference is delivered, the client reveals the secret preimage to stream settlement. Expired escrows refund automatically.
                </p>
                <div className="bg-obsidian p-3 border border-obsidian-subtle space-y-1 font-mono text-xs">
                  <div className="text-alabaster/60 flex justify-between">
                    <span>TESTNET ADDRESS:</span>
                    <button
                      type="button"
                      onClick={() => copyText(ESCROW_CONTRACT_ID, 'escrow')}
                      className="text-amber-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'escrow' ? <Check className="w-3 h-3 text-jade" /> : <Copy className="w-3 h-3" />}
                      <span>COPY</span>
                    </button>
                  </div>
                  <div className="font-bold text-amber-300 truncate">{ESCROW_CONTRACT_ID}</div>
                </div>
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${ESCROW_CONTRACT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 hover:text-white transition-colors"
                >
                  <span>INSPECT ON STELLAREXPERT</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (3 Grid Cards) */}
      <section className="py-20 md:py-28 bg-alabaster bg-alabaster-dots border-b-2 border-obsidian">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-block bg-amber-100 border border-amber-300 text-amber-900 px-4 py-1 font-mono text-xs md:text-sm font-bold uppercase rounded-xs">
              ENGINEERED FOR MACHINES
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-obsidian">
              Autonomous Infrastructure
            </h2>
            <p className="text-lg md:text-xl font-normal text-obsidian/80 leading-relaxed">
              Traditional payment rails fail when AI agents transact at millisecond voice-cadence. VoxTrade bridges voice intelligence with cryptographic Soroban smart contracts.
            </p>
          </div>

          {/* 3 Grid Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Trustless Escrow */}
            <motion.div 
              whileHover={{ y: -6, rotate: -0.5 }}
              className="bg-white border-2 border-obsidian p-8 shadow-brutal flex flex-col justify-between space-y-6 transition-shadow hover:shadow-brutal-lg relative group cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-obsidian/15 pb-4">
                  <div className="w-14 h-14 bg-amber-500 border-2 border-obsidian shadow-brutal-sm flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <Lock className="w-7 h-7 text-obsidian stroke-[2.2]" />
                  </div>
                  <span className="font-mono text-xs font-bold bg-obsidian text-amber-300 px-2.5 py-1">
                    HTLC // 01
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-obsidian">
                  Trustless Escrow
                </h3>

                <p className="text-obsidian/80 font-medium text-base leading-relaxed">
                  Cryptographic Hash Time-Locked Contracts ensure funds are only released when Voice AI services are successfully rendered.
                </p>
              </div>

              <div className="bg-alabaster border border-obsidian/30 p-3 font-mono text-xs space-y-1 rounded-xs">
                <div className="text-obsidian/50 font-bold uppercase">PRIMITIVE:</div>
                <div className="font-bold text-obsidian">SHA-256 Preimage Verification</div>
              </div>
            </motion.div>

            {/* Feature 2: Sub-second Finality */}
            <motion.div 
              whileHover={{ y: -6, rotate: 0.5 }}
              className="bg-white border-2 border-obsidian p-8 shadow-brutal flex flex-col justify-between space-y-6 transition-shadow hover:shadow-brutal-lg relative group cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-obsidian/15 pb-4">
                  <div className="w-14 h-14 bg-obsidian border-2 border-obsidian shadow-brutal-sm flex items-center justify-center group-hover:-rotate-6 transition-transform">
                    <Zap className="w-7 h-7 text-amber-400 stroke-[2.2]" />
                  </div>
                  <span className="font-mono text-xs font-bold bg-obsidian text-white px-2.5 py-1">
                    STELLAR // 02
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-obsidian">
                  Sub-second Finality
                </h3>

                <p className="text-obsidian/80 font-medium text-base leading-relaxed">
                  Leveraging the Stellar network for near-instantaneous transaction settlement at a fraction of a cent per operation.
                </p>
              </div>

              <div className="bg-alabaster border border-obsidian/30 p-3 font-mono text-xs space-y-1 rounded-xs">
                <div className="text-obsidian/50 font-bold uppercase">NETWORK:</div>
                <div className="font-bold text-obsidian">Stellar Consensus Protocol (SCP)</div>
              </div>
            </motion.div>

            {/* Feature 3: Cryptographic Bounds */}
            <motion.div 
              whileHover={{ y: -6, rotate: -0.5 }}
              className="bg-white border-2 border-obsidian p-8 shadow-brutal flex flex-col justify-between space-y-6 transition-shadow hover:shadow-brutal-lg relative group cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-obsidian/15 pb-4">
                  <div className="w-14 h-14 bg-amber-500 border-2 border-obsidian shadow-brutal-sm flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <ShieldCheck className="w-7 h-7 text-obsidian stroke-[2.2]" />
                  </div>
                  <span className="font-mono text-xs font-bold bg-obsidian text-amber-300 px-2.5 py-1">
                    LIMITS // 03
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-obsidian">
                  Cryptographic Bounds
                </h3>

                <p className="text-obsidian/80 font-medium text-base leading-relaxed">
                  Merchants configure strict 24-hour spending limits. The AI agent cannot spend a single stroop beyond its authorized budget.
                </p>
              </div>

              <div className="bg-alabaster border border-obsidian/30 p-3 font-mono text-xs space-y-1 rounded-xs">
                <div className="text-obsidian/50 font-bold uppercase">MAX SLIPPAGE:</div>
                <div className="font-bold text-obsidian">0 Stroops (Strict On-Chain Guard)</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Protocol Architecture Steps (#protocol) */}
      <section id="protocol" className="scroll-mt-20 py-20 bg-white border-b-2 border-obsidian">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-2 border-obsidian bg-alabaster p-8 md:p-12 shadow-brutal-xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-b-2 border-obsidian/15 pb-8">
              <div>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 font-mono text-xs font-bold uppercase rounded-xs">
                  PROTOCOL SPECIFICATION
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-obsidian mt-3">
                  How Voice-to-Voice Commerce Executes
                </h2>
              </div>
              <div className="font-mono text-xs font-semibold text-obsidian/60 max-w-sm">
                Three automated phases conducted autonomously between AI agents without human intervention.
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3.5 bg-white border-2 border-obsidian p-6 shadow-brutal-sm">
                <div className="w-10 h-10 bg-amber-500 border-2 border-obsidian shadow-brutal-sm flex items-center justify-center font-bold text-lg text-obsidian">
                  01
                </div>
                <h4 className="text-xl font-bold uppercase text-obsidian">Voice Handshake &amp; Quotation</h4>
                <p className="text-sm font-medium text-obsidian/80 leading-relaxed">
                  Agents connect over WebRTC/Voice channels. They parse intent and negotiate terms (e.g. 100 stroops per second for real-time speech translation).
                </p>
              </div>

              <div className="space-y-3.5 bg-white border-2 border-obsidian p-6 shadow-brutal-sm">
                <div className="w-10 h-10 bg-obsidian border-2 border-obsidian shadow-brutal-sm flex items-center justify-center font-bold text-lg text-amber-300">
                  02
                </div>
                <h4 className="text-xl font-bold uppercase text-obsidian">Soroban HTLC Lock</h4>
                <p className="text-sm font-medium text-obsidian/80 leading-relaxed">
                  The consumer agent locks funds in the AgentTreasury contract using an HTLC hash. The contract verifies daily spending limits before committing.
                </p>
              </div>

              <div className="space-y-3.5 bg-white border-2 border-obsidian p-6 shadow-brutal-sm">
                <div className="w-10 h-10 bg-amber-500 border-2 border-obsidian shadow-brutal-sm flex items-center justify-center font-bold text-lg text-obsidian">
                  03
                </div>
                <h4 className="text-xl font-bold uppercase text-obsidian">Autonomous Preimage Stream</h4>
                <p className="text-sm font-medium text-obsidian/80 leading-relaxed">
                  As each audio chunk completes, preimages are exchanged on Stellar. Funds stream instantaneously to the provider with zero counterparty risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEDICATED OPEN SOURCE SHOWCASE SECTION (#open-source) */}
      <section id="open-source" className="scroll-mt-20 py-20 md:py-28 bg-alabaster bg-alabaster-grid border-b-2 border-obsidian">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-jade/15 border border-jade/40 text-jade-950 px-4 py-1 font-mono text-xs md:text-sm font-bold uppercase rounded-xs">
              <GithubIcon className="w-4 h-4" />
              <span>100% FREE &amp; OPEN SOURCE PUBLIC GOOD</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-obsidian">
              Built In Public On GitHub
            </h2>
            <p className="text-lg md:text-xl font-normal text-obsidian/80 leading-relaxed">
              VoxTrade is completely open source under the MIT and Apache 2.0 licenses. Inspect the Rust smart contracts, verify WebAssembly bytecode hashes, run local testnodes, or fork and deploy your own autonomous voice agent fleet.
            </p>
          </div>

          {/* Dual Repositories Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Repo 1: voxtrade-contract */}
            <div className="bg-white border-3 border-obsidian p-6 sm:p-8 shadow-brutal-xl flex flex-col justify-between space-y-6 hover:shadow-brutal-2xl transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-obsidian/15 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-500 border-2 border-obsidian shadow-brutal-sm flex items-center justify-center font-bold text-obsidian">
                      <FileCode className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold text-amber-800 uppercase block">
                        RUST // SOROBAN
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black uppercase text-obsidian">
                        voxtrade-contract
                      </h3>
                    </div>
                  </div>
                  <span className="bg-obsidian text-amber-300 font-mono text-xs font-bold px-2.5 py-1">
                    APACHE / MIT
                  </span>
                </div>

                <p className="text-sm font-medium text-obsidian/80 leading-relaxed">
                  The on-chain core containing Soroban smart contracts written in Rust. Features <code className="bg-alabaster px-1.5 py-0.5 border border-obsidian/20 font-bold">agent_treasury</code> for hard daily limits and <code className="bg-alabaster px-1.5 py-0.5 border border-obsidian/20 font-bold">x402_escrow</code> for cryptographic HTLC voice micro-settlements.
                </p>

                {/* Tech & Metrics Pills */}
                <div className="flex flex-wrap gap-2 font-mono text-xs">
                  <span className="bg-alabaster border border-obsidian/20 px-2.5 py-1 font-bold text-obsidian">
                    Rust 1.81+
                  </span>
                  <span className="bg-alabaster border border-obsidian/20 px-2.5 py-1 font-bold text-obsidian">
                    24/24 Cargo Tests Passing
                  </span>
                  <span className="bg-alabaster border border-obsidian/20 px-2.5 py-1 font-bold text-obsidian">
                    Protocol 22 Compatible
                  </span>
                  <span className="bg-jade/20 border border-jade/40 px-2.5 py-1 font-bold text-jade-950">
                    GitHub Actions CI Green
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-obsidian/15">
                <a
                  href="https://github.com/voxxtrade/voxtrade-contract"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-obsidian hover:bg-obsidian-surface text-amber-300 font-mono text-xs font-bold uppercase py-3.5 px-4 border-2 border-obsidian shadow-brutal-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>VIEW VOXTRADE-CONTRACT REPO</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => copyText('git clone https://github.com/voxxtrade/voxtrade-contract.git', 'clone-contract')}
                  className="w-full bg-alabaster hover:bg-white text-obsidian font-mono text-[11px] font-bold uppercase py-2 px-3 border border-obsidian/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedKey === 'clone-contract' ? (
                    <>
                      <Check className="w-3 h-3 text-jade" />
                      <span className="text-jade">COPIED CLONE COMMAND</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>git clone voxxtrade-contract.git</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Repo 2: voxtrade-app */}
            <div className="bg-white border-3 border-obsidian p-6 sm:p-8 shadow-brutal-xl flex flex-col justify-between space-y-6 hover:shadow-brutal-2xl transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-obsidian/15 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-500 border-2 border-obsidian shadow-brutal-sm flex items-center justify-center font-bold text-obsidian">
                      <Code className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold text-amber-800 uppercase block">
                        NEXT.JS // SDK // WEB AUDIO
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black uppercase text-obsidian">
                        voxtrade-app
                      </h3>
                    </div>
                  </div>
                  <span className="bg-obsidian text-amber-300 font-mono text-xs font-bold px-2.5 py-1">
                    MIT LICENSE
                  </span>
                </div>

                <p className="text-sm font-medium text-obsidian/80 leading-relaxed">
                  The complete web application and TypeScript SDK (<code className="bg-alabaster px-1.5 py-0.5 border border-obsidian/20 font-bold">@voxtrade/sdk</code>). Includes the Live Voice Negotiation Room (3 modes), Web Speech API audio visualizers, AI smart contract drafter, and Freighter wallet controller.
                </p>

                {/* Tech & Metrics Pills */}
                <div className="flex flex-wrap gap-2 font-mono text-xs">
                  <span className="bg-alabaster border border-obsidian/20 px-2.5 py-1 font-bold text-obsidian">
                    Next.js 14 App Router
                  </span>
                  <span className="bg-alabaster border border-obsidian/20 px-2.5 py-1 font-bold text-obsidian">
                    17/17 Vitest Passing
                  </span>
                  <span className="bg-alabaster border border-obsidian/20 px-2.5 py-1 font-bold text-obsidian">
                    Web Speech &amp; Audio API
                  </span>
                  <span className="bg-jade/20 border border-jade/40 px-2.5 py-1 font-bold text-jade-950">
                    GitHub Actions CI Green
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-obsidian/15">
                <a
                  href="https://github.com/voxxtrade/voxtrade-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-obsidian hover:bg-obsidian-surface text-amber-300 font-mono text-xs font-bold uppercase py-3.5 px-4 border-2 border-obsidian shadow-brutal-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>VIEW VOXTRADE-APP REPO</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => copyText('git clone https://github.com/voxxtrade/voxtrade-app.git', 'clone-app')}
                  className="w-full bg-alabaster hover:bg-white text-obsidian font-mono text-[11px] font-bold uppercase py-2 px-3 border border-obsidian/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedKey === 'clone-app' ? (
                    <>
                      <Check className="w-3 h-3 text-jade" />
                      <span className="text-jade">COPIED CLONE COMMAND</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>git clone voxtrade-app.git</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Open Source Principles Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-white border-2 border-obsidian p-4 shadow-brutal-sm space-y-1">
              <div className="font-bold uppercase text-obsidian flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-jade" />
                <span>Zero Lock-In</span>
              </div>
              <p className="text-[11px] text-obsidian/70">Self-hostable contracts and frontends without vendor dependence.</p>
            </div>

            <div className="bg-white border-2 border-obsidian p-4 shadow-brutal-sm space-y-1">
              <div className="font-bold uppercase text-obsidian flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-jade" />
                <span>Auditable Rust</span>
              </div>
              <p className="text-[11px] text-obsidian/70">Every WASM bytecode is verifiable on the Stellar public ledger.</p>
            </div>

            <div className="bg-white border-2 border-obsidian p-4 shadow-brutal-sm space-y-1">
              <div className="font-bold uppercase text-obsidian flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-jade" />
                <span>Zero Protocol Rent</span>
              </div>
              <p className="text-[11px] text-obsidian/70">No middleman fees or proprietary token taxes. Transact in pure USDC.</p>
            </div>

            <div className="bg-white border-2 border-obsidian p-4 shadow-brutal-sm space-y-1">
              <div className="font-bold uppercase text-obsidian flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-jade" />
                <span>Public Good</span>
              </div>
              <p className="text-[11px] text-obsidian/70">Contributions and pull requests welcome across all repositories.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-obsidian text-alabaster border-b-2 border-obsidian">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7">
          <div className="inline-block bg-obsidian-surface border border-amber-500/50 text-amber-300 px-4 py-1.5 font-mono text-xs font-bold uppercase">
            INSTITUTIONAL AGENT INFRASTRUCTURE
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight max-w-4xl mx-auto leading-none text-alabaster">
            INITIALIZE YOUR STELLAR AGENT TREASURY TODAY
          </h2>
          <p className="text-lg md:text-xl text-alabaster/70 font-medium max-w-2xl mx-auto leading-relaxed">
            Connect Freighter, establish your daily spending ceiling, and let your AI voice agents conduct sovereign commerce.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-obsidian text-lg font-bold uppercase tracking-wider py-4 px-8 border-2 border-obsidian shadow-[6px_6px_0px_0px_#ffffff] hover:shadow-[8px_8px_0px_0px_#ffffff] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <span>ENTER AGENT DASHBOARD</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </Link>

            <a
              href="https://voxxtrade.github.io/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-obsidian font-mono text-sm font-bold uppercase py-4 px-6 border-2 border-obsidian shadow-brutal transition-all cursor-pointer"
            >
              <BookOpen className="w-5 h-5" />
              <span>EXPLORE DOCS</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/voxxtrade/voxtrade-app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-obsidian-surface hover:bg-white hover:text-obsidian text-alabaster font-mono text-sm font-bold uppercase py-4 px-6 border-2 border-alabaster/40 shadow-brutal transition-all cursor-pointer"
            >
              <GithubIcon className="w-5 h-5" />
              <span>STAR ON GITHUB</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-obsidian py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1 */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-obsidian text-amber-400 border-2 border-obsidian shadow-brutal-sm flex items-center justify-center font-bold text-xl">
                  VX
                </div>
                <div>
                  <div className="font-extrabold text-xl tracking-tight text-obsidian">VoxTrade</div>
                  <div className="font-mono text-xs text-obsidian/60">Sovereign Voice-to-Voice Commerce on Stellar</div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-obsidian/75 font-medium max-w-md leading-relaxed">
                An open source public goods protocol enabling autonomous voice agents to negotiate and stream micropayments on Stellar Soroban with cryptographic daily limits and HTLC security.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="bg-jade/20 text-jade-950 font-mono text-[11px] font-bold px-2 py-0.5 border border-jade/40">
                  OPEN SOURCE
                </span>
                <span className="font-mono text-xs text-obsidian/60">MIT &amp; Apache 2.0</span>
              </div>
            </div>

            {/* Col 2: Repositories */}
            <div className="space-y-3">
              <div className="font-mono text-xs font-bold uppercase text-obsidian tracking-wider">
                OPEN SOURCE CODE
              </div>
              <ul className="space-y-2 font-mono text-xs text-obsidian/80">
                <li>
                  <a
                    href="https://github.com/voxxtrade/voxtrade-contract"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-700 flex items-center gap-1.5 transition-colors"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>voxtrade-contract</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/voxxtrade/voxtrade-app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-700 flex items-center gap-1.5 transition-colors"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>voxtrade-app</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://voxxtrade.github.io/docs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-700 flex items-center gap-1.5 transition-colors font-bold text-amber-900"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                    <span>Documentation Portal</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-amber-700 flex items-center gap-1.5 transition-colors">
                    <Radio className="w-3.5 h-3.5 text-amber-700" />
                    <span>Voice Negotiation Room</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Stellar Network */}
            <div className="space-y-3">
              <div className="font-mono text-xs font-bold uppercase text-obsidian tracking-wider">
                STELLAR &amp; SOROBAN
              </div>
              <ul className="space-y-2 font-mono text-xs text-obsidian/80">
                <li>
                  <a
                    href={`https://stellar.expert/explorer/testnet/contract/${TREASURY_CONTRACT_ID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-700 flex items-center gap-1 transition-colors"
                  >
                    <span>Treasury Contract</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>
                  <a
                    href={`https://stellar.expert/explorer/testnet/contract/${ESCROW_CONTRACT_ID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-700 flex items-center gap-1 transition-colors"
                  >
                    <span>x402 Escrow Contract</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://stellar.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-700 flex items-center gap-1 transition-colors"
                  >
                    <span>Stellar Foundation</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://soroban.stellar.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-700 flex items-center gap-1 transition-colors"
                  >
                    <span>Soroban Docs</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-obsidian/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-obsidian/60">
            <div>
              &copy; 2026 VOXTRADE. 100% FREE AND OPEN SOURCE SOFTWARE.
            </div>
            <div className="flex items-center gap-4">
              <span>Stellar Testnet (Protocol 22)</span>
              <span>&bull;</span>
              <span>x402 Micropayments</span>
              <span>&bull;</span>
              <span>Freighter API</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
