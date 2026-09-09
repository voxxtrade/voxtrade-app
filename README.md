<div align="center">
  <h1>voxtrade-app</h1>
  <p><strong>Sovereign Voice-to-Voice Commerce: Merchant Dashboard & SDK</strong></p>
  <p>
    <img src="https://img.shields.io/github/actions/workflow/status/voxxtrade/voxtrade-app/ci.yml?branch=main" alt="CI Status" />
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
    <img src="https://img.shields.io/badge/Next.js-14.2-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Stellar-Soroban_SDK-orange" alt="Soroban SDK" />
  </p>
  <p>
    <a href="https://github.com/voxxtrade/voxtrade-contract"><strong>VoxTrade Contracts</strong></a> &bull;
    <a href="#getting-started"><strong>Getting Started</strong></a> &bull;
    <a href="#architecture"><strong>Architecture</strong></a>
  </p>
</div>

> Part of the **[VoxTrade](https://github.com/voxxtrade)** suite. This repository houses the merchant-facing frontend dashboard and the TypeScript SDK used to interact with the VoxTrade Soroban smart contracts.

## The Application Layer

While the [voxtrade-contract](https://github.com/voxxtrade/voxtrade-contract) repository enforces the rigid security limits and cryptographic bounds on-chain, `voxtrade-app` provides the off-chain interface:

1. **Merchant Dashboard (`apps/web`)** &mdash; A Next.js 14 interface where human merchants connect their Freighter wallets to deploy and manage their AI Agent's `AgentTreasury`. This is where merchants set strict 24-hour spending limits.
2. **Contract SDK (`packages/sdk`)** &mdash; A strongly-typed TypeScript abstraction over `@stellar/stellar-sdk` and `@stellar/freighter-api`. It safely constructs, simulates, and submits `AgentTreasury` and `X402Escrow` Soroban RPC calls.

## Architecture & Monorepo Structure

We use a modern `pnpm` workspace to cleanly separate the browser-based UI components from the core contract logic.

```text
voxtrade-app/
├── packages/
│   └── sdk/                       # Standalone TS SDK for Soroban contracts
│       ├── src/
│       │   ├── treasury.ts        # AgentTreasury bindings (initialize, execute_x402_lock)
│       │   └── escrow.ts          # X402Escrow bindings (claim, refund)
│       └── package.json
└── apps/
    └── web/                       # Next.js 14 Merchant Dashboard
        ├── src/
        │   ├── app/
        │   │   ├── page.tsx       # Landing page
        │   │   └── dashboard/     # Treasury configuration & limits UI
        │   ├── components/        # FreighterConnect & Wallet state
        │   └── lib/               # Shared RPC & network configuration
        ├── package.json
        └── tailwind.config.ts
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (v9+)
- [Freighter Wallet](https://www.freighter.app/) browser extension

### Installation

Clone the repository and install the workspace dependencies:

```bash
git clone https://github.com/voxxtrade/voxtrade-app.git
cd voxtrade-app

# Install dependencies across the monorepo
pnpm install
```

### Environment Variables

Copy the `.env.example` file in `apps/web` to `.env.local` and configure your deployed contract addresses:

```bash
cd apps/web
cp .env.example .env.local
```

### Running the App

Start the Next.js development server:

```bash
# From the root of the workspace
pnpm dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to view the Merchant Dashboard.

## Network Compatibility

The SDK and Web App default to the **Stellar Testnet**. To connect to Mainnet, ensure your Freighter wallet is switched to the Public Global Stellar Network and update your `.env.local` variables accordingly.

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, development workflow, and how to submit pull requests. For security issues, refer to our [SECURITY.md](SECURITY.md).

## Maintainers

| Name | Role | Contact |
|---|---|---|
| **VoxTrade Core** | Protocol Architecture | [GitHub](https://github.com/voxxtrade) |

## License

MIT License. See [LICENSE](LICENSE) for details.
