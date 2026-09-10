export interface TreasuryConfig {
  admin: string;
  agentKey: string;
  dailyLimit: bigint;
}

export interface DailySpend {
  day: number;
  amountSpent: bigint;
}

export interface EscrowRecord {
  id: bigint;
  buyer: string;
  seller: string;
  token: string;
  amount: bigint;
  hashLock: string;
  timeoutLedger: number;
  resolved: boolean;
}

export interface X402Challenge {
  contractId: string;
  token: string;
  amount: bigint;
  hashLock: string;
  timeoutLedgers: number;
}

export interface TransactionResult {
  hash: string;
  status: 'SUCCESS' | 'FAILED' | 'SIMULATED';
  details?: Record<string, any>;
}
