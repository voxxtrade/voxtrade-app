# Stellar Testnet Developer Guide

This guide walks you through setting up a funded Stellar Testnet account with Freighter and configuring testnet USDC for local development and testing with **VoxTrade**.

---

## 1. Install & Configure Freighter Wallet

1. Install the official [Freighter Wallet](https://www.freighter.app/) extension for Chrome, Brave, or Firefox.
2. Complete initial wallet creation and securely store your 12-word recovery phrase.
3. Open Freighter settings (gear icon) and switch the active network from **Public Network** to **Test SDF Network**.

---

## 2. Fund with Testnet XLM (Friendbot)

Stellar accounts require a minimum reserve of native Lumens (XLM) to exist on ledger and pay transaction fees:

1. Copy your Freighter public key (starts with `G...`).
2. Go to the [Stellar Laboratory Account Creator](https://laboratory.stellar.org/#account-creator?network=test).
3. Paste your public address into the **Friendbot: Get test network lumens** input.
4. Click **Get test network lumens**.
5. Your Freighter wallet should update within seconds with `10,000 XLM`.

---

## 3. Add Testnet USDC Trustline

VoxTrade settles voice commerce, AI compute orders, and agent escrows using **USDC**. On Stellar, accounts must establish an explicit trustline before receiving non-native assets:

| Parameter | Value |
|---|---|
| **Asset Code** | `USDC` |
| **Issuer Public Key** | `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` |

### Adding Trustline in Freighter:
1. In Freighter, click the **+ Add Asset** button on the home screen.
2. Select **Custom Asset**.
3. Enter `USDC` as the asset code.
4. Paste `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` into the issuer field.
5. Review transaction details and confirm.

---

## 4. Acquire Testnet USDC

You can acquire testnet USDC via:
1. **Stellar Laboratory Swap**: Swap a small portion of your testnet XLM for USDC using the [Stellar Lab Transaction Builder](https://laboratory.stellar.org/#txbuilder?network=test).
2. **Community Faucet**: Request testnet USDC via the `#faucet` channel in the official [Stellar Developer Discord](https://discord.gg/stellar).

---

## 5. Configure Local Environment

In `apps/web/.env.local`:

```env
# Target Stellar Network
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_STELLAR_PASSPHRASE="Test SDF Network ; September 2015"

# Deployed Contract Addresses on Testnet
NEXT_PUBLIC_TREASURY_WASM_HASH=b9a38f712c4d9e018274ac4839201f84b9c1d0ef93847291a0c8b74619372ef4
NEXT_PUBLIC_TREASURY_CONTRACT_ID=CCBZLHEHRUBAHGB72ZZLNHBT4RURGTW2SSSQC4DJDDILVDG4VR55FEJL
NEXT_PUBLIC_ESCROW_CONTRACT_ID=CDJS3VHPBXVSFIPA6FUBVS3YXKUGZ75GQ7TQFVPMHBX3KHMREGGNMLFE
NEXT_PUBLIC_USDC_CONTRACT_ID=CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75
```

### Published Contracts Quick Reference

| Contract | Testnet Address | Explorer |
|---|---|---|
| **`AgentTreasury`** | `CCBZLHEHRUBAHGB72ZZLNHBT4RURGTW2SSSQC4DJDDILVDG4VR55FEJL` | [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCBZLHEHRUBAHGB72ZZLNHBT4RURGTW2SSSQC4DJDDILVDG4VR55FEJL) |
| **`X402Escrow`** | `CDJS3VHPBXVSFIPA6FUBVS3YXKUGZ75GQ7TQFVPMHBX3KHMREGGNMLFE` | [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDJS3VHPBXVSFIPA6FUBVS3YXKUGZ75GQ7TQFVPMHBX3KHMREGGNMLFE) |

---

## 6. Verification

Run the web dashboard:

```bash
pnpm dev
```

Navigate to `http://localhost:3000` and click **Connect Freighter**. Verify that your wallet connects, displays your testnet public key, and shows your testnet balance.
