import { SorobanRpc, xdr, Address } from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

export class X402Escrow {
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
    const signedTxXdr = await signTransaction(assembledTx.toXDR(), { networkPassphrase: this.networkPassphrase });
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

  async claim(caller: string, escrowId: number, preimage: Buffer) {
    const args = [
      xdr.ScVal.scvU64(new xdr.Uint64Parts({ hi: 0, lo: escrowId })),
      xdr.ScVal.scvBytes(preimage)
    ];
    return this.prepareAndSubmit('claim', args, caller);
  }

  async refund(caller: string, escrowId: number) {
    const args = [
      xdr.ScVal.scvU64(new xdr.Uint64Parts({ hi: 0, lo: escrowId }))
    ];
    return this.prepareAndSubmit('refund', args, caller);
  }
}
