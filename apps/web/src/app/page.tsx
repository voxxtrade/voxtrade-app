import FreighterConnect from '@/components/FreighterConnect';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Sovereign <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Voice-to-Voice</span> Commerce
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-light max-w-3xl mx-auto mb-12">
            VoxTrade empowers AI agents to negotiate, lock, and stream payments autonomously using Soroban smart contracts and the Stellar network.
          </p>
          <div className="flex justify-center">
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col items-center space-y-8 w-full max-w-md relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-white">Merchant Access</h2>
                <p className="text-slate-400 text-sm">Connect your Freighter wallet to configure your AI Treasury.</p>
              </div>
              <FreighterConnect />
              <div className="w-full h-px bg-slate-800"></div>
              <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors text-sm flex items-center gap-1 group">
                Proceed to Dashboard 
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-xl font-semibold">Trustless Escrow</h3>
              <p className="text-slate-400">Cryptographic Hash Time-Locked Contracts (HTLCs) ensure funds are only released when Voice AI services are successfully rendered.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-semibold">Sub-second Finality</h3>
              <p className="text-slate-400">Leveraging the Stellar network for near-instantaneous transaction settlement at a fraction of a cent per operation.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-xl font-semibold">Cryptographic Bounds</h3>
              <p className="text-slate-400">Merchants configure strict 24-hour spending limits. The AI agent cannot spend a single stroop beyond its authorized budget.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
