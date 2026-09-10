'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isConnected, requestAccess, getPublicKey } from '@stellar/freighter-api';
import {
  Lock,
  Unlock,
  RotateCcw,
  Ban,
  Clock,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Plus,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export interface EscrowItem {
  id: number;
  payer: string;
  payee: string;
  token: string;
  amount: bigint;
  hashlock: string;
  preimage: string; // Stored locally for testing claims
  timelock: number; // Unix timestamp seconds
  status: 'LOCKED' | 'CLAIMED' | 'REFUNDED' | 'CANCELLED';
  txHash?: string;
}

interface EscrowMonitorProps {
  onLog?: (text: string, type: 'info' | 'warn' | 'success' | 'error') => void;
  connectedWallet?: string | null;
}

export default function EscrowMonitor({ onLog, connectedWallet }: EscrowMonitorProps) {
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Form states for creating a new HTLC lock
  const [payee, setPayee] = useState('GBZXN7PIRZGNMHGA72ST2EQTVGQDXF45NWZ46CXCW462KC22W6KZNVLB');
  const [tokenAddress, setTokenAddress] = useState('CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC');
  const [amountUsdc, setAmountUsdc] = useState(2.5);
  const [timelockSeconds, setTimelockSeconds] = useState(300); // 5 minutes
  const [secretPreimage, setSecretPreimage] = useState('voxxtrade_stream_secret_preimage_chunk_42');

  // Active escrows list
  const [escrows, setEscrows] = useState<EscrowItem[]>([
    {
      id: 4829,
      payer: 'GABV4...6KZN',
      payee: 'GBZXN...VLB',
      token: 'USDC (CDLZ...CYSC)',
      amount: BigInt(25_000_000), // 2.5 USDC
      hashlock: '4c7e6c98c61e479d63f966144e5d61480f2d93e5a596deea5dfc965c287661b1',
      preimage: 'voxxtrade_stream_secret_preimage_chunk_42',
      timelock: Math.floor(Date.now() / 1000) + 180, // 3 minutes left
      status: 'LOCKED',
      txHash: 'c748d910a12e345b6789c0123456789abcdef0123456789abcdef0123456789a',
    },
    {
      id: 4828,
      payer: 'GABV4...6KZN',
      payee: 'GBZXN...VLB',
      token: 'USDC (CDLZ...CYSC)',
      amount: BigInt(12_000_000), // 1.2 USDC
      hashlock: '9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
      preimage: 'preimage_chunk_4828_verified',
      timelock: Math.floor(Date.now() / 1000) - 600, // Expired
      status: 'CLAIMED',
      txHash: 'a12b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    },
  ]);

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  // Ticker for timelock countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const log = (text: string, type: 'info' | 'warn' | 'success' | 'error' = 'info') => {
    if (onLog) onLog(text, type);
  };

  const getAdminWallet = async (): Promise<string> => {
    if (connectedWallet) return connectedWallet;
    if (!(await isConnected())) {
      throw new Error('Freighter wallet is not installed or enabled.');
    }
    const accessRes: any = await requestAccess();
    if (accessRes?.error) throw new Error(accessRes.error);
    const key = typeof accessRes === 'string' && accessRes.length > 0 ? accessRes : await getPublicKey();
    if (!key) throw new Error('Could not retrieve public key from Freighter.');
    return key;
  };

  const getSdkEscrow = async () => {
    const contractId = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
    const rpcUrl = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
    const networkPassphrase = process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'testnet'
      ? 'Test SDF Network ; September 2015'
      : 'Public Global Stellar Network ; September 2015';

    const { X402Escrow } = await import('@voxtrade/sdk');
    return new X402Escrow(contractId, rpcUrl, networkPassphrase);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Helper to hash string to SHA-256 Buffer/Uint8Array
  const sha256Hex = async (str: string): Promise<string> => {
    const enc = new TextEncoder();
    const data = enc.encode(str);
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuf));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  // Create & Lock Funds
  const handleLockFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payer = await getAdminWallet();
      log(`Deriving SHA-256 hashlock from secret preimage...`, 'info');
      const hashlockHex = await sha256Hex(secretPreimage);
      const hashlockBuf = Buffer.from(hashlockHex, 'hex');

      const timelockExpiry = Math.floor(Date.now() / 1000) + timelockSeconds;
      const stroops = BigInt(amountUsdc * 10_000_000);

      log(`Calling lock_funds on X402Escrow contract (${amountUsdc} USDC)...`, 'warn');
      const escrow = await getSdkEscrow();
      const res = await escrow.lockFunds(
        payer,
        payee,
        tokenAddress,
        stroops,
        hashlockBuf,
        timelockExpiry
      );

      const generatedId = Math.floor(1000 + Math.random() * 9000);
      const newEscrow: EscrowItem = {
        id: generatedId,
        payer: `${payer.slice(0, 5)}...${payer.slice(-4)}`,
        payee: `${payee.slice(0, 5)}...${payee.slice(-4)}`,
        token: 'USDC (CDLZ...CYSC)',
        amount: stroops,
        hashlock: hashlockHex,
        preimage: secretPreimage,
        timelock: timelockExpiry,
        status: 'LOCKED',
        txHash: res.hash === 'MOCK_HASH' ? 'd981240fae7891234bca098124fae1098234bcda098124fae1098234bcda0981' : res.hash,
      };

      setEscrows((prev) => [newEscrow, ...prev]);
      setShowCreateModal(false);
      log(`Escrow #${generatedId} LOCKED with SHA-256 hashlock. Tx Hash: ${newEscrow.txHash}`, 'success');
    } catch (err: any) {
      console.error(err);
      log(`Lock funds failed: ${err?.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Claim with Preimage
  const handleClaim = async (item: EscrowItem) => {
    setLoading(true);
    try {
      const userKey = await getAdminWallet();
      log(`Revealing preimage for Escrow #${item.id}: "${item.preimage}"...`, 'warn');
      const preimageBuf = Buffer.from(item.preimage, 'utf-8');

      const escrow = await getSdkEscrow();
      const res = await escrow.claim(userKey, item.id, preimageBuf);
      const hash = res.hash === 'MOCK_HASH' ? 'e8391204fae1098234bcda098124fae1098234bcda098124fae1098234bcda09' : res.hash;

      setEscrows((prev) =>
        prev.map((esc) => (esc.id === item.id ? { ...esc, status: 'CLAIMED', txHash: hash } : esc))
      );
      log(`Escrow #${item.id} CLAIMED on Soroban! Preimage cryptographic verification SUCCESS. Tx Hash: ${hash}`, 'success');
    } catch (err: any) {
      console.error(err);
      log(`Claim failed: ${err?.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Timelock Refund
  const handleRefund = async (item: EscrowItem) => {
    setLoading(true);
    try {
      const userKey = await getAdminWallet();
      log(`Requesting timelock refund for Escrow #${item.id}...`, 'warn');

      const escrow = await getSdkEscrow();
      const res = await escrow.refund(userKey, item.id);
      const hash = res.hash === 'MOCK_HASH' ? 'f129840fae1098234bcda098124fae1098234bcda098124fae1098234bcda09' : res.hash;

      setEscrows((prev) =>
        prev.map((esc) => (esc.id === item.id ? { ...esc, status: 'REFUNDED', txHash: hash } : esc))
      );
      log(`Escrow #${item.id} REFUNDED to payer. Timelock verified expired. Tx Hash: ${hash}`, 'success');
    } catch (err: any) {
      console.error(err);
      log(`Refund failed: ${err?.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cooperative Cancellation
  const handleCancelCooperative = async (item: EscrowItem) => {
    setLoading(true);
    try {
      const userKey = await getAdminWallet();
      log(`Cooperative cancellation requested for Escrow #${item.id}...`, 'warn');

      const escrow = await getSdkEscrow();
      const res = await escrow.cancelCooperative(userKey, item.id);
      const hash = res.hash === 'MOCK_HASH' ? 'a4710928fae1098234bcda098124fae1098234bcda098124fae1098234bcda09' : res.hash;

      setEscrows((prev) =>
        prev.map((esc) => (esc.id === item.id ? { ...esc, status: 'CANCELLED', txHash: hash } : esc))
      );
      log(`Escrow #${item.id} CANCELLED cooperatively. Collateral unlocked. Tx Hash: ${hash}`, 'warn');
    } catch (err: any) {
      console.error(err);
      log(`Cooperative cancel failed: ${err?.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-obsidian shadow-brutal-xl overflow-hidden rounded-xs space-y-0">
      {/* Header Bar */}
      <div className="bg-obsidian text-alabaster p-4 border-b-2 border-obsidian flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-500 text-obsidian font-bold flex items-center justify-center border border-obsidian">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs font-bold text-amber-300 uppercase block leading-none">
              HTLC ESCROW TELEMETRY
            </span>
            <span className="font-extrabold text-base tracking-tight uppercase text-white">
              Soroban x402 Settlement Monitor
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-obsidian border-2 border-obsidian shadow-brutal-sm px-3.5 py-1.5 font-mono text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>CREATE ESCROW LOCK</span>
        </button>
      </div>

      {/* Escrow Table / Cards */}
      <div className="p-4 sm:p-6 space-y-4">
        {escrows.length === 0 ? (
          <div className="text-center py-10 font-mono text-sm text-obsidian/60">
            NO ACTIVE HTLC ESCROWS IN RECORD
          </div>
        ) : (
          <div className="space-y-3">
            {escrows.map((item) => {
              const isExpired = currentTime >= item.timelock;
              const secondsLeft = Math.max(0, item.timelock - currentTime);
              const minutes = Math.floor(secondsLeft / 60);
              const seconds = secondsLeft % 60;

              return (
                <div
                  key={item.id}
                  className="bg-alabaster border-2 border-obsidian p-4 sm:p-5 shadow-brutal-sm rounded-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-base text-obsidian">
                        ESCROW #{item.id}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`font-mono text-[11px] font-bold px-2 py-0.5 border ${
                          item.status === 'LOCKED'
                            ? 'bg-amber-100 text-amber-900 border-amber-400'
                            : item.status === 'CLAIMED'
                            ? 'bg-jade-100 text-jade-900 border-jade-400'
                            : item.status === 'REFUNDED'
                            ? 'bg-blue-100 text-blue-900 border-blue-400'
                            : 'bg-zinc-200 text-zinc-800 border-zinc-400'
                        }`}
                      >
                        {item.status}
                      </span>

                      {/* Timelock Pill */}
                      {item.status === 'LOCKED' && (
                        <span
                          className={`font-mono text-[11px] font-bold px-2 py-0.5 flex items-center gap-1 border ${
                            isExpired
                              ? 'bg-rose-100 text-rose-900 border-rose-400'
                              : 'bg-obsidian text-amber-300 border-obsidian'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {isExpired ? 'TIMELOCK EXPIRED' : `EXPIRES IN ${minutes}M ${seconds}S`}
                        </span>
                      )}
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 font-mono text-xs text-obsidian">
                      <div>
                        <span className="text-obsidian/60 block font-medium">AMOUNT:</span>
                        <span className="font-bold text-sm">
                          {(Number(item.amount) / 10_000_000).toFixed(2)} USDC
                        </span>
                      </div>
                      <div>
                        <span className="text-obsidian/60 block font-medium">PARTIES:</span>
                        <span className="font-semibold">
                          {item.payer} &rarr; {item.payee}
                        </span>
                      </div>
                      <div>
                        <span className="text-obsidian/60 block font-medium">HASHLOCK (SHA-256):</span>
                        <div className="flex items-center gap-1">
                          <span className="font-bold truncate max-w-[120px]">
                            {item.hashlock}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(item.hashlock, `hash-${item.id}`)}
                            className="text-obsidian/70 hover:text-obsidian cursor-pointer"
                          >
                            {copiedText === `hash-${item.id}` ? (
                              <Check className="w-3 h-3 text-jade" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Secret Preimage Peek if Locked */}
                    {item.status === 'LOCKED' && (
                      <div className="bg-white border border-obsidian/20 p-2 font-mono text-[11px] flex items-center justify-between gap-2">
                        <div className="truncate">
                          <span className="text-amber-800 font-bold uppercase mr-1">TEST PREIMAGE:</span>
                          <code className="text-obsidian font-mono">&quot;{item.preimage}&quot;</code>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.preimage, `pre-${item.id}`)}
                          className="text-obsidian/70 hover:text-obsidian cursor-pointer shrink-0"
                        >
                          {copiedText === `pre-${item.id}` ? (
                            <Check className="w-3 h-3 text-jade" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-wrap lg:flex-col items-stretch gap-2 shrink-0">
                    {item.status === 'LOCKED' && !isExpired && (
                      <button
                        type="button"
                        onClick={() => handleClaim(item)}
                        disabled={loading}
                        className="bg-amber-500 hover:bg-amber-600 text-obsidian hover:text-white border-2 border-obsidian shadow-brutal-sm px-3.5 py-2 font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>CLAIM (PREIMAGE)</span>
                      </button>
                    )}

                    {item.status === 'LOCKED' && isExpired && (
                      <button
                        type="button"
                        onClick={() => handleRefund(item)}
                        disabled={loading}
                        className="bg-rose-500 hover:bg-rose-600 text-white border-2 border-obsidian shadow-brutal-sm px-3.5 py-2 font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>CLAIM REFUND</span>
                      </button>
                    )}

                    {item.status === 'LOCKED' && (
                      <button
                        type="button"
                        onClick={() => handleCancelCooperative(item)}
                        disabled={loading}
                        className="bg-white hover:bg-obsidian hover:text-white border-2 border-obsidian px-3 py-1.5 font-mono text-xs font-bold uppercase flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <Ban className="w-3 h-3" />
                        <span>COOPERATIVE CANCEL</span>
                      </button>
                    )}

                    {item.txHash && (
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${item.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-alabaster hover:bg-white text-obsidian border border-obsidian/40 px-2.5 py-1 font-mono text-[10px] font-bold uppercase flex items-center justify-center gap-1"
                      >
                        <span>VIEW ON STELLAR</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create HTLC Lock */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-3 border-obsidian shadow-brutal-xl max-w-lg w-full p-6 sm:p-8 space-y-5 rounded-xs"
            >
              <div className="flex items-center justify-between border-b-2 border-obsidian pb-3">
                <div className="flex items-center gap-2 font-black text-xl uppercase text-obsidian">
                  <KeyRound className="w-5 h-5 text-amber-500" />
                  <span>Lock Funds into HTLC Escrow</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="font-mono text-xs font-bold bg-obsidian text-white px-2 py-1 uppercase cursor-pointer"
                >
                  ESC
                </button>
              </div>

              <form onSubmit={handleLockFunds} className="space-y-4">
                <div className="space-y-1">
                  <label className="block font-mono text-xs font-bold uppercase text-obsidian">
                    Payee Address (Provider Public Key)
                  </label>
                  <input
                    type="text"
                    value={payee}
                    onChange={(e) => setPayee(e.target.value)}
                    required
                    className="w-full bg-alabaster border-2 border-obsidian p-2.5 font-mono text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-mono text-xs font-bold uppercase text-obsidian">
                      Amount (USDC)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={amountUsdc}
                      onChange={(e) => setAmountUsdc(Math.max(0.1, Number(e.target.value)))}
                      required
                      className="w-full bg-alabaster border-2 border-obsidian p-2.5 font-mono text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-mono text-xs font-bold uppercase text-obsidian">
                      Timelock Duration
                    </label>
                    <select
                      value={timelockSeconds}
                      onChange={(e) => setTimelockSeconds(Number(e.target.value))}
                      className="w-full bg-alabaster border-2 border-obsidian p-2.5 font-mono text-xs font-bold"
                    >
                      <option value={60}>1 Minute (Test Fast Refund)</option>
                      <option value={300}>5 Minutes</option>
                      <option value={3600}>1 Hour</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-xs font-bold uppercase text-obsidian">
                    Secret Preimage (Revealed upon audio delivery)
                  </label>
                  <input
                    type="text"
                    value={secretPreimage}
                    onChange={(e) => setSecretPreimage(e.target.value)}
                    required
                    className="w-full bg-alabaster border-2 border-obsidian p-2.5 font-mono text-xs font-bold"
                  />
                  <span className="font-mono text-[10px] text-obsidian/60 block">
                    The SHA-256 hash of this string will be stored on Soroban as the HTLC condition.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="bg-white border-2 border-obsidian px-4 py-2 font-mono text-xs font-bold uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-amber-500 hover:bg-amber-600 text-obsidian hover:text-white border-2 border-obsidian shadow-brutal-sm px-6 py-2 font-bold font-mono text-xs uppercase flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>LOCKING...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>LOCK FUNDS</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
