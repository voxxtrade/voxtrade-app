# VoxTrade Merchant Web Console (`apps/web`)

> Next.js 14 Merchant Dashboard and Real-Time Voice Negotiation Room for **VoxTrade: Sovereign Voice-to-Voice Commerce on Stellar**.

🚀 **Live Production Deployment**: [https://voxtrade-rho.vercel.app](https://voxtrade-rho.vercel.app)

---

## Features

- **3-Mode Voice Negotiation Room**:
  - **`User-to-Agent`**: Real human voice shopping with an AI merchant sales representative.
  - **`Agent-to-Agent`**: Autonomous negotiation between buyer and supplier AI agents.
  - **`Human-to-Human`**: Direct peer-to-peer voice calls with an impartial AI escrow drafter.
- **Freighter Wallet Integration**: Connect and authenticate non-custodial Stellar accounts with automatic network validation.
- **Merchant Treasury Control**: Deploy and configure `AgentTreasury` vaults, enforce 24-hour spending bounds, rotate AI keys, and withdraw collateral.
- **Real-Time Audio Visualizer**: 60fps frequency spectrum analyzer using the Web Audio API with natural voice cadence feedback.
- **Dynamic AI LLM Providers**: Support for Google Gemini (Auto-ranked), OpenAI, Groq (Llama 3.1), Anthropic (Claude 3.5), or custom user API keys.
- **On-Chain Escrow Telemetry**: Live polling and status tracking for Soroban `X402Escrow` contracts on the Stellar Testnet.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components & Client Hooks)
- **Styling**: Tailwind CSS, Lucide Icons, Framer Motion
- **Stellar SDK**: `@stellar/stellar-sdk`, `@stellar/freighter-api`
- **Internal SDK**: `@voxtrade/sdk`
- **Audio & Speech**: Web Audio API, Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)

---

## Getting Started

### 1. Prerequisites

- **Node.js**: `v18.0.0` or higher (`v20.x` recommended)
- **Package Manager**: `pnpm`
- **Wallet**: [Freighter](https://www.freighter.app/) extension switched to **Test SDF Network**

### 2. Environment Setup

Copy the template environment file:

```bash
cp .env.example .env.local
```

The default values are preconfigured for the Stellar Testnet:

```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_STELLAR_PASSPHRASE="Test SDF Network ; September 2015"

NEXT_PUBLIC_TREASURY_WASM_HASH=b9a38f712c4d9e018274ac4839201f84b9c1d0ef93847291a0c8b74619372ef4
NEXT_PUBLIC_TREASURY_CONTRACT_ID=CCBZLHEHRUBAHGB72ZZLNHBT4RURGTW2SSSQC4DJDDILVDG4VR55FEJL
NEXT_PUBLIC_ESCROW_CONTRACT_ID=CDJS3VHPBXVSFIPA6FUBVS3YXKUGZ75GQ7TQFVPMHBX3KHMREGGNMLFE
NEXT_PUBLIC_USDC_CONTRACT_ID=CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75
```

### 3. Local Development

From the monorepo root:

```bash
# Start development server
pnpm --filter web dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build & Vercel Deployment

```bash
# Build the production bundle
pnpm --filter @voxtrade/sdk build
pnpm --filter web build
```

This application is deployed on Vercel with automatic monorepo dependency resolution.

---

## License

Released under the [MIT License](../../LICENSE).
