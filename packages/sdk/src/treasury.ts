import { SorobanRpc, xdr, Address } from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

export interface TreasuryConfig {
  dailyLimit: bigint;
  agent: string;
  escrowContract: string;
}

export class AgentTreasury {
  constructor(
    public readonly contractId: string,
    public readonly rpcUrl: string,
    public readonly networkPassphrase: string
  ) {}

  private async prepareAndSubmit(
    method: string,
    args: xdr.ScVal[],
    submitter: string
  ): Promise<any> {
    const server = new SorobanRpc.Server(this.rpcUrl);
    const sourceAccount = await server.getAccount(submitter);

    const txBuilder = new SorobanRpc.TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: this.networkPassphrase,
    });

    const op = SorobanRpc.Operation.invokeHostFunction({
      func: new xdr.HostFunction.hostFunctionTypeInvokeContract([
        xdr.ScVal.scvAddress(Address.fromString(this.contractId).toScAddress()),
        xdr.ScVal.scvSymbol(method),
        ...args,
      ]),
      auth: [],
    });

    txBuilder.addOperation(op);
    const tx = txBuilder.setTimeout(30).build();

    const simulated = await server.simulateTransaction(tx);
    if (!SorobanRpc.Api.isSimulationSuccess(simulated)) {
      throw new Error('Simulation failed: ' + JSON.stringify(simulated));
    }

    const assembledTx = SorobanRpc.assembleTransaction(tx, simulated);
    
    // Sign using Freighter
    const signedTxXdr = await signTransaction(assembledTx.toXDR(), { networkPassphrase: this.networkPassphrase });
    
    // Reconstruct transaction
    const signedTx = SorobanRpc.TransactionBuilder.fromXDR(signedTxXdr, this.networkPassphrase);
    
    const sendResult = await server.sendTransaction(signedTx);
    if (sendResult.errorResultXdr) {
      throw new Error('Transaction submission failed: ' + sendResult.errorResultXdr);
    }

    return await this.pollTransaction(server, sendResult.hash);
  }

  private async pollTransaction(server: SorobanRpc.Server, hash: string) {
    let retries = 0;
    while (retries < 15) {
      const status = await server.getTransaction(hash);
      if (status.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
        return status;
      }
      if (status.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
        throw new Error('Transaction failed on-chain');
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      retries++;
    }
    throw new Error('Transaction confirmation timeout');
  }

  async initialize(admin: string, config: TreasuryConfig) {
    const args = [
      xdr.ScVal.scvAddress(Address.fromString(admin).toScAddress()),
      xdr.ScVal.scvVec([
        xdr.ScVal.scvI128(new xdr.Int128Parts({ hi: 0, lo: Number(config.dailyLimit) })),
        xdr.ScVal.scvAddress(Address.fromString(config.agent).toScAddress()),
        xdr.ScVal.scvAddress(Address.fromString(config.escrowContract).toScAddress())
      ])
    ];
    return this.prepareAndSubmit('initialize', args, admin);
  }

  async executeX402Lock(
    caller: string,
    agent: string,
    token: string,
    escrow: string,
    seller: string,
    amount: bigint,
    hashLock: Buffer,
    timeoutLedger: number
  ) {
    const args = [
      xdr.ScVal.scvAddress(Address.fromString(agent).toScAddress()),
      xdr.ScVal.scvAddress(Address.fromString(token).toScAddress()),
      xdr.ScVal.scvAddress(Address.fromString(escrow).toScAddress()),
      xdr.ScVal.scvAddress(Address.fromString(seller).toScAddress()),
      xdr.ScVal.scvI128(new xdr.Int128Parts({ hi: 0, lo: Number(amount) })),
      xdr.ScVal.scvBytes(hashLock),
      xdr.ScVal.scvU32(timeoutLedger)
    ];
    return this.prepareAndSubmit('execute_x402_lock', args, caller);
  }
}
