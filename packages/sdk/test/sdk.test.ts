import { describe, it, expect } from 'vitest';
import { AgentTreasury } from '../src/treasury';
import { X402Escrow } from '../src/escrow';

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
      expect(result.hash).toBe('MOCK_HASH');
    });
  });

  describe('X402Escrow', () => {
    it('should claim escrow successfully', async () => {
      const escrow = new X402Escrow('C_ESCROW_MOCK', rpcUrl, network);
      const preimage = Buffer.from('test_preimage');
      
      const result = await escrow.claim('GB_CALLER_MOCK', 1, preimage);
      expect(result).toBeDefined();
      expect(result.hash).toBe('MOCK_HASH');
    });

    it('should refund escrow successfully', async () => {
      const escrow = new X402Escrow('C_ESCROW_MOCK', rpcUrl, network);
      
      const result = await escrow.refund('GB_CALLER_MOCK', 1);
      expect(result).toBeDefined();
      expect(result.hash).toBe('MOCK_HASH');
    });
  });
});
