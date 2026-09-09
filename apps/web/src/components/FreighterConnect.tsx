'use client';

import { useState, useEffect } from 'react';
import { isConnected, getPublicKey, requestAccess } from '@stellar/freighter-api';

export default function FreighterConnect() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    async function checkConnection() {
      try {
        if (await isConnected()) {
          const key = await getPublicKey();
          if (key) setPublicKey(key);
        }
      } catch (e) {
        // Not connected or Freighter not installed
      }
    }
    checkConnection();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      if (await isConnected()) {
        await requestAccess();
        const key = await getPublicKey();
        if (key) setPublicKey(key);
      } else {
        alert('Freighter wallet is not installed!');
      }
    } catch (e) {
      console.error('Failed to connect to Freighter', e);
    } finally {
      setIsConnecting(false);
    }
  };

  if (publicKey) {
    return (
      <div className="flex flex-col items-center space-y-4 w-full">
        <div className="bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 px-6 py-3 rounded-xl w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="font-medium text-sm">Connected</span>
          </div>
          <span className="font-mono text-xs opacity-80">
            {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isConnecting ? (
        <span className="animate-pulse">Connecting...</span>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Connect Freighter
        </>
      )}
    </button>
  );
}
