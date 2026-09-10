import crypto from 'crypto';
import { X402Challenge } from './types';

/**
 * Parses a standard WWW-Authenticate: x402 challenge string.
 * Example format:
 * x402 contract="CDLZ...", token="CUSDC...", amount="1000000", hash_lock="3b9a...", timeout_ledgers="120"
 */
export function parseX402Challenge(authHeader: string): X402Challenge {
  if (!authHeader || !authHeader.startsWith('x402')) {
    throw new Error('Invalid x402 challenge header format');
  }

  const parseParam = (key: string): string => {
    const match = authHeader.match(new RegExp(`${key}="([^"]+)"`));
    if (!match || !match[1]) {
      throw new Error(`Missing required parameter in x402 challenge: ${key}`);
    }
    return match[1];
  };

  return {
    contractId: parseParam('contract'),
    token: parseParam('token'),
    amount: BigInt(parseParam('amount')),
    hashLock: parseParam('hash_lock'),
    timeoutLedgers: parseInt(parseParam('timeout_ledgers'), 10),
  };
}

/**
 * Formats an Authorization: x402 header string with on-chain payment proof.
 */
export function formatX402Authorization(escrowId: bigint | number, txHash: string, buyer: string): string {
  return `x402 escrow_id="${escrowId.toString()}", tx_hash="${txHash}", buyer="${buyer}"`;
}

/**
 * Generates a secure random 32-byte preimage and its SHA-256 hash lock.
 */
export function generatePreimage(): { preimage: Buffer; hashLock: Buffer; preimageHex: string; hashLockHex: string } {
  const preimage = crypto.randomBytes(32);
  const hashLock = crypto.createHash('sha256').update(preimage).digest();
  return {
    preimage,
    hashLock,
    preimageHex: preimage.toString('hex'),
    hashLockHex: hashLock.toString('hex'),
  };
}
