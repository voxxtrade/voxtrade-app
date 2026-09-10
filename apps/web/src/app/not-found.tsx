import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-alabaster flex items-center justify-center p-6 text-obsidian">
      <div className="max-w-md w-full bg-white border-2 border-obsidian p-8 shadow-brutal text-center space-y-5">
        <div className="w-12 h-12 bg-amber-500 border-2 border-obsidian shadow-brutal-sm flex items-center justify-center font-black text-xl mx-auto">
          404
        </div>
        <h1 className="text-3xl font-extrabold uppercase tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm text-obsidian/70">
          The requested resource or contract interface does not exist on this route.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-obsidian text-amber-300 hover:text-white font-bold text-xs uppercase px-5 py-3 border-2 border-obsidian shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to VoxTrade Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
