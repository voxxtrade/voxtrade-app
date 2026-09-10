'use client';

import { useState } from 'react';
import { AgentTreasury } from '@voxtrade/sdk';
import { isConnected, requestAccess, getPublicKey } from '@stellar/freighter-api';

export default function DashboardClient() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  async function deployTreasury() {
    setLoading(true);
    setStatus('Checking Freighter...');
    try {
      if (!(await isConnected())) {
        throw new Error('Freighter wallet extension is not installed.');
      }
      
      setStatus('Requesting Freighter access...');
      const access = await requestAccess();
      if (access.error) {
        throw new Error(access.error);
      }
      
      const publicKey = await getPublicKey();
      if (!publicKey) {
         throw new Error('Failed to retrieve public key from Freighter.');
      }

      setStatus('Deploying and initializing Treasury for ' + publicKey.slice(0,6) + '...');
      
      const treasury = new AgentTreasury(
        process.env.NEXT_PUBLIC_TREASURY_WASM_HASH!,
        process.env.NEXT_PUBLIC_SOROBAN_RPC_URL!,
        process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'testnet' ? 'Test SDF Network ; September 2015' : 'Public Global Stellar Network ; September 2015'
      );

      // Simulate a small delay for realistic UX since it's an SDK mock
      await new Promise(resolve => setTimeout(resolve, 1500));

      const res = await treasury.initialize(publicKey, {
        dailyLimit: 100000000n, // 10 USDC
        agent: publicKey, 
        escrowContract: process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID!
      });

      setStatus('Success! Transaction Hash: ' + res.hash);
    } catch (e: any) {
      console.error(e);
      setStatus('Error: ' + (e.message || 'Unknown error occurred.'));
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center pb-8 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold">Agent Dashboard</h1>
            <p className="text-slate-400">Configure and monitor your AI agent&apos;s x402 spending bounds.</p>
          </div>
        </header>

        <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-xl font-semibold">Treasury Configuration</h2>
          <p className="text-slate-400">Initialize your AgentTreasury contract on the Stellar network.</p>
          
          <button 
            onClick={deployTreasury}
            disabled={loading}
            className="bg-indigo-600 disabled:bg-slate-700 hover:bg-indigo-700 px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-900/20"
          >
            {loading ? 'Processing...' : 'Initialize Treasury'}
          </button>

          {status && (
            <div className={`p-4 rounded-lg font-mono text-sm break-all border ${status.startsWith('Error') ? 'bg-red-950/50 border-red-900/50 text-red-400' : 'bg-slate-950 border-slate-800 text-indigo-300'}`}>
              {status}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
