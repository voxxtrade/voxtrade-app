import { Contract, nativeToScVal, SorobanRpc, Address } from '@stellar/stellar-sdk';
import { isConnected, signTransaction } from '@stellar/freighter-api';
import { TreasuryConfig, DailySpend, TransactionResult } from './types';

/**
 * Mock client for treasury configuration, withdrawals, and daily spending data.
 *
 * Methods produce synthetic results without signing or submitting transactions.
 * They do not check admin authority, enforce balances, or persist changes; getters
 * return placeholders independently of earlier calls. USDC amounts use seven
 * decimal places: `10_000_000n` base units equal 1 USDC.
 *
 * @example
 * ```ts
 * import { AgentTreasury } from '@voxtrade/sdk';
 *
 * const treasury = new AgentTreasury('mock-wasm-hash');
 * const result = await treasury.initialize('mock-admin', {
 *   dailyLimit: 100_000_000n, // 10 USDC
 *   agent: 'mock-agent',
 * });
 * // Mock labels are sufficient here; no funds or keys are used.
 * console.log(result.status);
 * ```
 */
export class AgentTreasury {
  private rpc: SorobanRpc.Server;

  /**
   * Creates a client with a Soroban RPC server; defaults to Stellar Testnet.
   *
   * @param wasmHash - WASM hash stored for callers; currently unused by methods.
   * @param rpcUrl - RPC endpoint URL. HTTPS is required by the server's default configuration.
   * @param networkPassphrase - Stellar network passphrase, stored for callers.
   * @throws If the RPC server rejects the URL, including HTTP with its default settings.
   */
  constructor(
    /** WASM hash supplied at construction; currently stored only. */
    public readonly wasmHash: string,
    /** RPC endpoint used to construct the server; defaults to Stellar Testnet. */
    public readonly rpcUrl: string = 'https://soroban-testnet.stellar.org',
    /** Network passphrase supplied at construction; currently stored only. */
    public readonly networkPassphrase: string = 'Test SDF Network ; September 2015'
  ) {
    this.rpc = new SorobanRpc.Server(rpcUrl);
  }

  /**
   * Produces a mock initialization result for an admin and agent.
   *
   * In a browser, a truthy Freighter connection response produces `SUCCESS` with
   * a random hash. Otherwise, including a connection-check error, the result is
   * `SIMULATED` with `MOCK_HASH`. Neither path requests a signature.
   *
   * @param admin - Admin address copied into the result, without validation.
   * @param config - Initial settings: `dailyLimit` is a bigint in USDC base units
   * (seven decimals; `10_000_000n` = 1 USDC), `agent` is the agent address, and
   * optional `escrowContract` is currently unused. No positive-limit check is made.
   * @returns A synthetic transaction result containing admin, agent, and the
   * decimal-string daily limit; it does not initialize on-chain state.
   * @throws No explicit errors for valid typed inputs; Freighter check errors fall back to simulation.
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
   * Produces a mock result for changing the agent's daily spending limit.
   *
   * @param admin - Admin address copied into the result, without an authority check.
   * @param newLimit - Positive bigint in USDC base units (seven decimals;
   * `10_000_000n` = 1 USDC).
   * @returns `SUCCESS` with a random hash, the admin, and the decimal-string limit.
   * The value returned by {@link AgentTreasury.getConfig | getConfig} is unchanged.
   * @throws Rejects with `Error('Limit must be greater than zero')` when `newLimit <= 0n`.
   *
   * @example
   * ```ts
   * const treasury = new AgentTreasury('mock-wasm-hash');
   * const result = await treasury.updateLimit('mock-admin', 50_000_000n); // 5 USDC
   * ```
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
   * Produces a mock result for replacing the agent's public key.
   *
   * @param admin - Admin address copied into the result, without an authority check.
   * @param newAgentKey - Replacement public key copied without validation; no secret key is needed.
   * @returns `SUCCESS` with a random hash, the admin, and the supplied key.
   * No signing key or configuration is changed.
   * @throws No explicit errors for valid typed inputs.
   *
   * @example
   * ```ts
   * const treasury = new AgentTreasury('mock-wasm-hash');
   * const result = await treasury.updateAgentKey('mock-admin', 'mock-agent-2');
   * ```
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
   * Produces a mock withdrawal result without transferring tokens.
   *
   * @param admin - Admin address copied into the result, without an authority check.
   * @param token - Token contract address copied into the result, without validation.
   * @param to - Recipient address copied into the result, without validation.
   * @param amount - Positive bigint in the token's base units. For USDC, use seven
   * decimals (`10_000_000n` = 1 USDC). Available balances are not checked.
   * @returns `SUCCESS` with a random hash, the supplied addresses, and the
   * decimal-string amount.
   * @throws Rejects with `Error('Withdrawal amount must be greater than zero')`
   * when `amount <= 0n`.
   *
   * @example
   * ```ts
   * const treasury = new AgentTreasury('mock-wasm-hash');
   * const result = await treasury.withdraw(
   *   'mock-admin', 'mock-usdc-contract', 'mock-recipient', 10_000_000n,
   * ); // Simulates withdrawing 1 USDC; no funds move.
   * ```
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
   * Returns placeholder configuration without querying the RPC server.
   *
   * @param adminFallback - Admin value to return; omitted or empty values use `GB_ADMIN_MOCK`.
   * @param agentFallback - Agent key to return; omitted or empty values use `GB_AGENT_MOCK`.
   * @returns The fallback addresses and a fixed `dailyLimit` of `100_000_000n`
   * USDC base units (10 USDC), regardless of prior initialization or updates.
   * @throws No explicit errors for valid typed inputs.
   *
   * @example
   * ```ts
   * const treasury = new AgentTreasury('mock-wasm-hash');
   * const config = await treasury.getConfig('mock-admin', 'mock-agent');
   * console.log(config.dailyLimit); // 100_000_000n
   * ```
   */
  async getConfig(adminFallback?: string, agentFallback?: string): Promise<TreasuryConfig> {
    return {
      admin: adminFallback || 'GB_ADMIN_MOCK',
      agentKey: agentFallback || 'GB_AGENT_MOCK',
      dailyLimit: 100_000_000n, // 10 USDC
    };
  }

  /**
   * Returns placeholder spending data for the current UTC day.
   *
   * @returns The day number (`Math.floor(Date.now() / 86400000)`, days since the
   * Unix epoch) and a fixed `amountSpent` of `0n` USDC base units. No on-chain
   * spending data is fetched.
   * @throws No explicit errors for valid typed inputs.
   *
   * @example
   * ```ts
   * const treasury = new AgentTreasury('mock-wasm-hash');
   * const spend = await treasury.getDailySpend();
   * console.log(spend.amountSpent); // 0n
   * ```
   */
  async getDailySpend(): Promise<DailySpend> {
    return {
      day: Math.floor(Date.now() / 86400000),
      amountSpent: 0n,
    };
  }
}
