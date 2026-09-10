import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VoxTrade — Sovereign Voice-to-Voice Commerce on Stellar',
  description: 'Autonomous AI-to-AI voice negotiation and real-time micropayments governed by Soroban smart contracts on the Stellar network.',
  keywords: ['Stellar', 'Soroban', 'Voice AI', 'Micropayments', 'HTLC', 'x402 Protocol', 'Autonomous Commerce'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-alabaster text-obsidian font-sans min-h-screen selection:bg-obsidian selection:text-amber-400">
        {children}
      </body>
    </html>
  );
}



