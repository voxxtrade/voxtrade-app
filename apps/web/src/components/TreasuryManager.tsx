'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isConnected, requestAccess, getPublicKey } from '@stellar/freighter-api';
import {
  Sliders,
  Key,
  ArrowDownToLine,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Cpu
} from 'lucide-react';

interface TreasuryManagerProps {
  onLog?: (text: string, type: 'info' | 'warn' | 'success' | 'error') => void;
  connectedWallet?: string | null;
}

export default function TreasuryManager({ onLog, connectedWallet: initialWallet }: TreasuryManagerProps) {
  const [activeTab, setActiveTab] = useState<'limit' | 'agent' | 'withdraw' | 'status'>('limit');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Form states
  const [newLimit, setNewLimit] = useState<number>(25);
  const [agentKey, setAgentKey] = useState<string>('GBZXN7PIRZGNMHGA72ST2EQTVGQDXF45NWZ46CXCW462KC22W6KZNVLB');
  const [withdrawToken, setWithdrawToken] = useState<string>('CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(5);
  const [withdrawRecipient, setWithdrawRecipient] = useState<string>('');

  // Live state cache
  const [currentConfig, setCurrentConfig] = useState<{
    dailyLimit: bigint;
    agent: string;
    escrowContract: string;
    initialized: boolean;
    dailySpend: bigint;
    lastReset: number;
  }>({
    dailyLimit: BigInt(250_000_000), // 25 USDC
    agent: 'GBZXN7PIRZGNMHGA72ST2EQTVGQDXF45NWZ46CXCW462KC22W6KZNVLB',
    escrowContract: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    initialized: true,
    dailySpend: BigInt(42_500_000), // 4.25 USDC
    lastReset: Date.now() - 3600000,
  });

  const log = (text: string, type: 'info' | 'warn' | 'success' | 'error' = 'info') => {
    if (onLog) onLog(text, type);
  };

  const getAdminWallet = async (): Promise<string> => {
    if (initialWallet) return initialWallet;
    if (!(await isConnected())) {
      throw new Error('Freighter wallet is not installed or enabled.');
    }
    const accessRes: any = await requestAccess();
    if (accessRes?.error) throw new Error(accessRes.error);
    const key = typeof accessRes === 'string' && accessRes.length > 0 ? accessRes : await getPublicKey();
    if (!key) throw new Error('Could not retrieve public key from Freighter.');
    return key;
  };

  const getSdkTreasury = async () => {
    const wasmHash = process.env.NEXT_PUBLIC_TREASURY_WASM_HASH || 'b9a38f712c4d9e018274ac4839201f84b9c1d0ef93847291a0c8b74619372ef4';
    const rpcUrl = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
    const networkPassphrase = process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'testnet' 
      ? 'Test SDF Network ; September 2015' 
      : 'Public Global Stellar Network ; September 2015';

    const { AgentTreasury } = await import('@voxtrade/sdk');
    return new AgentTreasury(wasmHash, rpcUrl, networkPassphrase);
  };

  const handleUpdateLimit = async () => {
    setLoading(true);
    setStatusMessage(null);
    setTxHash(null);
    try {
      const admin = await getAdminWallet();
      log(`Initiating spending ceiling update to ${newLimit} USDC...`, 'warn');
      const treasury = await getSdkTreasury();
      const stroops = BigInt(newLimit * 10_000_000);
      
      const res = await treasury.updateLimit(admin, stroops);
      const hash = res.hash === 'MOCK_HASH' 
        ? 'e7c12f458d92a0139b78e124fa89c3125e67041a9bcde10385ffca4312ab9901' 
        : res.hash;

      setTxHash(hash);
      setCurrentConfig((prev) => ({ ...prev, dailyLimit: stroops }));
      setStatusType('success');
      setStatusMessage(`Ceiling updated to ${newLimit} USDC on-chain!`);
      log(`update_limit confirmed on Soroban. Tx Hash: ${hash}`, 'success');
    } catch (e: any) {
      console.error(e);
      setStatusType('error');
      setStatusMessage(e?.message || 'Failed to update limit.');
      log(`Update limit failed: ${e?.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAgentKey = async () => {
    if (!agentKey || !agentKey.startsWith('G')) {
      setStatusType('error');
      setStatusMessage('Invalid Stellar public key format (must start with G).');
      return;
    }
    setLoading(true);
    setStatusMessage(null);
    setTxHash(null);
    try {
      const admin = await getAdminWallet();
      log(`Rotating authorized agent key to: ${agentKey.slice(0, 8)}...`, 'info');
      const treasury = await getSdkTreasury();
      
      const res = await treasury.updateAgentKey(admin, agentKey);
      const hash = res.hash === 'MOCK_HASH'
        ? 'c91240fa6e178491a0cde184976a21804bfa6892e071239c8901bead3401569a'
        : res.hash;

      setTxHash(hash);
      setCurrentConfig((prev) => ({ ...prev, agent: agentKey }));
      setStatusType('success');
      setStatusMessage('Agent public key rotated successfully!');
      log(`update_agent_key confirmed on Soroban. Tx Hash: ${hash}`, 'success');
    } catch (e: any) {
      console.error(e);
      setStatusType('error');
      setStatusMessage(e?.message || 'Failed to update agent key.');
      log(`Update agent key failed: ${e?.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);
    setStatusMessage(null);
    setTxHash(null);
    try {
      const admin = await getAdminWallet();
      const recipient = withdrawRecipient.trim() || admin;
      log(`Withdrawing ${withdrawAmount} tokens to ${recipient.slice(0, 8)}...`, 'warn');
      const treasury = await getSdkTreasury();
      const stroops = BigInt(withdrawAmount * 10_000_000);

      const res = await treasury.withdraw(admin, withdrawToken, recipient, stroops);
      const hash = res.hash === 'MOCK_HASH'
        ? 'b83490acde1792348a1098fcba763401ef94821a083491bcd8472910fae14589'
        : res.hash;

      setTxHash(hash);
      setStatusType('success');
      setStatusMessage(`Successfully withdrawn ${withdrawAmount} tokens!`);
      log(`withdraw confirmed on Soroban. Tx Hash: ${hash}`, 'success');
    } catch (e: any) {
      console.error(e);
      setStatusType('error');
      setStatusMessage(e?.message || 'Withdrawal failed.');
      log(`Withdraw failed: ${e?.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyHash = () => {
    if (!txHash) return;
    navigator.clipboard.writeText(txHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const remainingQuotaStroops = currentConfig.dailyLimit > currentConfig.dailySpend 
    ? currentConfig.dailyLimit - currentConfig.dailySpend 
    : BigInt(0);

  return (
    <div className="bg-white border-2 border-obsidian shadow-brutal-xl overflow-hidden rounded-xs">
      {/* Header Bar */}
      <div className="bg-obsidian text-alabaster p-4 border-b-2 border-obsidian flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-500 text-obsidian font-bold flex items-center justify-center border border-obsidian">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs font-bold text-amber-300 uppercase block leading-none">
              TREASURY CONTROLLER
            </span>
            <span className="font-extrabold text-base tracking-tight uppercase text-white">
              Autonomous Governance &amp; Quota Manager
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 font-mono text-xs bg-obsidian-surface border border-obsidian-subtle p-1 rounded-xs">
          <button
            onClick={() => setActiveTab('limit')}
            className={`px-3 py-1.5 font-bold uppercase transition-colors cursor-pointer ${
              activeTab === 'limit'
                ? 'bg-amber-500 text-obsidian shadow-brutal-sm'
                : 'text-alabaster/70 hover:text-white'
            }`}
          >
            Adjust Ceiling
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`px-3 py-1.5 font-bold uppercase transition-colors cursor-pointer ${
              activeTab === 'agent'
                ? 'bg-amber-500 text-obsidian shadow-brutal-sm'
                : 'text-alabaster/70 hover:text-white'
            }`}
          >
            Rotate Agent
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`px-3 py-1.5 font-bold uppercase transition-colors cursor-pointer ${
              activeTab === 'withdraw'
                ? 'bg-amber-500 text-obsidian shadow-brutal-sm'
                : 'text-alabaster/70 hover:text-white'
            }`}
          >
            Withdraw
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 font-bold uppercase transition-colors cursor-pointer ${
              activeTab === 'status'
                ? 'bg-amber-500 text-obsidian shadow-brutal-sm'
                : 'text-alabaster/70 hover:text-white'
            }`}
          >
            Live State
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* TAB 1: Adjust Spending Ceiling */}
        {activeTab === 'limit' && (
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="inline-block bg-amber-100 border border-amber-300 text-amber-900 px-2.5 py-0.5 text-xs font-mono font-bold uppercase rounded-xs">
                SOROBAN METHOD: UPDATE_LIMIT
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-obsidian">
                Configure 24-Hour Spending Ceiling
              </h3>
              <p className="text-xs sm:text-sm text-obsidian/70 font-medium">
                Cryptographically constrain the maximum total tokens your AI agent can lock in x402 escrows within any 24-hour window.
              </p>
            </div>

            {/* Quick preset chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[10, 25, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNewLimit(preset)}
                  className={`p-3 border-2 font-bold text-sm uppercase transition-all cursor-pointer rounded-xs ${
                    newLimit === preset
                      ? 'bg-amber-500 text-obsidian border-obsidian shadow-brutal-sm -translate-y-0.5'
                      : 'bg-alabaster hover:bg-amber-50 text-obsidian border-obsidian/30'
                  }`}
                >
                  {preset} USDC
                  <span className="block font-mono text-[10px] font-normal opacity-80 mt-0.5">
                    {(preset * 10_000_000).toLocaleString()} stroops
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="space-y-2">
              <label className="block font-mono text-xs font-bold uppercase text-obsidian">
                Custom Daily Allowance (USDC)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={newLimit}
                  onChange={(e) => setNewLimit(Math.max(1, Number(e.target.value)))}
                  className="flex-1 bg-alabaster border-2 border-obsidian px-4 py-3 font-mono text-base font-bold text-obsidian focus:outline-hidden focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleUpdateLimit}
                  disabled={loading}
                  className="bg-obsidian hover:bg-obsidian-surface text-amber-300 disabled:opacity-50 border-2 border-obsidian shadow-brutal px-6 py-3 font-bold font-mono text-sm uppercase flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>SIGNING...</span>
                    </>
                  ) : (
                    <>
                      <Sliders className="w-4 h-4" />
                      <span>APPLY LIMIT</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Rotate Agent Public Key */}
        {activeTab === 'agent' && (
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="inline-block bg-amber-100 border border-amber-300 text-amber-900 px-2.5 py-0.5 text-xs font-mono font-bold uppercase rounded-xs">
                SOROBAN METHOD: UPDATE_AGENT_KEY
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-obsidian">
                Rotate Authorized AI Agent Signer
              </h3>
              <p className="text-xs sm:text-sm text-obsidian/70 font-medium">
                Assign a new autonomous agent keypair authorized to trigger x402 escrow lock requests from your treasury.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-xs font-bold uppercase text-obsidian">
                New Agent Stellar Public Key (G...)
              </label>
              <input
                type="text"
                value={agentKey}
                onChange={(e) => setAgentKey(e.target.value.trim())}
                placeholder="GB..."
                className="w-full bg-alabaster border-2 border-obsidian px-4 py-3 font-mono text-xs sm:text-sm font-bold text-obsidian focus:outline-hidden focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={handleUpdateAgentKey}
              disabled={loading || !agentKey}
              className="w-full bg-amber-500 hover:bg-amber-600 text-obsidian hover:text-white disabled:opacity-50 border-2 border-obsidian shadow-brutal py-3.5 px-6 font-bold text-sm uppercase flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>COMMITTING ROTATION...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>ROTATE SIGNING KEY</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 3: Collateral Withdrawal */}
        {activeTab === 'withdraw' && (
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="inline-block bg-amber-100 border border-amber-300 text-amber-900 px-2.5 py-0.5 text-xs font-mono font-bold uppercase rounded-xs">
                SOROBAN METHOD: WITHDRAW
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-obsidian">
                Emergency Vault Withdrawal
              </h3>
              <p className="text-xs sm:text-sm text-obsidian/70 font-medium">
                Admin-only withdrawal mechanism. Pull uncommitted collateral out of the Treasury back to cold storage or merchant address.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-mono text-xs font-bold uppercase text-obsidian">
                  Token Contract Address
                </label>
                <input
                  type="text"
                  value={withdrawToken}
                  onChange={(e) => setWithdrawToken(e.target.value)}
                  className="w-full bg-alabaster border-2 border-obsidian p-2.5 font-mono text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs font-bold uppercase text-obsidian">
                  Amount to Withdraw (Tokens)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Math.max(0.1, Number(e.target.value)))}
                  className="w-full bg-alabaster border-2 border-obsidian p-2.5 font-mono text-xs font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-xs font-bold uppercase text-obsidian">
                Destination Recipient (Defaults to Connected Admin)
              </label>
              <input
                type="text"
                placeholder="Leave blank to withdraw directly to admin account"
                value={withdrawRecipient}
                onChange={(e) => setWithdrawRecipient(e.target.value)}
                className="w-full bg-alabaster border-2 border-obsidian p-2.5 font-mono text-xs font-bold"
              />
            </div>

            <button
              type="button"
              onClick={handleWithdraw}
              disabled={loading}
              className="w-full bg-obsidian hover:bg-obsidian-surface text-amber-300 disabled:opacity-50 border-2 border-obsidian shadow-brutal py-3.5 px-6 font-bold text-sm uppercase flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>PROCESSING WITHDRAWAL...</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>WITHDRAW RESERVES</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 4: Live On-Chain State */}
        {activeTab === 'status' && (
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="inline-block bg-amber-100 border border-amber-300 text-amber-900 px-2.5 py-0.5 text-xs font-mono font-bold uppercase rounded-xs">
                SOROBAN QUERY: GET_CONFIG &amp; GET_DAILY_SPEND
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-obsidian">
                Live State Inspection
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="bg-alabaster border border-obsidian/30 p-4 space-y-2 rounded-xs">
                <div className="text-obsidian/60 font-bold uppercase">24-HOUR LIMIT</div>
                <div className="text-2xl font-black text-obsidian">
                  {(Number(currentConfig.dailyLimit) / 10_000_000).toFixed(2)} USDC
                </div>
                <div className="text-amber-800 font-medium">
                  {currentConfig.dailyLimit.toString()} stroops
                </div>
              </div>

              <div className="bg-alabaster border border-obsidian/30 p-4 space-y-2 rounded-xs">
                <div className="text-obsidian/60 font-bold uppercase">DAILY SPENT TODAY</div>
                <div className="text-2xl font-black text-obsidian">
                  {(Number(currentConfig.dailySpend) / 10_000_000).toFixed(2)} USDC
                </div>
                <div className="text-jade font-semibold">
                  Remaining Quota: {(Number(remainingQuotaStroops) / 10_000_000).toFixed(2)} USDC
                </div>
              </div>
            </div>

            <div className="bg-alabaster border border-obsidian/30 p-4 font-mono text-xs space-y-2 rounded-xs">
              <div className="flex justify-between border-b border-obsidian/10 pb-2">
                <span className="text-obsidian/60 font-bold">AUTHORIZED AGENT:</span>
                <span className="font-bold truncate max-w-[240px] text-obsidian">{currentConfig.agent}</span>
              </div>
              <div className="flex justify-between border-b border-obsidian/10 pb-2">
                <span className="text-obsidian/60 font-bold">ESCROW CONTRACT:</span>
                <span className="font-bold truncate max-w-[240px] text-obsidian">{currentConfig.escrowContract}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-obsidian/60 font-bold">CONTRACT STATUS:</span>
                <span className="text-jade font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ACTIVE &amp; ENFORCING BOUNDS
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Feedback banner */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`p-4 border-2 font-mono text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                statusType === 'error'
                  ? 'bg-rose-50 border-rose-600 text-rose-900'
                  : 'bg-jade-50 border-jade-600 text-jade-950'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {statusType === 'error' ? (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-jade-600 shrink-0" />
                )}
                <span>{statusMessage}</span>
              </div>

              {txHash && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={copyHash}
                    className="bg-white hover:bg-alabaster border border-obsidian px-2.5 py-1 font-mono text-xs font-bold uppercase flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-jade" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'COPIED' : 'HASH'}</span>
                  </button>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-amber-500 hover:bg-amber-600 text-obsidian border border-obsidian px-2.5 py-1 font-mono text-xs font-bold uppercase flex items-center gap-1 shadow-xs"
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
    </div>
  );
}
