# @voxtrade/sdk

> Isomorphic TypeScript SDK for **VoxTrade: Sovereign Voice-to-Voice Commerce on Stellar Soroban**.

---

## Overview

`@voxtrade/sdk` provides strongly typed client bindings, cryptographic utilities, and HTTP 402 protocol parsers for building Voice-to-Voice commerce applications on the Stellar network. It works seamlessly across:
- **Web Browsers**: Native integration with the [Freighter Wallet](https://www.freighter.app/) extension.
- **Node.js / Server Runtimes**: Direct programmatic interaction for autonomous AI agents, backend payment servers, and microservices.

---

## Installation

```bash
pnpm add @voxtrade/sdk
# or
npm install @voxtrade/sdk
```

---

## Published Testnet Contracts

| Contract | Testnet Contract ID | Description |
|---|---|---|
| **`AgentTreasury`** | `CCBZLHEHRUBAHGB72ZZLNHBT4RURGTW2SSSQC4DJDDILVDG4VR55FEJL` | 24-hour spending vault for AI agents |
| **`X402Escrow`** | `CDJS3VHPBXVSFIPA6FUBVS3YXKUGZ75GQ7TQFVPMHBX3KHMREGGNMLFE` | Trustless Hash Time-Locked Contract (HTLC) |

---

## Quick Start

### 1. Managing an Agent Treasury

```typescript
import { AgentTreasury } from '@voxtrade/sdk';

const treasury = new AgentTreasury(
  'b9a38f712c4d9e018274ac4839201f84b9c1d0ef93847291a0c8b74619372ef4', // WASM hash
  'https://soroban-testnet.stellar.org',
  'Test SDF Network ; September 2015'
);

// Initialize a new merchant vault with an AI spending ceiling
const res = await treasury.initialize('G_ADMIN_PUBLIC_KEY...', {
  dailyLimit: 100_000_000n, // 10 USDC (7 decimals)
  agent: 'G_AGENT_PUBLIC_KEY...',
  escrowContract: 'CDJS3VHPBXVSFIPA6FUBVS3YXKUGZ75GQ7TQFVPMHBX3KHMREGGNMLFE',
});

console.log('Treasury initialized:', res.hash);
```

### 2. Trustless HTLC Escrow Locking & Claiming

```typescript
import { X402Escrow, generatePreimage } from '@voxtrade/sdk';

const escrow = new X402Escrow(
  'CDJS3VHPBXVSFIPA6FUBVS3YXKUGZ75GQ7TQFVPMHBX3KHMREGGNMLFE',
  'https://soroban-testnet.stellar.org',
  'Test SDF Network ; September 2015'
);

// 1. Generate cryptographic hashlock: H = SHA256(preimage)
const { preimage, hashLockHex } = generatePreimage();

// 2. Lock funds into Soroban escrow (Buyer flow)
const lockRes = await escrow.lockFunds(
  'G_BUYER...',
  'G_SELLER...',
  'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75', // USDC
  70_000_000n, // 7 USDC
  hashLockHex,
  120 // Timeout in ledgers (~10 minutes)
);

console.log(`Locked escrow ID: ${lockRes.escrowId}`);

// 3. Claim funds by revealing preimage (Seller flow)
const claimRes = await escrow.claim('G_SELLER...', lockRes.escrowId, preimage);
console.log('Claimed successfully:', claimRes.hash);
```

### 3. HTTP 402 Micropayment Headers

```typescript
import { parseX402Challenge, formatX402Authorization } from '@voxtrade/sdk';

// Parse server 402 challenge
const challenge = parseX402Challenge(
  'x402 contract="CDJS...", token="USDC", amount="1000000", hash_lock="3b9a...", timeout_ledgers="120"'
);

// Format client Authorization header after on-chain lock
const authHeader = formatX402Authorization(
  42n,
  '0xabc123...',
  'G_BUYER_PUBLIC_KEY...'
);
// Output: x402 escrow_id="42", tx_hash="0xabc123...", buyer="G_BUYER..."
```

### 4. Voice Synthesis & Audio Utilities

```typescript
import {
  rankSpeechSynthesisVoices,
  selectOptimalVoicePair,
  cleanLLMDialogue,
} from '@voxtrade/sdk';

// Rank available browser voices by natural human clarity
const availableVoices = window.speechSynthesis.getVoices();
const rankedVoices = rankSpeechSynthesisVoices(availableVoices);

// Auto-pair optimal contrasting voices for two-agent negotiation
const [buyerVoice, sellerVoice] = selectOptimalVoicePair(availableVoices);

// Strip markdown, stage directions, and JSON tags for clean TTS audio
const cleanAudioPrompt = cleanLLMDialogue(
  'Certainly! *adjusts headset* I can offer 7.50 USDC. [METADATA: {"tag": "COUNTER_OFFER"}]'
);
// Output: "Certainly! I can offer 7.50 USDC."
```

---

## API Reference

### Classes
- **`AgentTreasury`**: Manages merchant smart account vaults, rolling 24-hour quota limits, agent key rotation, and capital withdrawals.
- **`X402Escrow`**: High-level interface for Soroban HTLC escrow contracts (`lockFunds`, `claim`, `refund`, `cancelCooperative`, `getEscrow`).

### Functions
- **`generatePreimage()`**: Generates cryptographically secure 32-byte secret and corresponding SHA-256 hash.
- **`parseX402Challenge(header)`**: Parses HTTP `WWW-Authenticate: x402` challenges.
- **`formatX402Authorization(escrowId, txHash, buyer)`**: Formats `Authorization: x402` payment proofs.
- **`rankSpeechSynthesisVoices(voices)`**: Evaluates and sorts Web Speech API voices by natural cadence.
- **`selectOptimalVoicePair(voices)`**: Chooses distinct, high-fidelity voices for autonomous negotiation sessions.
- **`cleanLLMDialogue(rawText)`**: Sanitizes LLM dialogue for text-to-speech audio engines.

---

## Development & Testing

```bash
# Build the SDK bundle
pnpm build

# Run unit tests (Vitest)
pnpm test

# Typecheck
pnpm typecheck
```

---

## License

Released under the [MIT License](../../LICENSE).
