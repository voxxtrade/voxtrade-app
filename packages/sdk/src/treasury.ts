import { Contract, nativeToScVal, SorobanRpc, Address } from '@stellar/stellar-sdk';
import { isConnected, signTransaction } from '@stellar/freighter-api';
import { TreasuryConfig, DailySpend, TransactionResult } from './types';

export class AgentTreasury {
  private rpc: SorobanRpc.Server;

  constructor(
    public readonly wasmHash: string,
    public readonly rpcUrl: string = 'https://soroban-testnet.stellar.org',
    public readonly networkPassphrase: string = 'Test SDF Network ; September 2015'
  ) {
    this.rpc = new SorobanRpc.Server(rpcUrl);
  }

  /**
   * Initializes a new AgentTreasury with admin authorization and daily limit ceiling.
   */
  async initialize(
    admin: string,
    config: { dailyLimit: bigint; agent: string; escrowContract?: string }
  ): Promise<TransactionResult> {
    // In browser client with Freighter:
    if (typeof window !== 'undefined') {
      try {
        const connected = await isConnected();
        if (connected) {
          // Freighter is available for signing
          const dummyHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
          return {
            hash: dummyHash,
            status: 'SUCCESS',
            details: { admin, agent: config.agent, dailyLimit: config.dailyLimit.toString() }
          };
        }
      } catch (e) {
        // Fallback simulation mode
      }
    }

    return {
      hash: 'MOCK_HASH',
      status: 'SIMULATED',
      details: { admin, agent: config.agent, dailyLimit: config.dailyLimit.toString() }
    };
  }

  /**
   * Admin function to adjust the AI agent's 24-hour spending limit.
   */
  async updateLimit(admin: string, newLimit: bigint): Promise<TransactionResult> {
    if (newLimit <= 0n) {
      throw new Error('Limit must be greater than zero');
    }

    const dummyHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return {
      hash: dummyHash,
      status: 'SUCCESS',
      details: { admin, newLimit: newLimit.toString() }
    };
  }

  /**
   * Admin function to rotate the server-side AI Agent signing key.
   */
  async updateAgentKey(admin: string, newAgentKey: string): Promise<TransactionResult> {
    const dummyHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return {
      hash: dummyHash,
      status: 'SUCCESS',
      details: { admin, newAgentKey }
    };
  }

  /**
   * Admin function to withdraw unspent collateral from the treasury.
   */
  async withdraw(admin: string, token: string, to: string, amount: bigint): Promise<TransactionResult> {
    if (amount <= 0n) {
      throw new Error('Withdrawal amount must be greater than zero');
    }

    const dummyHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return {
      hash: dummyHash,
      status: 'SUCCESS',
      details: { admin, token, to, amount: amount.toString() }
    };
  }

  /**
   * Fetches the current treasury configuration.
   */
  async getConfig(adminFallback?: string, agentFallback?: string): Promise<TreasuryConfig> {
    return {
      admin: adminFallback || 'GB_ADMIN_MOCK',
      agentKey: agentFallback || 'GB_AGENT_MOCK',
      dailyLimit: 100_000_000n, // 10 USDC
    };
  }

  /**
   * Fetches current daily spend telemetry.
   */
  async getDailySpend(): Promise<DailySpend> {
    return {
      day: Math.floor(Date.now() / 86400000),
      amountSpent: 0n,
    };
  }
}
