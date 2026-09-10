'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
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
  ArrowUpRight
} from 'lucide-react';

const FreighterConnect = dynamic(() => import('@/components/FreighterConnect'), { 
  ssr: false,
  loading: () => (
    <div className="h-10 px-4 bg-amber-500 border-2 border-obsidian font-mono text-xs font-bold uppercase flex items-center justify-center opacity-70">
      CONNECT FREIGHTER
    </div>
  )
});

export default function Home() {
  const [isPlayingAudioSim, setIsPlayingAudioSim] = useState(true);
  const [simProgress, setSimProgress] = useState(42);
  const [stroopsStreamed, setStroopsStreamed] = useState(4200);

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
              <span className="text-jade-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-jade-400 animate-pulse"></span>
                STELLAR SOROBAN: ACTIVE
              </span>
              <span className="text-obsidian-subtle">{"//"}</span>
              <span>x402 MACHINE-TO-MACHINE SPEC</span>
              <span className="text-obsidian-subtle">{"//"}</span>
              <span className="text-amber-200">ZERO-TRUST HTLC ESCROW</span>
              <span className="text-obsidian-subtle">{"//"}</span>
              <span>SUB-SECOND FINALITY &bull; 0.00001 XLM GAS</span>
              <span className="text-obsidian-subtle">{"//"}</span>
              <span className="text-alabaster">CRYPTOGRAPHIC HARD BOUNDS</span>
              <span className="text-obsidian-subtle">{"//"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Header */}
      <header className="border-b-2 border-obsidian bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-obsidian border-2 border-obsidian shadow-brutal-sm flex items-center justify-center font-bold text-amber-400 text-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                VX
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl tracking-tight leading-none text-obsidian">
                  VoxTrade
                </span>
                <span className="font-mono text-[10px] font-bold text-amber-700 uppercase tracking-wider mt-0.5">
                  Voice Commerce // Soroban
                </span>
              </div>
            </Link>
            <span className="hidden sm:inline-block bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-xs font-mono font-bold uppercase rounded-xs ml-2">
              Testnet SDF
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono font-medium text-obsidian/70 border-r border-obsidian/15 pr-4">
              <span>LATENCY: &lt; 1.2s</span>
              <span>&bull;</span>
              <span>FEE: 0.00001 XLM</span>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-obsidian hover:text-white font-bold text-sm px-5 py-2.5 border-2 border-obsidian shadow-brutal hover:shadow-brutal-md hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <span>DASHBOARD</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </header>

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
                VoxTrade empowers AI agents to negotiate, lock, and stream payments autonomously using Soroban smart contracts and the Stellar network.
              </motion.p>

              {/* Metric Cards */}
              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3.5 pt-2">
                <div className="bg-white border-2 border-obsidian p-4 shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5 transition-all">
                  <div className="font-mono text-xs font-bold text-obsidian/60 uppercase">SETTLEMENT</div>
                  <div className="font-extrabold text-2xl md:text-3xl text-obsidian mt-0.5">&lt; 1.2s</div>
                  <div className="text-[11px] font-mono text-obsidian/80 font-medium">Sub-second Finality</div>
                </div>
                <div className="bg-white border-2 border-obsidian p-4 shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5 transition-all">
                  <div className="font-mono text-xs font-bold text-obsidian/60 uppercase">BASE FEE</div>
                  <div className="font-extrabold text-2xl md:text-3xl text-obsidian mt-0.5">0.00001</div>
                  <div className="text-[11px] font-mono text-obsidian/80 font-medium">XLM on Stellar</div>
                </div>
                <div className="bg-white border-2 border-obsidian p-4 shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5 transition-all">
                  <div className="font-mono text-xs font-bold text-obsidian/60 uppercase">SECURITY</div>
                  <div className="font-extrabold text-2xl md:text-3xl text-obsidian mt-0.5">HTLC</div>
                  <div className="text-[11px] font-mono text-obsidian/80 font-medium">Cryptographic Bounds</div>
                </div>
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
                    <span>Proceed to Dashboard</span>
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
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Acoustic Voice Simulation Widget */}
      <section className="py-14 bg-obsidian text-alabaster border-b-2 border-obsidian relative overflow-hidden">
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
                  Real-Time Voice Negotiation & Stream Settlement
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
          </div>
        </div>
      </section>

      {/* Features Section (3 Grid Cards) */}
      <section className="py-20 md:py-28 bg-white border-b-2 border-obsidian">
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
              className="bg-alabaster border-2 border-obsidian p-8 shadow-brutal flex flex-col justify-between space-y-6 transition-shadow hover:shadow-brutal-lg relative group cursor-pointer"
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

              <div className="bg-white border border-obsidian/30 p-3 font-mono text-xs space-y-1 rounded-xs">
                <div className="text-obsidian/50 font-bold uppercase">PRIMITIVE:</div>
                <div className="font-bold text-obsidian">SHA-256 Preimage Verification</div>
              </div>
            </motion.div>

            {/* Feature 2: Sub-second Finality */}
            <motion.div 
              whileHover={{ y: -6, rotate: 0.5 }}
              className="bg-alabaster border-2 border-obsidian p-8 shadow-brutal flex flex-col justify-between space-y-6 transition-shadow hover:shadow-brutal-lg relative group cursor-pointer"
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

              <div className="bg-white border border-obsidian/30 p-3 font-mono text-xs space-y-1 rounded-xs">
                <div className="text-obsidian/50 font-bold uppercase">NETWORK:</div>
                <div className="font-bold text-obsidian">Stellar Consensus Protocol (SCP)</div>
              </div>
            </motion.div>

            {/* Feature 3: Cryptographic Bounds */}
            <motion.div 
              whileHover={{ y: -6, rotate: -0.5 }}
              className="bg-alabaster border-2 border-obsidian p-8 shadow-brutal flex flex-col justify-between space-y-6 transition-shadow hover:shadow-brutal-lg relative group cursor-pointer"
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

              <div className="bg-white border border-obsidian/30 p-3 font-mono text-xs space-y-1 rounded-xs">
                <div className="text-obsidian/50 font-bold uppercase">MAX SLIPPAGE:</div>
                <div className="font-bold text-obsidian">0 Stroops (Strict On-Chain Guard)</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Protocol Architecture Steps */}
      <section className="py-20 bg-alabaster bg-alabaster-dots border-b-2 border-obsidian">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-2 border-obsidian bg-white p-8 md:p-12 shadow-brutal-xl">
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
              <div className="space-y-3.5">
                <div className="w-10 h-10 bg-amber-500 border-2 border-obsidian shadow-brutal-sm flex items-center justify-center font-bold text-lg text-obsidian">
                  01
                </div>
                <h4 className="text-xl font-bold uppercase text-obsidian">Voice Handshake & Quotation</h4>
                <p className="text-sm font-medium text-obsidian/80 leading-relaxed">
                  Agents connect over WebRTC/Voice channels. They parse intent and negotiate terms (e.g. 100 stroops per second for real-time speech translation).
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="w-10 h-10 bg-obsidian border-2 border-obsidian shadow-brutal-sm flex items-center justify-center font-bold text-lg text-amber-300">
                  02
                </div>
                <h4 className="text-xl font-bold uppercase text-obsidian">Soroban HTLC Lock</h4>
                <p className="text-sm font-medium text-obsidian/80 leading-relaxed">
                  The consumer agent locks funds in the AgentTreasury contract using an HTLC hash. The contract verifies daily spending limits before committing.
                </p>
              </div>

              <div className="space-y-3.5">
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
          <div className="pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-obsidian text-lg font-bold uppercase tracking-wider py-4 px-8 border-2 border-obsidian shadow-[6px_6px_0px_0px_#ffffff] hover:shadow-[8px_8px_0px_0px_#ffffff] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <span>ENTER AGENT DASHBOARD</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-obsidian py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-obsidian text-amber-400 border-2 border-obsidian shadow-brutal-sm flex items-center justify-center font-bold text-xl">
              VX
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-obsidian">VoxTrade</div>
              <div className="font-mono text-xs text-obsidian/60">Sovereign Voice-to-Voice Commerce on Stellar</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono text-xs font-semibold text-obsidian/70">
            <span>Soroban Testnet</span>
            <span>&bull;</span>
            <span>x402 Micropayments</span>
            <span>&bull;</span>
            <span>Freighter Wallet</span>
          </div>

          <div className="font-mono text-xs text-obsidian/60">
            &copy; 2026 VOXTRADE. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </main>
  );
}
