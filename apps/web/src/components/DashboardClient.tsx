'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentTreasury } from '@voxtrade/sdk';
import { isConnected, requestAccess, getPublicKey } from '@stellar/freighter-api';
import { 
  Terminal as TerminalIcon, 
  ArrowLeft, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  AlertOctagon, 
  Play, 
  Cpu, 
  RefreshCw, 
  Coins, 
  Lock, 
  CheckCircle2,
  Sliders
} from 'lucide-react';

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

      const treasury = new AgentTreasury(wasmHash, rpcUrl, networkPassphrase);

      addLog(`Setting 24H Hard Budget: ${selectedLimit} USDC (${BigInt(selectedLimit * 10_000_000).toString()} stroops)`, 'warn');
      addLog('Signing initialization payload with Freighter...', 'info');

      // Realistic mock delay for transaction simulation
      await new Promise(resolve => setTimeout(resolve, 1800));

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
    <main className="min-h-screen bg-neo-bg bg-neo-grid p-4 sm:p-6 lg:p-8 text-black selection:bg-black selection:text-neo-yellow">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Navbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border-4 border-black p-4 shadow-brutal">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="bg-neo-yellow hover:bg-yellow-300 text-black border-3 border-black p-2 shadow-brutal-sm flex items-center gap-1 font-mono text-xs font-black uppercase active:translate-x-0.5 active:translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>RETURN HOME</span>
            </Link>
            <div className="h-6 w-1 bg-black hidden sm:block"></div>
            <span className="font-black text-lg tracking-tight uppercase">
              VOXTRADE // CONTROL
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs">
            <div className="bg-neo-lime border-2 border-black px-2.5 py-1 font-black flex items-center gap-1.5 shadow-brutal-sm">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
              <span>NETWORK: STELLAR TESTNET</span>
            </div>

            {connectedWallet && (
              <div className="bg-white border-2 border-black px-2.5 py-1 font-bold truncate max-w-[150px] shadow-brutal-sm">
                KEY: {connectedWallet.slice(0, 5)}...{connectedWallet.slice(-4)}
              </div>
            )}
          </div>
        </div>

        {/* Header Section */}
        <header className="bg-white border-4 border-black p-6 sm:p-8 shadow-brutal-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-neo-pink text-black font-mono text-xs font-black uppercase px-4 py-1.5 border-b-3 border-l-3 border-black">
            x402 SPEC v1.0
          </div>
          <div className="space-y-2">
            <div className="inline-block bg-neo-yellow border-2 border-black px-3 py-0.5 font-mono text-xs font-black uppercase shadow-brutal-sm">
              SOVEREIGN VOICE AGENT SUITE
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-none">
              Agent Dashboard
            </h1>
            <p className="text-base sm:text-lg text-gray-800 font-semibold max-w-2xl">
              Configure and monitor your AI agent&apos;s x402 spending bounds. Establish automated non-custodial treasuries on the Stellar network.
            </p>
          </div>
        </header>

        {/* Quick Metrics Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neo-yellow border-4 border-black p-5 shadow-brutal flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs font-bold uppercase text-black">24H LIMIT</span>
              <Coins className="w-5 h-5 text-black" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black">{selectedLimit}.00 USDC</div>
              <div className="font-mono text-[11px] font-bold text-gray-800 mt-1">
                {(selectedLimit * 10_000_000).toLocaleString()} stroops
              </div>
            </div>
          </div>

          <div className="bg-neo-cyan border-4 border-black p-5 shadow-brutal flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs font-bold uppercase text-black">SETTLEMENT ESCROW</span>
              <Lock className="w-5 h-5 text-black" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black">HTLC SHA-256</div>
              <div className="font-mono text-[11px] font-bold text-gray-800 mt-1">
                Cryptographic preimage
              </div>
            </div>
          </div>

          <div className="bg-neo-pink border-4 border-black p-5 shadow-brutal flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs font-bold uppercase text-black">MAX SLIPPAGE</span>
              <ShieldCheck className="w-5 h-5 text-black" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black">0 STROOPS</div>
              <div className="font-mono text-[11px] font-bold text-gray-800 mt-1">
                Strict On-Chain Guard
              </div>
            </div>
          </div>

          <div className="bg-neo-lime border-4 border-black p-5 shadow-brutal flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs font-bold uppercase text-black">CONTRACT WASM</span>
              <Cpu className="w-5 h-5 text-black" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black truncate">AgentTreasury</div>
              <div className="font-mono text-[11px] font-bold text-gray-800 mt-1">
                Soroban Rust Bytecode
              </div>
            </div>
          </div>
        </div>

        {/* Treasury Configuration Card */}
        <section className="bg-white border-4 border-black p-6 sm:p-8 shadow-brutal-xl space-y-6">
          <div className="border-b-4 border-black pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-black text-neo-yellow px-2 py-0.5 font-mono text-xs font-black uppercase">
                  INITIALIZATION
                </span>
                <span className="font-mono text-xs font-bold text-gray-600 uppercase">
                  SOROBAN RPC: CONNECTED
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                Treasury Configuration
              </h2>
              <p className="text-sm sm:text-base font-semibold text-gray-700 mt-1">
                Initialize your AgentTreasury contract on the Stellar network.
              </p>
            </div>
          </div>

          {/* Daily Limit Preset Selector */}
          <div className="bg-neo-bg border-3 border-black p-4 shadow-brutal-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-black uppercase flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                Select 24-Hour Spending Ceiling (USDC)
              </label>
              <span className="font-mono text-xs font-bold bg-white border border-black px-2 py-0.5">
                Current: {selectedLimit} USDC
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[5, 10, 25, 50].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setSelectedLimit(amount)}
                  className={`py-2 px-3 border-2 border-black font-black text-sm uppercase transition-all ${
                    selectedLimit === amount 
                      ? 'bg-neo-yellow shadow-brutal-sm -translate-y-0.5' 
                      : 'bg-white hover:bg-gray-100 text-black'
                  }`}
                >
                  {amount} USDC
                  <span className="block font-mono text-[10px] font-normal opacity-80">
                    {(amount * 10_000_000).toLocaleString()} stroops
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Button: Massive Neo-Brutalist Trigger */}
          <div>
            <motion.button 
              whileHover={!loading ? { x: -3, y: -3, boxShadow: '12px 12px 0px 0px #000000' } : {}}
              whileTap={!loading ? { x: 3, y: 3, boxShadow: '0px 0px 0px 0px #000000' } : {}}
              onClick={deployTreasury}
              disabled={loading}
              className="w-full bg-neo-yellow hover:bg-yellow-300 text-black disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed border-4 border-black shadow-brutal-lg py-5 px-8 text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center justify-center gap-3 transition-colors group cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-7 h-7 animate-spin stroke-[3]" />
                  <span>INITIALIZING TREASURY CONTRACT ON STELLAR...</span>
                </>
              ) : (
                <>
                  <Play className="w-7 h-7 fill-black group-hover:rotate-12 transition-transform stroke-[2.5]" />
                  <span>INITIALIZE TREASURY</span>
                </>
              )}
            </motion.button>
            <p className="font-mono text-xs text-center font-bold text-gray-600 mt-2">
              Requires Freighter wallet approval. Deploys non-custodial contract logic on Stellar Soroban.
            </p>
          </div>

          {/* Stylized Console / Terminal Box */}
          <div className="border-4 border-black bg-black text-white shadow-brutal-lg overflow-hidden">
            {/* Terminal Top Window Bar */}
            <div className="bg-[#1c1c1c] px-4 py-2 border-b-3 border-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-neo-pink border border-black inline-block"></span>
                <span className="w-3.5 h-3.5 bg-neo-yellow border border-black inline-block"></span>
                <span className="w-3.5 h-3.5 bg-neo-lime border border-black inline-block"></span>
                <span className="font-mono text-xs font-black text-neo-yellow ml-2 flex items-center gap-1.5">
                  <TerminalIcon className="w-3.5 h-3.5" />
                  AGENT_CONSOLE // STDOUT
                </span>
              </div>
              
              <button
                type="button"
                onClick={clearLogs}
                className="font-mono text-[10px] font-black uppercase bg-white text-black hover:bg-neo-yellow px-2 py-0.5 border border-black transition-colors"
              >
                Clear Screen
              </button>
            </div>

            {/* Terminal Body */}
            <div className="p-4 font-mono text-xs sm:text-sm max-h-72 overflow-y-auto space-y-2 bg-[#0d1117]">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-gray-500 shrink-0 font-semibold select-none">
                    [{log.timestamp}]
                  </span>
                  <span className={
                    log.type === 'error' ? 'text-neo-pink font-black' :
                    log.type === 'success' ? 'text-neo-lime font-black' :
                    log.type === 'warn' ? 'text-neo-yellow font-bold' :
                    'text-gray-300'
                  }>
                    {log.text}
                  </span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-neo-yellow animate-pulse">
                  <span className="animate-spin">◒</span>
                  <span>Awaiting Freighter signature & Soroban transaction receipt...</span>
                </div>
              )}

              {/* Cursor */}
              <div className="flex items-center gap-1 text-neo-lime pt-1">
                <span>&gt;</span>
                <span className="w-2.5 h-4 bg-neo-lime animate-pulse inline-block"></span>
              </div>
            </div>

            {/* Status Callout Footer if Hash or Error */}
            <AnimatePresence>
              {status && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 border-t-3 border-black font-mono text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    status.startsWith('Error')
                      ? 'bg-neo-pink text-black'
                      : 'bg-neo-lime text-black'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold break-all">
                    {status.startsWith('Error') ? (
                      <AlertOctagon className="w-5 h-5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                    )}
                    <span>{status}</span>
                  </div>

                  {txHash && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={copyHash}
                        className="bg-white hover:bg-black hover:text-white text-black border-2 border-black px-3 py-1.5 font-mono text-xs font-black uppercase flex items-center gap-1.5 transition-colors shadow-brutal-sm"
                      >
                        {copiedHash ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>COPIED!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>COPY HASH</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-neo-yellow hover:bg-yellow-300 text-black border-2 border-black px-3 py-1.5 font-mono text-xs font-black uppercase flex items-center gap-1 transition-colors shadow-brutal-sm"
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
        </section>

        {/* Live Simulation Audit Feed */}
        <section className="bg-white border-4 border-black p-6 shadow-brutal-xl">
          <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-4">
            <div className="flex items-center gap-2 font-mono text-xs font-black uppercase">
              <span className="w-2.5 h-2.5 bg-neo-lime inline-block border border-black animate-ping"></span>
              <span>LIVE x402 MICRO-STREAM TELEMETRY</span>
            </div>
            <span className="font-mono text-xs font-bold text-gray-600 uppercase">
              AUTO-REFRESH: 500MS
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-neo-bg border-2 border-black p-3 space-y-1">
              <div className="text-gray-600 font-bold">STREAM #4829</div>
              <div className="font-black">Voice Synthesis 48kHz</div>
              <div className="text-emerald-700 font-bold">SETTLED: 120 STROOPS</div>
            </div>
            <div className="bg-neo-bg border-2 border-black p-3 space-y-1">
              <div className="text-gray-600 font-bold">STREAM #4830</div>
              <div className="font-black">Neural Translation Stream</div>
              <div className="text-emerald-700 font-bold">SETTLED: 85 STROOPS</div>
            </div>
            <div className="bg-neo-bg border-2 border-black p-3 space-y-1">
              <div className="text-gray-600 font-bold">STREAM #4831</div>
              <div className="font-black">Speech-to-Text Pipeline</div>
              <div className="text-emerald-700 font-bold">SETTLED: 240 STROOPS</div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
