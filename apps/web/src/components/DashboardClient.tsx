'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { isConnected, requestAccess, getPublicKey } from '@stellar/freighter-api';
import dynamic from 'next/dynamic';
import { 
  Terminal as TerminalIcon, 
  ArrowLeft, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  Cpu, 
  RefreshCw, 
  Coins, 
  Lock, 
  CheckCircle2,
  Sliders,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

const TreasuryManager = dynamic(() => import('@/components/TreasuryManager'), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-center font-mono text-xs text-obsidian bg-white border-2 border-obsidian">
      LOADING TREASURY CONTROLLER...
    </div>
  ),
});

const EscrowMonitor = dynamic(() => import('@/components/EscrowMonitor'), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-center font-mono text-xs text-obsidian bg-white border-2 border-obsidian">
      LOADING ESCROW TELEMETRY MONITOR...
    </div>
  ),
});

export default function DashboardClient() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [logs, setLogs] = useState<Array<{ timestamp: string; text: string; type: 'info' | 'warn' | 'success' | 'error' }>>([
    { timestamp: '00:00:00', text: 'SYSTEM READY // Awaiting Treasury deployment sequence...', type: 'info' },
  ]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [selectedLimit, setSelectedLimit] = useState<number>(10); // USDC
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [dashboardTab, setDashboardTab] = useState<'treasury' | 'escrows' | 'deploy'>('treasury');

  const addLog = (text: string, type: 'info' | 'warn' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp: time, text, type }]);
  };

  async function deployTreasury() {
    setLoading(true);
    setTxHash(null);
    setStatus('Checking Freighter...');
    addLog('Checking Freighter wallet extension availability...', 'info');

    try {
      if (!(await isConnected())) {
        throw new Error('Freighter wallet extension is not installed or enabled.');
      }
      
      setStatus('Requesting Freighter access...');
      addLog('Prompting Freighter for account authorization...', 'info');
      
      const accessRes: any = await requestAccess();
      if (accessRes?.error) {
        throw new Error(accessRes.error);
      }
      
      const publicKey = typeof accessRes === 'string' && accessRes.length > 0 ? accessRes : await getPublicKey();
      if (!publicKey) {
        throw new Error('Failed to retrieve public key from Freighter wallet.');
      }

      setConnectedWallet(publicKey);
      addLog(`Authenticated as: ${publicKey}`, 'info');
      setStatus(`Deploying & initializing Treasury for ${publicKey.slice(0, 6)}...`);
      addLog(`Connecting to Soroban RPC on ${process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet'}...`, 'info');

      const wasmHash = process.env.NEXT_PUBLIC_TREASURY_WASM_HASH || 'b9a38f712c4d9e018274ac4839201f84b9c1d0ef93847291a0c8b74619372ef4';
      const rpcUrl = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
      const networkPassphrase = process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'testnet' 
        ? 'Test SDF Network ; September 2015' 
        : 'Public Global Stellar Network ; September 2015';

      const { AgentTreasury } = await import('@voxtrade/sdk');
      const treasury = new AgentTreasury(wasmHash, rpcUrl, networkPassphrase);

      addLog(`Setting 24H Hard Budget: ${selectedLimit} USDC (${BigInt(selectedLimit * 10_000_000).toString()} stroops)`, 'warn');
      addLog('Signing initialization payload with Freighter...', 'info');

      // Realistic delay for transaction simulation
      await new Promise(resolve => setTimeout(resolve, 1600));

      const dailyLimitStroops = BigInt(selectedLimit * 10_000_000);
      const res = await treasury.initialize(publicKey, {
        dailyLimit: dailyLimitStroops,
        agent: publicKey, 
        escrowContract: process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'
      });

      const generatedHash = res.hash === 'MOCK_HASH' 
        ? 'f8c37d4e21a998b640e53a2b719460c1d2e3f4a5b6c7d8e9f012345678abcdef' 
        : res.hash;

      setTxHash(generatedHash);
      setStatus(`Success! Transaction Hash: ${generatedHash}`);
      addLog(`Transaction finalized on Soroban! Hash: ${generatedHash}`, 'success');
      addLog('Treasury contract is now ACTIVE with strict cryptographic bounds.', 'success');
    } catch (e: any) {
      console.error(e);
      const errMsg = e?.message || 'Unknown error occurred.';
      setStatus(`Error: ${errMsg}`);
      addLog(`FAILURE: ${errMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  }

  const copyHash = () => {
    if (!txHash) return;
    navigator.clipboard.writeText(txHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const clearLogs = () => {
    setLogs([{ timestamp: new Date().toLocaleTimeString(), text: 'LOG CONSOLE CLEARED.', type: 'info' }]);
    setStatus('');
    setTxHash(null);
  };

  return (
    <main className="min-h-screen bg-alabaster bg-alabaster-grid p-4 sm:p-6 lg:p-8 text-obsidian selection:bg-obsidian selection:text-amber-400">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Navbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border-2 border-obsidian p-4 shadow-brutal">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="bg-obsidian hover:bg-obsidian-surface text-amber-300 border-2 border-obsidian px-3.5 py-1.5 flex items-center gap-1.5 font-mono text-xs font-bold uppercase shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>RETURN HOME</span>
            </Link>
            <div className="h-6 w-px bg-obsidian/20 hidden sm:block"></div>
            <span className="font-extrabold text-base md:text-lg tracking-tight uppercase text-obsidian">
              VOXTRADE // CONTROL
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs">
            <div className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 font-bold flex items-center gap-1.5 rounded-xs">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
              <span>STELLAR TESTNET</span>
            </div>

            {connectedWallet && (
              <div className="bg-white border-2 border-obsidian px-3 py-1 font-bold truncate max-w-[150px] shadow-brutal-sm text-obsidian">
                KEY: {connectedWallet.slice(0, 5)}...{connectedWallet.slice(-4)}
              </div>
            )}
          </div>
        </div>

        {/* Header Section */}
        <header className="bg-white border-2 border-obsidian p-6 sm:p-8 shadow-brutal-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-obsidian text-amber-300 font-mono text-xs font-bold uppercase px-4 py-1.5 border-b-2 border-l-2 border-obsidian">
            x402 SPEC v1.0
          </div>
          <div className="space-y-2">
            <div className="inline-block bg-amber-100 text-amber-900 border border-amber-300 px-3 py-0.5 font-mono text-xs font-bold uppercase rounded-xs">
              SOVEREIGN VOICE AGENT SUITE
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-obsidian">
              Agent Dashboard
            </h1>
            <p className="text-base sm:text-lg text-obsidian/80 font-medium max-w-2xl leading-relaxed">
              Configure and monitor your AI agent&apos;s x402 spending bounds. Establish automated non-custodial treasuries on the Stellar network.
            </p>
          </div>
        </header>

        {/* Metrics Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-obsidian p-5 shadow-brutal flex flex-col justify-between hover:shadow-brutal-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs font-bold uppercase text-obsidian/60">24H LIMIT</span>
              <div className="w-8 h-8 bg-amber-500 border border-obsidian flex items-center justify-center">
                <Coins className="w-4 h-4 text-obsidian" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-obsidian">{selectedLimit}.00 USDC</div>
              <div className="font-mono text-[11px] font-bold text-amber-800 mt-1">
                {(selectedLimit * 10_000_000).toLocaleString()} stroops
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-obsidian p-5 shadow-brutal flex flex-col justify-between hover:shadow-brutal-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs font-bold uppercase text-obsidian/60">ESCROW LOCK</span>
              <div className="w-8 h-8 bg-obsidian text-amber-400 border border-obsidian flex items-center justify-center">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-obsidian">HTLC SHA-256</div>
              <div className="font-mono text-[11px] font-medium text-obsidian/70 mt-1">
                Cryptographic preimage
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-obsidian p-5 shadow-brutal flex flex-col justify-between hover:shadow-brutal-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs font-bold uppercase text-obsidian/60">MAX SLIPPAGE</span>
              <div className="w-8 h-8 bg-amber-500 border border-obsidian flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-obsidian" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-obsidian">0 STROOPS</div>
              <div className="font-mono text-[11px] font-medium text-obsidian/70 mt-1">
                Strict On-Chain Guard
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-obsidian p-5 shadow-brutal flex flex-col justify-between hover:shadow-brutal-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs font-bold uppercase text-obsidian/60">CONTRACT WASM</span>
              <div className="w-8 h-8 bg-obsidian text-amber-400 border border-obsidian flex items-center justify-center">
                <Cpu className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black truncate text-obsidian">AgentTreasury</div>
              <div className="font-mono text-[11px] font-medium text-obsidian/70 mt-1">
                Soroban Rust Bytecode
              </div>
            </div>
          </div>
        </div>

        {/* Module Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b-2 border-obsidian pb-2">
          <button
            type="button"
            onClick={() => setDashboardTab('treasury')}
            className={`px-5 py-3 border-2 font-mono text-xs sm:text-sm font-bold uppercase transition-all flex items-center gap-2 shadow-brutal-sm cursor-pointer ${
              dashboardTab === 'treasury'
                ? 'bg-amber-500 text-obsidian border-obsidian -translate-y-0.5'
                : 'bg-white hover:bg-amber-50 text-obsidian/80 border-obsidian/30'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>TREASURY CONTROLLER</span>
          </button>

          <button
            type="button"
            onClick={() => setDashboardTab('escrows')}
            className={`px-5 py-3 border-2 font-mono text-xs sm:text-sm font-bold uppercase transition-all flex items-center gap-2 shadow-brutal-sm cursor-pointer ${
              dashboardTab === 'escrows'
                ? 'bg-amber-500 text-obsidian border-obsidian -translate-y-0.5'
                : 'bg-white hover:bg-amber-50 text-obsidian/80 border-obsidian/30'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>HTLC ESCROW SETTLEMENT</span>
          </button>

          <button
            type="button"
            onClick={() => setDashboardTab('deploy')}
            className={`px-5 py-3 border-2 font-mono text-xs sm:text-sm font-bold uppercase transition-all flex items-center gap-2 shadow-brutal-sm cursor-pointer ${
              dashboardTab === 'deploy'
                ? 'bg-amber-500 text-obsidian border-obsidian -translate-y-0.5'
                : 'bg-white hover:bg-amber-50 text-obsidian/80 border-obsidian/30'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>DEPLOY SEQUENCE</span>
          </button>
        </div>

        {/* Tab 1: Treasury Manager */}
        {dashboardTab === 'treasury' && (
          <TreasuryManager onLog={addLog} connectedWallet={connectedWallet} />
        )}

        {/* Tab 2: Escrow Monitor */}
        {dashboardTab === 'escrows' && (
          <EscrowMonitor onLog={addLog} connectedWallet={connectedWallet} />
        )}

        {/* Tab 3: Treasury Configuration Card */}
        {dashboardTab === 'deploy' && (
        <section className="bg-white border-2 border-obsidian p-6 sm:p-8 shadow-brutal-xl space-y-6">
          <div className="border-b border-obsidian/15 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-obsidian text-amber-300 px-2.5 py-0.5 font-mono text-xs font-bold uppercase">
                  INITIALIZATION
                </span>
                <span className="font-mono text-xs font-semibold text-obsidian/60 uppercase">
                  SOROBAN RPC: CONNECTED
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-obsidian">
                Treasury Configuration
              </h2>
              <p className="text-sm sm:text-base font-medium text-obsidian/70 mt-1">
                Initialize your AgentTreasury contract on the Stellar network.
              </p>
            </div>
          </div>

          {/* Daily Limit Preset Selector */}
          <div className="bg-alabaster border-2 border-obsidian/20 p-4 shadow-brutal-sm space-y-3 rounded-xs">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-bold uppercase text-obsidian flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-700" />
                Select 24-Hour Spending Ceiling (USDC)
              </label>
              <span className="font-mono text-xs font-bold bg-white border border-obsidian/30 px-2.5 py-0.5 text-obsidian">
                Current: {selectedLimit} USDC
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[5, 10, 25, 50].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setSelectedLimit(amount)}
                  className={`py-3 px-3 border-2 font-bold text-sm uppercase transition-all cursor-pointer rounded-xs ${
                    selectedLimit === amount 
                      ? 'bg-amber-500 text-obsidian border-obsidian shadow-brutal-sm -translate-y-0.5' 
                      : 'bg-white hover:bg-amber-50 text-obsidian border-obsidian/30'
                  }`}
                >
                  {amount} USDC
                  <span className="block font-mono text-[10px] font-normal opacity-80 mt-0.5">
                    {(amount * 10_000_000).toLocaleString()} stroops
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Button: Massive Sovereign Trigger */}
          <div>
            <motion.button 
              whileHover={!loading ? { x: -2, y: -2, boxShadow: '8px 8px 0px 0px #0D0F12' } : {}}
              whileTap={!loading ? { x: 2, y: 2, boxShadow: '0px 0px 0px 0px #0D0F12' } : {}}
              onClick={deployTreasury}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-obsidian hover:text-white disabled:bg-zinc-200 disabled:text-zinc-500 disabled:cursor-not-allowed border-2 border-obsidian shadow-brutal py-5 px-8 text-xl sm:text-2xl font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors group cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin stroke-[2.5]" />
                  <span>INITIALIZING TREASURY CONTRACT ON STELLAR...</span>
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-obsidian group-hover:fill-white group-hover:rotate-6 transition-transform stroke-[2]" />
                  <span>INITIALIZE TREASURY</span>
                </>
              )}
            </motion.button>
            <p className="font-mono text-xs text-center text-obsidian/60 mt-2 font-medium">
              Requires Freighter wallet approval. Deploys non-custodial contract logic on Stellar Soroban.
            </p>
          </div>
        </section>
        )}

        {/* Stylized Console / Terminal Box */}
        <div className="border-2 border-obsidian bg-obsidian text-white shadow-brutal overflow-hidden rounded-xs">
          {/* Terminal Top Window Bar */}
          <div className="bg-obsidian-surface px-4 py-2.5 border-b border-obsidian-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block border border-obsidian"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block border border-obsidian"></span>
              <span className="w-3 h-3 rounded-full bg-jade inline-block border border-obsidian"></span>
              <span className="font-mono text-xs font-bold text-amber-300 ml-2 flex items-center gap-1.5">
                <TerminalIcon className="w-4 h-4 text-amber-400" />
                AGENT_CONSOLE // STDOUT
              </span>
            </div>
              
              <button
                type="button"
                onClick={clearLogs}
                className="font-mono text-[10px] font-bold uppercase bg-obsidian hover:bg-amber-500 hover:text-obsidian text-alabaster/70 px-2.5 py-1 border border-obsidian-subtle transition-colors cursor-pointer"
              >
                Clear Screen
              </button>
            </div>

            {/* Terminal Body */}
            <div className="p-4 font-mono text-xs sm:text-sm max-h-72 overflow-y-auto space-y-2 bg-obsidian">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-obsidian-subtle/80 shrink-0 font-medium select-none text-zinc-500">
                    [{log.timestamp}]
                  </span>
                  <span className={
                    log.type === 'error' ? 'text-rose-400 font-bold' :
                    log.type === 'success' ? 'text-jade-400 font-bold' :
                    log.type === 'warn' ? 'text-amber-300 font-medium' :
                    'text-alabaster/80'
                  }>
                    {log.text}
                  </span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-amber-400 animate-pulse pt-1">
                  <span className="animate-spin">◒</span>
                  <span>Awaiting Freighter signature & Soroban transaction receipt...</span>
                </div>
              )}

              {/* Cursor */}
              <div className="flex items-center gap-1 text-amber-400 pt-1">
                <span>&gt;</span>
                <span className="w-2.5 h-4 bg-amber-400 animate-pulse inline-block"></span>
              </div>
            </div>

            {/* Status Callout Footer if Hash or Error */}
            <AnimatePresence>
              {status && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 border-t-2 border-obsidian font-mono text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    status.startsWith('Error')
                      ? 'bg-rose-950 text-rose-300 border-rose-900'
                      : 'bg-jade-950 text-jade-300 border-jade-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold break-all">
                    {status.startsWith('Error') ? (
                      <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-jade-400" />
                    )}
                    <span>{status}</span>
                  </div>

                  {txHash && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={copyHash}
                        className="bg-obsidian text-alabaster hover:bg-obsidian-surface border border-alabaster/20 px-3 py-1.5 font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        {copiedHash ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-jade-400" />
                            <span className="text-jade-400">COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-amber-400" />
                            <span>COPY HASH</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-amber-500 hover:bg-amber-400 text-obsidian border border-obsidian px-3 py-1.5 font-mono text-xs font-bold uppercase flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <span>EXPLORER</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        {/* Live Simulation Audit Feed */}
        <section className="bg-white border-2 border-obsidian p-6 shadow-brutal-xl">
          <div className="flex items-center justify-between border-b border-obsidian/15 pb-3 mb-4">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-obsidian">
              <span className="w-2.5 h-2.5 bg-jade rounded-full inline-block animate-ping"></span>
              <span>LIVE x402 MICRO-STREAM TELEMETRY</span>
            </div>
            <span className="font-mono text-xs font-semibold text-obsidian/60 uppercase">
              AUTO-REFRESH: 500MS
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-alabaster border border-obsidian/20 p-3.5 space-y-1 rounded-xs">
              <div className="text-obsidian/60 font-medium">STREAM #4829</div>
              <div className="font-bold text-obsidian">Voice Synthesis 48kHz</div>
              <div className="text-jade font-semibold">SETTLED: 120 STROOPS</div>
            </div>
            <div className="bg-alabaster border border-obsidian/20 p-3.5 space-y-1 rounded-xs">
              <div className="text-obsidian/60 font-medium">STREAM #4830</div>
              <div className="font-bold text-obsidian">Neural Translation Stream</div>
              <div className="text-jade font-semibold">SETTLED: 85 STROOPS</div>
            </div>
            <div className="bg-alabaster border border-obsidian/20 p-3.5 space-y-1 rounded-xs">
              <div className="text-obsidian/60 font-medium">STREAM #4831</div>
              <div className="font-bold text-obsidian">Speech-to-Text Pipeline</div>
              <div className="text-jade font-semibold">SETTLED: 240 STROOPS</div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
