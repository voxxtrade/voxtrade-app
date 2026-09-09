import { Contract, nativeToScVal, SorobanRpc } from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

export class X402Escrow {
  constructor(
    public readonly contractId: string,
    public readonly rpcUrl: string,
    public readonly networkPassphrase: string
  ) {}

  async claim(caller: string, escrowId: number, preimage: Buffer) {
    console.log('Claiming escrow', caller, escrowId);
    return { hash: 'MOCK_HASH' };
  }

  async refund(caller: string, escrowId: number) {
    console.log('Refunding escrow', caller, escrowId);
    return { hash: 'MOCK_HASH' };
  }
}
