const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const StellarSdk = require(require.resolve('@stellar/stellar-sdk', { paths: [path.resolve(__dirname, '../packages/sdk')] }));

// Apply Protocol 21/22 XDR patch for SorobanAuthorizedFunctionType value 2
const xdr = StellarSdk.xdr;
const Struct = Object.getPrototypeOf(xdr.CreateContractArgs);
const ctx = { results: {} };
const CreateContractWithConstructorArgs = Struct.create(ctx, 'CreateContractWithConstructorArgs', [
  ['contractIdPreimage', xdr.ContractIdPreimage],
  ['executable', xdr.ContractExecutable],
  ['constructorArgs', xdr.ScVec],
]);

const enumVal2 = new xdr.SorobanAuthorizedFunctionType('sorobanAuthorizedFunctionTypeCreateContractWithConstructorHostFn', 2);
xdr.SorobanAuthorizedFunctionType._members['sorobanAuthorizedFunctionTypeCreateContractWithConstructorHostFn'] = enumVal2;
xdr.SorobanAuthorizedFunctionType._byValue[2] = enumVal2;
xdr.SorobanAuthorizedFunctionType.sorobanAuthorizedFunctionTypeCreateContractWithConstructorHostFn = () => enumVal2;

xdr.SorobanAuthorizedFunction._switches.set(enumVal2, 'createContractWithConstructorHostFn');
xdr.SorobanAuthorizedFunction._arms['createContractWithConstructorHostFn'] = CreateContractWithConstructorArgs;
xdr.SorobanAuthorizedFunction.prototype.createContractWithConstructorHostFn = function () {
  return this._value;
};

async function rpcCall(method, params = {}) {
  const res = await fetch('https://soroban-testnet.stellar.org', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Math.floor(Math.random() * 100000),
      method,
      params,
    }),
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(`RPC Error [${method}]: ${JSON.stringify(data.error)}`);
  }
  return data.result;
}

