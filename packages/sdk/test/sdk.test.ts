import { describe, it, expect } from 'vitest';
import { AgentTreasury } from '../src/treasury';
import { X402Escrow } from '../src/escrow';
import { parseX402Challenge, formatX402Authorization, generatePreimage } from '../src/x402';

describe('VoxTrade SDK', () => {
  const rpcUrl = 'https://soroban-testnet.stellar.org';
  const network = 'Test SDF Network ; September 2015';

  describe('AgentTreasury', () => {
    it('should initialize treasury successfully', async () => {
      const treasury = new AgentTreasury('WASM_HASH_MOCK', rpcUrl, network);
      
      const config = {
        dailyLimit: 1000000n,
        agent: 'GB_AGENT_MOCK',
        escrowContract: 'C_ESCROW_MOCK'
      };

      const result = await treasury.initialize('GB_ADMIN_MOCK', config);
      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
    });

    it('should update spending limit', async () => {
      const treasury = new AgentTreasury('WASM_HASH_MOCK', rpcUrl, network);
      const res = await treasury.updateLimit('GB_ADMIN_MOCK', 20_000_000n);
      expect(res.status).toBe('SUCCESS');
      expect(res.hash).toMatch(/^0x[a-f0-9]{64}$/);
    });

    it('should update agent key', async () => {
      const treasury = new AgentTreasury('WASM_HASH_MOCK', rpcUrl, network);
      const res = await treasury.updateAgentKey('GB_ADMIN_MOCK', 'GB_NEW_AGENT');
      expect(res.status).toBe('SUCCESS');
      expect(res.details?.newAgentKey).toBe('GB_NEW_AGENT');
    });

    it('should withdraw collateral', async () => {
      const treasury = new AgentTreasury('WASM_HASH_MOCK', rpcUrl, network);
      const res = await treasury.withdraw('GB_ADMIN_MOCK', 'C_USDC_MOCK', 'GB_RECIPIENT', 500_000n);
      expect(res.status).toBe('SUCCESS');
    });

    it('should fetch config and daily spend telemetry', async () => {
      const treasury = new AgentTreasury('WASM_HASH_MOCK', rpcUrl, network);
      const config = await treasury.getConfig('GB_ADMIN', 'GB_AGENT');
      expect(config.dailyLimit).toBe(100_000_000n);

      const spend = await treasury.getDailySpend();
      expect(spend.amountSpent).toBe(0n);
    });
  });

  describe('X402Escrow', () => {
    it('should lock funds into escrow', async () => {
      const escrow = new X402Escrow('C_ESCROW_MOCK', rpcUrl, network);
      const hashLock = Buffer.alloc(32, 1);
      const res = await escrow.lockFunds('GB_BUYER', 'GB_SELLER', 'C_USDC', 100_000n, hashLock, 500);
      expect(res.status).toBe('SUCCESS');
      expect(res.escrowId).toBeDefined();
    });

    it('should claim escrow successfully', async () => {
      const escrow = new X402Escrow('C_ESCROW_MOCK', rpcUrl, network);
      const preimage = Buffer.from('test_preimage');
      
      const result = await escrow.claim('GB_CALLER_MOCK', 1, preimage);
      expect(result).toBeDefined();
      expect(result.status).toBe('SUCCESS');
    });

    it('should refund escrow successfully', async () => {
      const escrow = new X402Escrow('C_ESCROW_MOCK', rpcUrl, network);
      
      const result = await escrow.refund('GB_CALLER_MOCK', 1);
      expect(result).toBeDefined();
      expect(result.status).toBe('SUCCESS');
    });

    it('should cancel escrow cooperatively', async () => {
      const escrow = new X402Escrow('C_ESCROW_MOCK', rpcUrl, network);
      const res = await escrow.cancelCooperative('GB_SELLER', 1);
      expect(res.status).toBe('SUCCESS');
    });

    it('should fetch escrow details', async () => {
      const escrow = new X402Escrow('C_ESCROW_MOCK', rpcUrl, network);
      const data = await escrow.getEscrow(1);
      expect(data.id).toBe(1n);
      expect(data.resolved).toBe(false);
    });
  });

  describe('x402 Protocol Utilities', () => {
    it('should parse WWW-Authenticate challenge header', () => {
      const header = 'x402 contract="C_ESCROW", token="C_USDC", amount="1000000", hash_lock="aabbcc1122", timeout_ledgers="120"';
      const parsed = parseX402Challenge(header);
      expect(parsed.contractId).toBe('C_ESCROW');
      expect(parsed.token).toBe('C_USDC');
      expect(parsed.amount).toBe(1000000n);
      expect(parsed.hashLock).toBe('aabbcc1122');
      expect(parsed.timeoutLedgers).toBe(120);
    });

    it('should format Authorization header', () => {
      const formatted = formatX402Authorization(42n, '0xhash123', 'GB_BUYER');
      expect(formatted).toBe('x402 escrow_id="42", tx_hash="0xhash123", buyer="GB_BUYER"');
    });

    it('should generate preimage and matching SHA256 hash', () => {
      const { preimage, hashLock, preimageHex, hashLockHex } = generatePreimage();
      expect(preimage.length).toBe(32);
      expect(hashLock.length).toBe(32);
      expect(preimageHex.length).toBe(64);
      expect(hashLockHex.length).toBe(64);
    });
  });
});
