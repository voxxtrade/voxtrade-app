'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  X, 
  ChevronDown, 
  ArrowRight, 
  Radio, 
  ExternalLink, 
  FileCode, 
  Code
} from 'lucide-react';

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGithubMenuOpen, setIsGithubMenuOpen] = useState(false);
  const githubMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or ESC key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (githubMenuRef.current && !githubMenuRef.current.contains(event.target as Node)) {
        setIsGithubMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsGithubMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navLinks = [
    { label: 'Why Stellar', href: '#stellar' },
    { label: 'Acoustic Lab', href: '#telemetry' },
    { label: 'x402 Spec', href: '#protocol' },
    { label: 'Open Source', href: '#open-source' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-2 border-obsidian bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="flex items-center gap-2.5 group focus:outline-hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-9 h-9 bg-obsidian border-2 border-obsidian shadow-brutal-xs flex items-center justify-center font-mono font-black text-amber-400 text-sm group-hover:bg-amber-500 group-hover:text-obsidian transition-colors">
                VX
              </div>
              <span className="font-black text-xl md:text-2xl tracking-tight text-obsidian uppercase">
                VoxTrade
              </span>
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-jade/10 text-jade-900 border border-jade/30 rounded-xs font-mono text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse"></span>
              Stellar Testnet
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-obsidian/75 hover:text-obsidian hover:bg-obsidian/5 border border-transparent hover:border-obsidian/20 transition-all rounded-xs"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* GitHub Dropdown Menu */}
            <div className="relative" ref={githubMenuRef}>
              <button
                type="button"
                onClick={() => setIsGithubMenuOpen(!isGithubMenuOpen)}
                aria-expanded={isGithubMenuOpen}
                aria-haspopup="true"
                className="inline-flex items-center gap-1.5 bg-white hover:bg-amber-50 text-obsidian font-mono text-xs font-bold uppercase px-3 py-2 border-2 border-obsidian shadow-brutal-xs hover:shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                title="View Open Source Repositories"
              >
                <GithubIcon className="w-4 h-4" />
                <span className="hidden sm:inline">CODE</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isGithubMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isGithubMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border-2 border-obsidian shadow-brutal-md p-2 z-50 animate-in fade-in-50 duration-150">
                  <div className="px-2.5 py-1.5 border-b border-obsidian/10 flex items-center justify-between">
                    <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-obsidian/60">
                      Open Source Repositories
                    </span>
                    <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase rounded-xs">
                      Public
                    </span>
                  </div>

                  <div className="py-1 space-y-1">
                    <a
                      href="https://github.com/voxxtrade/voxtrade-contract"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsGithubMenuOpen(false)}
                      className="group flex items-start gap-2.5 p-2 hover:bg-amber-50 border border-transparent hover:border-obsidian/20 transition-all text-left"
                    >
                      <div className="p-1.5 bg-obsidian text-amber-300 rounded-xs shrink-0 mt-0.5">
                        <FileCode className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-obsidian group-hover:text-amber-700 truncate">
                            voxtrade-contract
                          </span>
                          <ExternalLink className="w-3 h-3 text-obsidian/40 group-hover:text-amber-700 shrink-0 ml-1" />
                        </div>
                        <p className="font-mono text-[10px] text-obsidian/60 leading-tight mt-0.5">
                          Soroban smart contracts in Rust (Treasury &amp; Escrow)
                        </p>
                      </div>
                    </a>

                    <a
                      href="https://github.com/voxxtrade/voxtrade-app"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsGithubMenuOpen(false)}
                      className="group flex items-start gap-2.5 p-2 hover:bg-amber-50 border border-transparent hover:border-obsidian/20 transition-all text-left"
                    >
                      <div className="p-1.5 bg-obsidian text-amber-300 rounded-xs shrink-0 mt-0.5">
                        <Code className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-obsidian group-hover:text-amber-700 truncate">
                            voxtrade-app
                          </span>
                          <ExternalLink className="w-3 h-3 text-obsidian/40 group-hover:text-amber-700 shrink-0 ml-1" />
                        </div>
                        <p className="font-mono text-[10px] text-obsidian/60 leading-tight mt-0.5">
                          Web application, Voice suite &amp; TypeScript SDK
                        </p>
                      </div>
                    </a>
                  </div>

                  <div className="pt-1.5 mt-1 border-t border-obsidian/10">
                    <a
                      href="https://github.com/voxxtrade"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsGithubMenuOpen(false)}
                      className="flex items-center justify-between px-2.5 py-1.5 font-mono text-[11px] font-bold text-obsidian/75 hover:text-obsidian hover:bg-obsidian/5 transition-colors"
                    >
                      <span>Organization profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Launch App Primary CTA */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-amber-400 hover:bg-amber-500 text-obsidian font-mono text-xs sm:text-sm font-black uppercase px-3.5 sm:px-4 py-2 border-2 border-obsidian shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer shrink-0"
            >
              <Radio className="w-3.5 h-3.5 text-obsidian animate-pulse shrink-0" />
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden p-2 bg-white text-obsidian border-2 border-obsidian shadow-brutal-xs hover:bg-amber-50 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer shrink-0"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t-2 border-obsidian bg-white px-4 py-5 space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-brutal-md">
          {/* In-page Anchor Links */}
          <div className="space-y-1">
            <div className="px-2 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-obsidian/50">
              Navigation
            </div>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 border border-obsidian/10 font-mono text-xs font-bold uppercase tracking-wider text-obsidian hover:bg-amber-50 hover:border-obsidian transition-colors"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-obsidian/40" />
              </a>
            ))}
          </div>

          {/* Mobile GitHub Links */}
          <div className="space-y-1">
            <div className="px-2 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-obsidian/50">
              Open Source Repositories
            </div>
            <a
              href="https://github.com/voxxtrade/voxtrade-contract"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 bg-alabaster border border-obsidian/20 font-mono text-xs font-bold text-obsidian hover:bg-amber-50"
            >
              <div className="flex items-center gap-2">
                <GithubIcon className="w-4 h-4" />
                <span>voxtrade-contract (Rust)</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-obsidian/50" />
            </a>
            <a
              href="https://github.com/voxxtrade/voxtrade-app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 bg-alabaster border border-obsidian/20 font-mono text-xs font-bold text-obsidian hover:bg-amber-50"
            >
              <div className="flex items-center gap-2">
                <GithubIcon className="w-4 h-4" />
                <span>voxtrade-app (Web &amp; SDK)</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-obsidian/50" />
            </a>
          </div>

          {/* Full-width Launch App button for mobile */}
          <div className="pt-2">
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-amber-400 hover:bg-amber-500 text-obsidian font-mono text-sm font-black uppercase py-3 border-2 border-obsidian shadow-brutal active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Launch App &amp; Voice Console</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>

          <div className="pt-2 border-t border-obsidian/10 flex items-center justify-between font-mono text-[10px] text-obsidian/60">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-jade inline-block"></span>
              Stellar Soroban Testnet
            </span>
            <span>MIT &amp; Apache 2.0</span>
          </div>
        </div>
      )}
    </header>
  );
}
