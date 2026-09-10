'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured by Next.js Global Error Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-alabaster bg-alabaster-grid flex items-center justify-center p-4 sm:p-6 text-obsidian">
      <div className="max-w-lg w-full bg-white border-2 border-obsidian p-8 shadow-brutal-xl space-y-6">
        <div className="flex items-center gap-3 border-b-2 border-obsidian/15 pb-4">
          <div className="w-12 h-12 bg-amber-500 border-2 border-obsidian shadow-brutal-sm flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-obsidian stroke-[2.5]" />
          </div>
          <div>
            <span className="bg-rose-100 text-rose-800 border border-rose-300 font-mono text-[10px] font-bold uppercase px-2 py-0.5">
              RUNTIME RECOVERY
            </span>
            <h1 className="text-2xl font-black uppercase text-obsidian tracking-tight mt-1">
              Interface Glitch Detected
            </h1>
          </div>
        </div>

        <p className="font-mono text-xs text-obsidian/80 bg-alabaster border border-obsidian/20 p-3 leading-relaxed break-words">
          {error?.message || 'An unexpected client-side error interrupted navigation.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-obsidian border-2 border-obsidian shadow-brutal-sm hover:shadow-brutal py-3 px-4 font-bold text-sm uppercase flex items-center justify-center gap-2 transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>RETRY VIEW</span>
          </button>
          
          <Link
            href="/"
            className="flex-1 bg-obsidian hover:bg-obsidian-surface text-amber-300 border-2 border-obsidian shadow-brutal-sm hover:shadow-brutal py-3 px-4 font-bold text-sm uppercase flex items-center justify-center gap-2 transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5 text-center"
          >
            <Home className="w-4 h-4 stroke-[2.5]" />
            <span>RETURN HOME</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
