# Contributing to VoxTrade

Thank you for your interest in contributing to **VoxTrade**! We welcome community contributions, bug reports, and feature proposals to make voice commerce on Stellar more accessible and secure.

---

## Code of Conduct

All contributors are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all community members with respect and professionalism.

---

## How to Contribute

### 1. Reporting Bugs
If you find a bug:
- Check existing [GitHub Issues](https://github.com/voxxtrade/voxtrade-app/issues) to ensure it hasn't already been reported.
- If not, open a new issue using our **Bug Report** template.
- Include clear reproduction steps, expected vs. actual behavior, and environment details (Node version, browser, Freighter wallet version).

### 2. Suggesting Features
- Open an issue using our **Feature Request** template.
- Clearly describe the problem you are solving, the proposed solution, and any alternative approaches considered.

### 3. Working on an Issue
- Browse [Open Issues](https://github.com/voxxtrade/voxtrade-app/issues) with the `good first issue` or `help wanted` labels.
- Comment on the issue stating your interest before you begin coding to coordinate with maintainers and prevent redundant efforts.

---

## Local Development Setup

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (`v20+` or `v22` recommended)
- **Package Manager**: `pnpm` (`npm install -g pnpm`)
- **Wallet**: [Freighter](https://www.freighter.app/) browser extension configured to **Stellar Testnet**
- **Testnet Guide**: See our [Stellar Testnet Setup Guide](docs/testnet-setup.md) for funding your account and setting up trustlines.

### 2. Fork & Clone
```bash
git clone https://github.com/<your-username>/voxtrade-app.git
cd voxtrade-app
pnpm install
```

### 3. Environment Configuration
Copy the environment variables file into the web app:
```bash
cd apps/web
cp .env.example .env.local
```

Ensure your testnet RPC and network settings are configured:
```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_STELLAR_PASSPHRASE="Test SDF Network ; September 2015"
```

### 4. Create a Working Branch
Use descriptive branch names:
- `feat/<short-description>` or `feat/issue-<NUMBER>-<short-description>`
- `fix/<short-description>` or `fix/issue-<NUMBER>-<short-description>`
- `docs/<short-description>`
- `refactor/<short-description>`

Example:
```bash
git checkout -b feat/issue-42-add-escrow-filter
```

---

## Pre-Flight Quality Checks

Before submitting a pull request, verify that all quality gates pass locally:

```bash
# 1. Build the TypeScript SDK
pnpm --filter @voxtrade/sdk build

# 2. Run ESLint across all workspaces
pnpm lint

# 3. Verify TypeScript types
pnpm typecheck

# 4. Run Vitest test suite
pnpm test

# 5. Verify Next.js production build
pnpm build
```

---

## Commit Guidelines

We use **Conventional Commits** for clean and readable commit history:

```text
feat(dashboard): add transaction history table (#42)
fix(sdk): handle pending status on slow RPC responses (#38)
docs: update testnet setup guide for Freighter v2 (#12)
test(sdk): add test for X402 preimage verification (#25)
```

---

## Submitting a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feat/issue-42-add-escrow-filter
   ```
2. Open a Pull Request targeting the `main` branch.
3. Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
4. Reference related issues (e.g. `Closes #42`).
5. For UI changes, attach screenshots or a screen recording to help reviewers.
