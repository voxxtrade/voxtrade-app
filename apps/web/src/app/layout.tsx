import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VoxTrade ⚡ Sovereign Voice-to-Voice Commerce on Stellar',
  description: 'Autonomous AI-to-AI voice negotiation and instant micropayments powered by Soroban smart contracts on Stellar.',
  keywords: ['Web3', 'Stellar', 'Soroban', 'Voice AI', 'Micropayments', 'HTLC', 'Neo-Brutalism'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-neo-bg text-black font-sans min-h-screen selection:bg-black selection:text-neo-yellow">
        {children}
      </body>
    </html>
  );
}