async function pollTx(hash) {
  for (let i = 0; i < 30; i++) {
    const res = await rpcCall('getTransaction', { hash });
    if (res && res.status === 'SUCCESS') {
      return res;
    }
    if (res && res.status === 'FAILED') {
      throw new Error(`Tx ${hash} failed on-chain: ${JSON.stringify(res)}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Tx ${hash} timed out`);
}

async function deploy() {
  console.log('=== Publishing VoxTrade Smart Contracts to Stellar Testnet ===');

  const rpcUrl = 'https://soroban-testnet.stellar.org';
  const server = new StellarSdk.rpc.Server(rpcUrl);
  const networkPassphrase = StellarSdk.Networks.TESTNET;

  const adminSecret = 'SAR3PMAG6OGDV2RZHHXICLCYIZYT4GGFNZ3D3JQAER3TR6DTQIVX2NSE';
  const adminKp = StellarSdk.Keypair.fromSecret(adminSecret);
  console.log(`Deployer Admin Key: ${adminKp.publicKey()}`);

  const treasuryWasm = fs.readFileSync('../voxtrade-contract/target/wasm32-unknown-unknown/release/agent_treasury.wasm');
  const escrowWasm = fs.readFileSync('../voxtrade-contract/target/wasm32-unknown-unknown/release/x402_escrow.wasm');

  const treasuryWasmHash = crypto.createHash('sha256').update(treasuryWasm).digest('hex');
  const escrowWasmHash = crypto.createHash('sha256').update(escrowWasm).digest('hex');

  console.log(`Treasury WASM Hash: ${treasuryWasmHash}`);
  console.log(`Escrow WASM Hash:   ${escrowWasmHash}`);

  // 1. Verify WASMs are on Testnet
  async function ensureWasmUploaded(wasmBytes, wasmHash, name) {
    console.log(`Checking if ${name} WASM is uploaded on Testnet...`);
    try {
      const codeCheck = await rpcCall('getLedgerEntries', {
        keys: [
          StellarSdk.xdr.LedgerKey.contractCode(
            new StellarSdk.xdr.LedgerKeyContractCode({
              hash: Buffer.from(wasmHash, 'hex'),
            })
          ).toXDR('base64'),
        ],
      });
      if (codeCheck && codeCheck.entries && codeCheck.entries.length > 0) {
        console.log(`-> ${name} WASM already published on-chain!`);
        return wasmHash;
      }
    } catch (e) {
      // ignore
    }

    console.log(`Uploading ${name} WASM (${wasmBytes.length} bytes)...`);
    const acc = await server.getAccount(adminKp.publicKey());
    const tx = new StellarSdk.TransactionBuilder(acc, {
      fee: '100000',
      networkPassphrase,
    })
      .addOperation(StellarSdk.Operation.uploadContractWasm({ wasm: wasmBytes }))
      .setTimeout(60)
      .build();

    const preparedTx = await server.prepareTransaction(tx);
    preparedTx.sign(adminKp);
    const sendRes = await rpcCall('sendTransaction', { transaction: preparedTx.toXDR() });
    console.log(`Sent upload tx: ${sendRes.hash}`);
    await pollTx(sendRes.hash);
    console.log(`-> ${name} WASM confirmed on ledger!`);
    return wasmHash;
  }

  await ensureWasmUploaded(treasuryWasm, treasuryWasmHash, 'AgentTreasury');
  await ensureWasmUploaded(escrowWasm, escrowWasmHash, 'X402Escrow');

  // 2. Deploy Contract Instances
  async function deployInstance(wasmHashHex, name) {
    console.log(`Instantiating contract for ${name}...`);
    const acc = await server.getAccount(adminKp.publicKey());
    const tx = new StellarSdk.TransactionBuilder(acc, {
      fee: '100000',
      networkPassphrase,
    })
      .addOperation(
        StellarSdk.Operation.createCustomContract({
          address: new StellarSdk.Address(adminKp.publicKey()),
          wasmHash: Buffer.from(wasmHashHex, 'hex'),
        })
      )
      .setTimeout(60)
      .build();

    // First simulate to extract the resulting contract ID ScVal
    const simRes = await rpcCall('simulateTransaction', { transaction: tx.toXDR() });
    let contractAddress = null;
    if (simRes.results && simRes.results[0] && simRes.results[0].xdr) {
      const scVal = StellarSdk.xdr.ScVal.fromXDR(simRes.results[0].xdr, 'base64');
      contractAddress = StellarSdk.Address.fromScVal(scVal).toString();
      console.log(`Predicted contract address from simulation: ${contractAddress}`);
    }

    const preparedTx = await server.prepareTransaction(tx);
    preparedTx.sign(adminKp);
    const sendRes = await rpcCall('sendTransaction', { transaction: preparedTx.toXDR() });
    console.log(`Sent deploy tx: ${sendRes.hash}`);
    const receipt = await pollTx(sendRes.hash);

    console.log(`-> ${name} INSTANTIATED on ledger ${receipt.ledger}! Address: ${contractAddress}`);
    return contractAddress;
  }

  const treasuryContractId = await deployInstance(treasuryWasmHash, 'AgentTreasury');
  const escrowContractId = await deployInstance(escrowWasmHash, 'X402Escrow');

  console.log('\n================================================================');
  console.log('           VOXTRADE CONTRACTS PUBLISHED ON TESTNET              ');
  console.log('================================================================');
  console.log(`Agent Treasury Contract: ${treasuryContractId}`);
  console.log(`x402 Escrow Contract:    ${escrowContractId}`);
  console.log(`Treasury WASM Hash:      ${treasuryWasmHash}`);
  console.log(`Escrow WASM Hash:        ${escrowWasmHash}`);
  console.log(`Admin Signer Address:    ${adminKp.publicKey()}`);
  console.log('================================================================\n');

  const envContent = `# VoxTrade Live Stellar Testnet Contracts\nNEXT_PUBLIC_STELLAR_NETWORK=testnet\nNEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org\nNEXT_PUBLIC_TREASURY_WASM_HASH=${treasuryWasmHash}\nNEXT_PUBLIC_TREASURY_CONTRACT_ID=${treasuryContractId}\nNEXT_PUBLIC_ESCROW_CONTRACT_ID=${escrowContractId}\nNEXT_PUBLIC_ESCROW_WASM_HASH=${escrowWasmHash}\n`;

  fs.writeFileSync('./apps/web/.env.local', envContent);
  fs.writeFileSync('../voxtrade-contract/.env', envContent);
  console.log('Synced contract addresses to apps/web/.env.local and voxtrade-contract/.env');
}

deploy().catch(console.error);
