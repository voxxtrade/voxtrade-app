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
  Mic, 
  Radio, 
  Coins, 
  Cpu, 
  Terminal, 
  Sparkles, 
  Activity,
  Layers,
  ChevronRight,
  Play,
  Pause
} from 'lucide-react';

const FreighterConnect = dynamic(() => import('@/components/FreighterConnect'), { ssr: false });

export default function Home() {
  const [isPlayingAudioSim, setIsPlayingAudioSim] = useState(true);
  const [simProgress, setSimProgress] = useState(42);

  // Simulated stream ticks
  useEffect(() => {
    if (!isPlayingAudioSim) return;
    const interval = setInterval(() => {
      setSimProgress((prev) => (prev >= 100 ? 5 : prev + 3));
    }, 400);
    return () => clearInterval(interval);
  }, [isPlayingAudioSim]);

  // Container motion variants for stagger
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring' as const, 
        stiffness: 350, 
        damping: 24 
      } 
    },
  };

  return (
    <main className="min-h-screen bg-neo-bg text-black selection:bg-black selection:text-neo-yellow overflow-x-hidden">
      {/* Top Warning Banner / Marquee */}
      <div className="bg-neo-yellow border-b-4 border-black py-2.5 overflow-hidden select-none font-mono text-xs md:text-sm font-black tracking-wider uppercase">
        <div className="flex w-max animate-marquee space-x-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center space-x-8 shrink-0">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-black"></span>
                AUTONOMOUS VOICE-TO-VOICE COMMERCE
              </span>
              <span>✦</span>
              <span className="bg-black text-neo-yellow px-2 py-0.5">SOROBAN TESTNET LIVE</span>
              <span>✦</span>
              <span>X402 PROTOCOL SPECIFICATION</span>
              <span>✦</span>
              <span className="bg-neo-pink text-black px-2 py-0.5 border border-black">ZERO-TRUST HTLC ESCROW</span>
              <span>✦</span>
              <span>SUB-SECOND STELLAR SETTLEMENT</span>
              <span>✦</span>
              <span>HARD CRYPTOGRAPHIC BOUNDS</span>
              <span>✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Header */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-11 h-11 bg-neo-yellow border-3 border-black shadow-brutal-sm flex items-center justify-center font-black text-2xl group-hover:-rotate-6 transition-transform">
                V
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter leading-none">
                  VOXTRADE
                </span>
                <span className="font-mono text-[10px] font-black text-black tracking-widest uppercase mt-0.5">
                  VOICE // X402 STELLAR
                </span>
              </div>
            </Link>
            <span className="hidden sm:inline-block bg-neo-lime border-2 border-black px-2 py-0.5 text-xs font-black uppercase shadow-brutal-sm ml-2">
              v1.0 BETA
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden md:flex items-center gap-2 bg-neo-bg border-2 border-black px-3 py-1 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>RPC: STELLAR SOROBAN</span>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-neo-pink hover:bg-pink-400 text-black font-black uppercase text-sm px-4 py-2.5 border-3 border-black shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <span>DASHBOARD</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 bg-neo-bg bg-neo-grid border-b-4 border-black">
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
                <span className="bg-black text-neo-yellow px-3 py-1 font-mono text-xs md:text-sm font-black uppercase border-2 border-black shadow-brutal-sm">
                  ⚡ MACHINE-TO-MACHINE AGENT PAYMENTS
                </span>
                <span className="bg-neo-cyan px-3 py-1 font-mono text-xs md:text-sm font-black uppercase border-2 border-black shadow-brutal-sm">
                  SOROBAN SMART CONTRACTS
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1 
                variants={itemVariants}
                className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.95] uppercase"
              >
                Sovereign <br />
                <span className="inline-block bg-neo-yellow border-4 border-black px-3 py-1 my-2 shadow-brutal-lg -rotate-1">
                  Voice-to-Voice
                </span> <br />
                Commerce
              </motion.h1>

              {/* Subheadline */}
              <motion.p 
                variants={itemVariants}
                className="text-lg sm:text-xl md:text-2xl text-black font-medium leading-snug max-w-2xl bg-white border-3 border-black p-4 shadow-brutal"
              >
                VoxTrade empowers AI agents to negotiate, lock, and stream payments autonomously using Soroban smart contracts and the Stellar network.
              </motion.p>

              {/* Quick Spec Badges */}
              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-white border-3 border-black p-3 shadow-brutal-sm">
                  <div className="font-mono text-xs font-bold text-gray-600 uppercase">LATENCY</div>
                  <div className="font-black text-xl md:text-2xl text-black">&lt; 1.2s</div>
                  <div className="text-[10px] font-mono text-black font-semibold">Sub-second Finality</div>
                </div>
                <div className="bg-white border-3 border-black p-3 shadow-brutal-sm">
                  <div className="font-mono text-xs font-bold text-gray-600 uppercase">FEE / OP</div>
                  <div className="font-black text-xl md:text-2xl text-black">0.00001</div>
                  <div className="text-[10px] font-mono text-black font-semibold">XLM on Stellar</div>
                </div>
                <div className="bg-white border-3 border-black p-3 shadow-brutal-sm">
                  <div className="font-mono text-xs font-bold text-gray-600 uppercase">SECURITY</div>
                  <div className="font-black text-xl md:text-2xl text-black">HTLC</div>
                  <div className="text-[10px] font-mono text-black font-semibold">Cryptographic Bounds</div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Merchant Access CTA Card */}
            <motion.div variants={itemVariants} className="lg:col-span-5">
              <div className="bg-white border-4 border-black shadow-brutal-xl relative">
                {/* Neo-brutalist Card Header Bar */}
                <div className="bg-black text-white p-4 border-b-4 border-black flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-neo-pink inline-block border border-white"></span>
                    <span className="w-3 h-3 bg-neo-yellow inline-block border border-white"></span>
                    <span className="w-3 h-3 bg-neo-cyan inline-block border border-white"></span>
                  </div>
                  <span className="font-mono text-xs font-black tracking-widest text-neo-yellow">
                    GATEWAY // ACCESS_PORTAL
                  </span>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <div className="space-y-2 border-b-3 border-black pb-5">
                    <div className="inline-block bg-neo-yellow border-2 border-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wider shadow-brutal-sm">
                      STEP 1: AUTHENTICATION
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-black">
                      Merchant Access
                    </h2>
                    <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                      Connect your Freighter wallet to configure your AI Treasury and enforce cryptographic spending limits.
                    </p>
                  </div>

                  {/* Wallet Connection Component */}
                  <div className="space-y-4">
                    <FreighterConnect />
                  </div>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-dashed border-black"></div>
                    </div>
                    <span className="relative bg-white px-3 font-mono text-xs font-black uppercase text-black">
                      THEN PROCEED
                    </span>
                  </div>

                  {/* Proceed to Dashboard CTA */}
                  <Link
                    href="/dashboard"
                    className="w-full bg-neo-cyan hover:bg-cyan-300 text-black text-base md:text-lg font-black uppercase tracking-tight py-4 px-6 border-4 border-black shadow-brutal flex items-center justify-center gap-3 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg active:translate-x-1 active:translate-y-1 active:shadow-none group text-center"
                  >
                    <span>Proceed to Dashboard</span>
                    <ArrowRight className="w-6 h-6 stroke-[3] group-hover:translate-x-2 transition-transform" />
                  </Link>

                  <div className="bg-neo-bg border-2 border-black p-3 font-mono text-[11px] space-y-1 text-black">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-600">CONTRACT:</span>
                      <span className="font-black truncate max-w-[170px]">AgentTreasury.wasm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-600">STANDARD:</span>
                      <span className="font-black text-black">x402 Micropayments</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Voice-to-Voice Simulation Widget */}
      <section className="py-12 bg-neo-purple border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border-4 border-black shadow-brutal-xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-neo-yellow border-2 border-black px-2 py-0.5 text-xs font-black font-mono">
                    LIVE STREAM TESTBENCH
                  </span>
                  <span className="flex items-center gap-1 bg-black text-neo-lime font-mono text-xs px-2 py-0.5">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    AUTONOMOUS PEER-TO-PEER
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                  Voice-to-Voice Negotiation & Micro-Streaming
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlayingAudioSim(!isPlayingAudioSim)}
                  className="bg-neo-yellow hover:bg-yellow-300 text-black border-3 border-black px-4 py-2 font-black font-mono text-xs uppercase shadow-brutal-sm flex items-center gap-2 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  {isPlayingAudioSim ? (
                    <>
                      <Pause className="w-4 h-4 fill-black" />
                      PAUSE SIMULATION
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-black" />
                      RESUME SIMULATION
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Negotiation Nodes Visualizer */}
            <div className="grid md:grid-cols-12 gap-6 items-center">
              {/* Node A: Buyer Agent */}
              <div className="md:col-span-4 bg-neo-bg border-3 border-black p-4 shadow-brutal-sm space-y-3">
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-neo-cyan border-2 border-black flex items-center justify-center font-black text-xs">
                      A1
                    </div>
                    <span className="font-black text-sm uppercase">Agent Alpha (Client)</span>
                  </div>
                  <span className="bg-black text-white text-[10px] font-mono px-1.5 py-0.5 font-bold">
                    BUYER
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="text-gray-600 font-bold">INTENT: &quot;Stream voice audio 48kHz&quot;</div>
                  <div className="text-black font-black bg-white border border-black p-1.5">
                    BUDGET: 10 USDC (DAILY CAP)
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>FREIGHTER AUTHORIZED</span>
                  </div>
                </div>
              </div>

              {/* Middle: Live Audio Wave + Soroban HTLC Lock */}
              <div className="md:col-span-4 flex flex-col items-center justify-center space-y-4 bg-neo-yellow border-3 border-black p-5 shadow-brutal-sm">
                <div className="font-mono text-xs font-black uppercase tracking-wider text-black">
                  SOROBAN HTLC LOCK ACTIVE
                </div>

                {/* Simulated Audio Equalizer Bars */}
                <div className="flex items-center justify-center gap-1.5 h-12 w-full">
                  {[18, 36, 12, 44, 28, 48, 22, 38, 14, 42, 30, 20].map((height, idx) => (
                    <div
                      key={idx}
                      style={{
                        height: isPlayingAudioSim ? `${Math.max(8, (height * (simProgress % 20 + 5)) / 15)}px` : '8px',
                        transition: 'height 0.25s ease'
                      }}
                      className="w-2 bg-black border border-black"
                    />
                  ))}
                </div>

                <div className="w-full bg-white border-2 border-black p-2 text-center">
                  <div className="font-mono text-[11px] font-black text-black">
                    STREAM RATE: 100 STROOPS / SEC
                  </div>
                  <div className="w-full bg-gray-200 border border-black h-2.5 mt-1 overflow-hidden">
                    <div 
                      className="bg-neo-pink h-full border-r border-black transition-all duration-300"
                      style={{ width: `${simProgress}%` }}
                    />
                  </div>
                  <div className="font-mono text-[9px] text-gray-600 mt-1 font-bold">
                    STREAMED: {(simProgress * 14.5).toFixed(0)} STROOPS // {simProgress}% DURATION
                  </div>
                </div>
              </div>

              {/* Node B: Merchant Agent */}
              <div className="md:col-span-4 bg-neo-bg border-3 border-black p-4 shadow-brutal-sm space-y-3">
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-neo-pink border-2 border-black flex items-center justify-center font-black text-xs text-white">
                      B2
                    </div>
                    <span className="font-black text-sm uppercase">Agent Beta (Provider)</span>
                  </div>
                  <span className="bg-black text-white text-[10px] font-mono px-1.5 py-0.5 font-bold">
                    SYNTHESIZER
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="text-gray-600 font-bold">SERVICE: &quot;Synthetic Speech Inference&quot;</div>
                  <div className="text-black font-black bg-white border border-black p-1.5">
                    SETTLEMENT: 0.05 USDC / MINUTE
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>STELLAR TESTNET NODE #4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (3 Grid Cards) */}
      <section className="py-20 md:py-28 bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-block bg-neo-yellow border-3 border-black px-4 py-1 font-mono text-xs md:text-sm font-black uppercase shadow-brutal-sm">
              ENGINEERED FOR MACHINES
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter">
              Autonomous Infrastructure
            </h2>
            <p className="text-lg md:text-xl font-medium text-gray-800">
              Traditional payment rails fail when AI agents transact at millisecond voice-cadence. VoxTrade bridges voice intelligence with cryptographic Soroban smart contracts.
            </p>
          </div>

          {/* 3 Grid Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Trustless Escrow */}
            <motion.div 
              whileHover={{ y: -6, x: -6 }}
              className="bg-neo-yellow border-4 border-black p-8 shadow-brutal-lg flex flex-col justify-between space-y-6 transition-shadow hover:shadow-brutal-xl relative group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 bg-white border-4 border-black shadow-brutal-sm flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <Lock className="w-8 h-8 text-black stroke-[2.5]" />
                  </div>
                  <span className="font-mono text-xs font-black bg-black text-neo-yellow px-2 py-1">
                    HTLC // 01
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
                  Trustless Escrow
                </h3>

                <p className="text-black font-semibold text-base leading-relaxed">
                  Cryptographic Hash Time-Locked Contracts ensure funds are only released when Voice AI services are successfully rendered.
                </p>
              </div>

              <div className="bg-white border-3 border-black p-3 font-mono text-xs space-y-1">
                <div className="text-gray-500 font-bold">PRIMITIVE:</div>
                <div className="font-black text-black">SHA-256 Preimage Verification</div>
              </div>
            </motion.div>

            {/* Feature 2: Sub-second Finality */}
            <motion.div 
              whileHover={{ y: -6, x: -6 }}
              className="bg-neo-cyan border-4 border-black p-8 shadow-brutal-lg flex flex-col justify-between space-y-6 transition-shadow hover:shadow-brutal-xl relative group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 bg-white border-4 border-black shadow-brutal-sm flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <Zap className="w-8 h-8 text-black stroke-[2.5]" />
                  </div>
                  <span className="font-mono text-xs font-black bg-black text-neo-cyan px-2 py-1">
                    STELLAR // 02
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
                  Sub-second Finality
                </h3>

                <p className="text-black font-semibold text-base leading-relaxed">
                  Leveraging the Stellar network for near-instantaneous transaction settlement at a fraction of a cent per operation.
                </p>
              </div>

              <div className="bg-white border-3 border-black p-3 font-mono text-xs space-y-1">
                <div className="text-gray-500 font-bold">NETWORK:</div>
                <div className="font-black text-black">Stellar Consensus Protocol (SCP)</div>
              </div>
            </motion.div>

            {/* Feature 3: Cryptographic Bounds */}
            <motion.div 
              whileHover={{ y: -6, x: -6 }}
              className="bg-neo-pink border-4 border-black p-8 shadow-brutal-lg flex flex-col justify-between space-y-6 transition-shadow hover:shadow-brutal-xl relative group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 bg-white border-4 border-black shadow-brutal-sm flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <ShieldCheck className="w-8 h-8 text-black stroke-[2.5]" />
                  </div>
                  <span className="font-mono text-xs font-black bg-black text-neo-pink px-2 py-1">
                    LIMITS // 03
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
                  Cryptographic Bounds
                </h3>

                <p className="text-black font-semibold text-base leading-relaxed">
                  Merchants configure strict 24-hour spending limits. The AI agent cannot spend a single stroop beyond its authorized budget.
                </p>
              </div>

              <div className="bg-white border-3 border-black p-3 font-mono text-xs space-y-1">
                <div className="text-gray-500 font-bold">MAX SLIPPAGE:</div>
                <div className="font-black text-black">0 Stroops (Strict On-Chain Guard)</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technical Protocol Architecture Steps */}
      <section className="py-20 bg-neo-bg bg-neo-dots border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-4 border-black bg-white p-8 md:p-12 shadow-brutal-xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-b-4 border-black pb-8">
              <div>
                <span className="bg-neo-lime border-2 border-black px-3 py-1 font-mono text-xs font-black uppercase shadow-brutal-sm">
                  PROTOCOL MECHANICS
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight mt-3">
                  How Voice-to-Voice Commerce Executes
                </h2>
              </div>
              <div className="font-mono text-xs font-bold text-gray-700 max-w-sm">
                Three automated steps executed autonomously between AI agents without human intervention.
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-neo-yellow border-3 border-black shadow-brutal-sm flex items-center justify-center font-black text-xl">
                  1
                </div>
                <h4 className="text-xl font-black uppercase">Voice Handshake & Quotation</h4>
                <p className="text-sm font-medium text-gray-800 leading-relaxed">
                  Agents connect over WebRTC/Voice channels. They parse intent and negotiate terms (e.g. 100 stroops per second for real-time speech translation).
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-neo-cyan border-3 border-black shadow-brutal-sm flex items-center justify-center font-black text-xl">
                  2
                </div>
                <h4 className="text-xl font-black uppercase">Soroban HTLC Lock</h4>
                <p className="text-sm font-medium text-gray-800 leading-relaxed">
                  The consumer agent locks funds in the AgentTreasury contract using an HTLC hash. The contract verifies daily spending limits before committing.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-neo-pink border-3 border-black shadow-brutal-sm flex items-center justify-center font-black text-xl">
                  3
                </div>
                <h4 className="text-xl font-black uppercase">Autonomous Preimage Stream</h4>
                <p className="text-sm font-medium text-gray-800 leading-relaxed">
                  As each audio chunk completes, preimages are exchanged on Stellar. Funds stream instantaneously to the provider with zero counterparty risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-block bg-neo-yellow text-black border-3 border-white px-4 py-1.5 font-mono text-sm font-black uppercase shadow-[6px_6px_0px_0px_#ffffff]">
            READY TO DEPLOY AGENTS?
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight max-w-4xl mx-auto leading-none">
            INITIALIZE YOUR STELLAR AGENT TREASURY TODAY
          </h2>
          <p className="text-lg md:text-xl text-gray-300 font-medium max-w-2xl mx-auto">
            Connect Freighter, establish your daily spending ceiling, and let your AI voice agents conduct sovereign commerce.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-neo-yellow hover:bg-yellow-300 text-black text-lg font-black uppercase tracking-tight py-4 px-8 border-4 border-white shadow-[8px_8px_0px_0px_#ffffff] hover:shadow-[12px_12px_0px_0px_#ffffff] hover:-translate-x-1 hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <span>ENTER AGENT DASHBOARD</span>
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Neo-Brutalist Footer */}
      <footer className="bg-white border-t-4 border-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neo-yellow border-3 border-black shadow-brutal-sm flex items-center justify-center font-black text-xl">
              V
            </div>
            <div>
              <div className="font-black text-xl tracking-tight">VOXTRADE</div>
              <div className="font-mono text-xs text-gray-600">Sovereign Voice-to-Voice Commerce on Stellar</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono text-xs font-black uppercase">
            <span className="bg-neo-bg border-2 border-black px-2 py-1">Soroban Testnet</span>
            <span className="bg-neo-bg border-2 border-black px-2 py-1">x402 Micropayments</span>
            <span className="bg-neo-bg border-2 border-black px-2 py-1">Freighter Wallet</span>
          </div>

          <div className="font-mono text-xs text-gray-600 font-bold">
            &copy; 2026 VOXTRADE. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </main>
  );
}
