'use client';

import { useState } from 'react';
import { AgentTreasury } from '@voxtrade/sdk';
import { isAllowed, getUserInfo } from '@stellar/freighter-api';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  async function deployTreasury() {
    setLoading(true);
    setStatus('Checking Freighter...');
    try {
      if (!(await isAllowed())) {
        throw new Error('Freighter not connected');
      }
      const { publicKey } = await getUserInfo();

      setStatus('Deploying and initializing Treasury...');
      
      const treasury = new AgentTreasury(
        process.env.NEXT_PUBLIC_TREASURY_WASM_HASH!,
        process.env.NEXT_PUBLIC_SOROBAN_RPC_URL!,
        process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'testnet' ? 'Test SDF Network ; September 2015' : 'Public Global Stellar Network ; September 2015'
      );

      // We just log for now since deploy requires WASM deployment mechanics via CLI usually, 
      // but if we assume the contract is deployed and we are initializing:
      const res = await treasury.initialize(publicKey, {
        dailyLimit: 100000000n, // 10 USDC
        agent: publicKey, // In reality, an ed25519 backend key
        escrowContract: process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID!
      });

      setStatus('Success! Hash: ' + res.hash);
    } catch (e: any) {
      setStatus('Error: ' + e.message);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center pb-8 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold">Agent Dashboard</h1>
            <p className="text-slate-400">Configure and monitor your AI agent's x402 spending bounds.</p>
          </div>
        </header>

        <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-xl font-semibold">Treasury Configuration</h2>
          <p className="text-slate-400">Initialize your AgentTreasury contract on the Stellar network.</p>
          
          <button 
            onClick={deployTreasury}
            disabled={loading}
            className="bg-indigo-600 disabled:bg-slate-700 hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Processing...' : 'Initialize Treasury'}
          </button>

          {status && (
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-sm text-indigo-300 break-all">
              {status}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
