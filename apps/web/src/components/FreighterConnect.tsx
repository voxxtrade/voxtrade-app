'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isConnected, getPublicKey, requestAccess } from '@stellar/freighter-api';
import { Wallet, Check, Copy, ExternalLink, ShieldCheck, AlertTriangle, Coins } from 'lucide-react';

export default function FreighterConnect() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notInstalled, setNotInstalled] = useState(false);

  useEffect(() => {
    async function checkConnection() {
      try {
        if (await isConnected()) {
          const key = await getPublicKey();
          if (key) setPublicKey(key);
        }
      } catch (e) {
        // Not connected or Freighter extension not found
      }
    }
    checkConnection();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setNotInstalled(false);
    try {
      const connected = await isConnected();
      if (!connected) {
        setNotInstalled(true);
        setIsConnecting(false);
        return;
      }
      
      const accessRes: any = await requestAccess();
      if (accessRes?.error) {
        throw new Error(accessRes.error);
      }
      
      const key = typeof accessRes === 'string' && accessRes.length > 0 ? accessRes : await getPublicKey();
      if (key) {
        setPublicKey(key);
      }
    } catch (e) {
      console.error('Failed to connect to Freighter', e);
    } finally {
      setIsConnecting(false);
    }
  };

  const copyAddress = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (publicKey) {
    return (
      <div className="w-full space-y-2">
        <motion.div 
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border-2 border-obsidian p-3.5 shadow-brutal text-obsidian space-y-2.5"
        >
          <div className="flex items-center justify-between border-b border-alabaster-subtle pb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jade opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-jade"></span>
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-obsidian flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                FREIGHTER AUTHORIZED
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-amber-900 bg-amber-100 px-2 py-0.5 border border-amber-300 rounded-xs">
              <ShieldCheck className="w-3 h-3 text-amber-700" />
              <span>TESTNET</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 bg-alabaster border border-obsidian/20 p-2 rounded-xs">
            <span className="font-mono text-xs font-semibold truncate text-obsidian">
              {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
            </span>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={copyAddress}
              title="Copy Public Key"
              className="px-2.5 py-1 bg-white hover:bg-amber-50 text-obsidian border border-obsidian/30 font-mono text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-jade" />
                  <span className="text-jade font-bold">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-obsidian/60" />
                  <span>COPY</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2.5">
      <motion.button
        whileHover={{ x: -1.5, y: -1.5, boxShadow: '5px 5px 0px 0px #0D0F12' }}
        whileTap={{ x: 1.5, y: 1.5, boxShadow: '0px 0px 0px 0px #0D0F12' }}
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full bg-obsidian hover:bg-obsidian-surface text-white text-sm sm:text-base font-bold uppercase tracking-wider py-4 px-6 border-2 border-obsidian shadow-brutal flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
      >
        <Wallet className="w-5 h-5 text-amber-400 group-hover:rotate-6 transition-transform stroke-[2.2]" />
        {isConnecting ? (
          <span className="font-mono tracking-normal text-xs text-amber-200 animate-pulse">CONNECTING FREIGHTER...</span>
        ) : (
          <span className="text-amber-100 group-hover:text-amber-300 transition-colors">CONNECT FREIGHTER WALLET</span>
        )}
      </motion.button>

      <AnimatePresence>
        {notInstalled && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="p-3 bg-amber-50 border-2 border-amber-600 shadow-brutal-sm text-obsidian text-xs font-medium space-y-1.5"
          >
            <div className="flex items-center gap-1.5 font-bold uppercase text-amber-900">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
              <span>Freighter Extension Not Found</span>
            </div>
            <p className="text-[11px] leading-tight text-amber-950">
              Please install the official Freighter wallet extension to authorize transactions and deploy Soroban contracts.
            </p>
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-obsidian text-amber-300 hover:text-white border border-obsidian px-2 py-1 font-mono text-[10px] font-bold uppercase transition-colors"
            >
              Install Freighter <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
