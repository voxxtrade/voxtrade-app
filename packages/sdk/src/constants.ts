/**
 * VoxTrade Stellar Smart Contract IDs and Network Configuration
 */

// Escrow Contract IDs
export const TESTNET_ESCROW_ID = 'CDJS3VHPBXVSFIPA6FUBVS3YXKUGZ75GQ7TQFVPMHBX3KHMREGGNMLFE';
export const MAINNET_ESCROW_ID = ''; // Reserved for Stellar Mainnet deployment

// Agent Treasury Contract IDs
export const TESTNET_TREASURY_ID = 'CCBZLHEHRUBAHGB72ZZLNHBT4RURGTW2SSSQC4DJDDILVDG4VR55FEJL';
export const MAINNET_TREASURY_ID = ''; // Reserved for Stellar Mainnet deployment

// WASM Hashes
export const TESTNET_TREASURY_WASM_HASH = 'b9a38f712c4d9e018274ac4839201f84b9c1d0ef93847291a0c8b74619372ef4';

// Asset Contracts
export const TESTNET_USDC_CONTRACT_ID = 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75';
export const MAINNET_USDC_CONTRACT_ID = 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75';

// Network Passphrases
export const NETWORK_PASSPHRASES = {
  TESTNET: 'Test SDF Network ; September 2015',
  MAINNET: 'Public Global Stellar Network ; July 2015',
  FUTURENET: 'Test SDF Future Network ; October 2022',
  STANDALONE: 'Standalone Network ; February 2017',
} as const;

// Default Soroban RPC Endpoints
export const SOROBAN_RPC_URLS = {
  TESTNET: 'https://soroban-testnet.stellar.org',
  MAINNET: 'https://mainnet.stellar.org:443',
  FUTURENET: 'https://rpc-futurenet.stellar.org',
  STANDALONE: 'http://localhost:8000/soroban/rpc',
} as const;

// Network Presets
export const STELLAR_NETWORKS = {
  testnet: {
    networkPassphrase: NETWORK_PASSPHRASES.TESTNET,
    rpcUrl: SOROBAN_RPC_URLS.TESTNET,
    escrowContractId: TESTNET_ESCROW_ID,
    treasuryContractId: TESTNET_TREASURY_ID,
    usdcContractId: TESTNET_USDC_CONTRACT_ID,
    treasuryWasmHash: TESTNET_TREASURY_WASM_HASH,
  },
  mainnet: {
    networkPassphrase: NETWORK_PASSPHRASES.MAINNET,
    rpcUrl: SOROBAN_RPC_URLS.MAINNET,
    escrowContractId: MAINNET_ESCROW_ID,
    treasuryContractId: MAINNET_TREASURY_ID,
    usdcContractId: MAINNET_USDC_CONTRACT_ID,
    treasuryWasmHash: '',
  },
} as const;

export type StellarNetworkName = keyof typeof STELLAR_NETWORKS;
