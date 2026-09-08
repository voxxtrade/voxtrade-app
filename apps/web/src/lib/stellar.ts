export const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';
export const SOROBAN_RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
export const NETWORK_PASSPHRASE = STELLAR_NETWORK === 'testnet' 
  ? 'Test SDF Network ; September 2015' 
  : 'Public Global Stellar Network ; September 2015';
