import FreighterConnect from '@/components/FreighterConnect';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-slate-100 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10 blur-3xl"></div>
      
      <div className="max-w-3xl w-full flex flex-col items-center text-center space-y-12">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">VoxTrade</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-light max-w-2xl mx-auto">
            Sovereign Voice-to-Voice Commerce. Trustless Machine-to-Machine x402 Negotiation on Stellar.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm shadow-2xl flex flex-col items-center space-y-8 w-full max-w-md">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Merchant Access</h2>
            <p className="text-slate-400 text-sm">Connect your wallet to configure your AI Agent Treasury.</p>
          </div>
          
          <FreighterConnect />

          <div className="w-full h-px bg-slate-800"></div>

          <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors text-sm flex items-center gap-1 group">
            Proceed to Dashboard 
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
