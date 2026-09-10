'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isConnected, getPublicKey, requestAccess } from '@stellar/freighter-api';
import { Wallet, Check, Copy, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';

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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-neo-lime border-4 border-black p-4 shadow-brutal flex flex-col gap-3"
        >
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3.5 h-3.5 bg-black border-2 border-black relative">
                <span className="absolute inset-0.5 bg-neo-yellow animate-ping"></span>
                <span className="absolute inset-0.5 bg-neo-yellow"></span>
              </span>
              <span className="font-black text-xs tracking-wider uppercase bg-black text-white px-2 py-0.5">
                FREIGHTER CONNECTED
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-black uppercase text-black bg-white border-2 border-black px-1.5 py-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TESTNET</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 bg-white border-2 border-black p-2">
            <span className="font-mono text-xs md:text-sm font-bold truncate text-black">
              {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyAddress}
              title="Copy Public Key"
              className="px-2 py-1 bg-neo-yellow hover:bg-yellow-300 text-black border-2 border-black font-mono text-xs font-black flex items-center gap-1 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-black" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-black" />
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
    <div className="w-full space-y-3">
      <motion.button
        whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0px 0px #000000' }}
        whileTap={{ x: 2, y: 2, boxShadow: '0px 0px 0px 0px #000000' }}
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full bg-neo-yellow hover:bg-yellow-300 text-black text-base md:text-lg font-black uppercase tracking-tight py-4 px-6 border-4 border-black shadow-brutal flex items-center justify-center gap-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed group"
      >
        <Wallet className="w-6 h-6 stroke-[2.5] group-hover:rotate-12 transition-transform" />
        {isConnecting ? (
          <span className="animate-pulse tracking-normal">HANDSHAKING FREIGHTER...</span>
        ) : (
          <span>CONNECT FREIGHTER WALLET</span>
        )}
      </motion.button>

      <AnimatePresence>
        {notInstalled && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3 bg-neo-pink border-3 border-black shadow-brutal-sm text-black text-xs font-bold space-y-1.5"
          >
            <div className="flex items-center gap-1.5 text-black font-black uppercase">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Freighter Wallet Extension Not Found!</span>
            </div>
            <p className="font-medium text-[11px] leading-tight">
              Please install the official Freighter extension to interact with Soroban smart contracts.
            </p>
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-white hover:bg-black hover:text-white text-black border-2 border-black px-2 py-1 font-mono text-[10px] font-black uppercase transition-colors"
            >
              Get Freighter.app <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
