import {
  getAllTokens,
  getRegistryState,
  createInstructionInitializeRegistry,
  createInstructionUpdateFees,
  createInstructionCreateEntry,
  createInstructionDeleteEntry,
  createInstructionUpdateEntry,
  createInstructionTransferFeeAuthority,
  createInstructionTransferTokenAuthority,
} from '../index';

import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  SendTransactionError,
} from '@solana/web3.js';

import { readFileSync } from 'fs';
const { execSync } = require("child_process");

const TEST_TIMEOUT = 100000;
const CONFIG_FILE = "/Users/chris/.config/solana/id.json"
let userPrivateKeyString = readFileSync(CONFIG_FILE).toString();
let userKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(userPrivateKeyString)));

const USDT_PUBLICKEY = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const ARBITRARY_TOKEN_ACCOUNT  = new PublicKey("7STJWT74tAZzhbNNPRH8WuGDy9GZg27968EwALWuezrH");
const ARBITRARY_USER_ACCOUNT = new PublicKey("DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEAD");
const ARBITRARY_BIGINT = BigInt(123456789);

let connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Hack to prevent API calls from displaying error messages.
console.error = () => {};


async function sendAndConfirmTx(instruction: TransactionInstruction) : Promise<string> {
  let tx = new Transaction({
      feePayer: userKeypair.publicKey,
      recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
  });
  tx.add(instruction);
  let signature = await connection.sendTransaction(
    tx,
    [userKeypair],
  );
  await connection.confirmTransaction(signature);
  return signature;
}

function deployProgram() {
  execSync("cd ../program && npm run build && npm run deploy");
}

describe("InitializeRegistry", () => {

  beforeEach(deployProgram);

  it("All Transactions Fail before InitializeRegistry", async () => {
  
    expect.assertions(6);
  
    // RegistryInstruction::UpdateFees
    try {
      await sendAndConfirmTx(await createInstructionUpdateFees(
        connection,
        userKeypair.publicKey,
        USDT_PUBLICKEY,
        ARBITRARY_USER_ACCOUNT,
        ARBITRARY_BIGINT,
      ));
    } catch (error) {
      let txLogs = ((error as SendTransactionError).logs as string[]).join(" ");
      expect(txLogs).toMatch(/RegistryError::NotYetInitialized/);
    }
  
    // RegistryInstruction::CreateEntry
    try {
      await sendAndConfirmTx(await createInstructionCreateEntry(
        connection,
        userKeypair.publicKey,
        ARBITRARY_TOKEN_ACCOUNT,
        "wSUSHI",
        "SushiSwap (Wormhole)",
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HbMGwfGjGPchtaPwyrtJFy8APZN5w1hi63xnzmj1f23v/logo.png",
        ["wrapped", "wormhole"],
        [
          ["address", "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2"],
          ["bridgeContract", "https://etherscan.io/address/0xf92cD566Ea4864356C5491c177A430C222d7e678"],
        ],
      ));
    } catch (error) {
      let txLogs = ((error as SendTransactionError).logs as string[]).join(" ");
      expect(txLogs).toMatch(/RegistryError::NotYetInitialized/);
    }
  
    // RegistryInstruction::DeleteEntry
    try {
      await sendAndConfirmTx(await createInstructionDeleteEntry(
        connection,
        userKeypair.publicKey,
        ARBITRARY_TOKEN_ACCOUNT,
      ));
    } catch (error) {
      let txLogs = ((error as SendTransactionError).logs as string[]).join(" ");
      expect(txLogs).toMatch(/RegistryError::NotYetInitialized/);
    }
  
    // RegistryInstruction::UpdateEntry
    try {
      await sendAndConfirmTx(await createInstructionUpdateEntry(
        connection,
        userKeypair.publicKey,
        ARBITRARY_TOKEN_ACCOUNT,
        "wSUSHI",
        "SushiSwap (Wormhole)",
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HbMGwfGjGPchtaPwyrtJFy8APZN5w1hi63xnzmj1f23v/logo.png",
        ["wrapped", "wormhole"],
        [
          ["address", "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2"],
          ["bridgeContract", "https://etherscan.io/address/0xf92cD566Ea4864356C5491c177A430C222d7e678"],
        ],
      ));
    } catch (error) {
      let txLogs = ((error as SendTransactionError).logs as string[]).join(" ");
      expect(txLogs).toMatch(/RegistryError::NotYetInitialized/);
    }
  
    // RegistryInstruction::TransferFeeAuthority
    try {
      await sendAndConfirmTx(await createInstructionTransferFeeAuthority(
        connection,
        userKeypair.publicKey,
        ARBITRARY_USER_ACCOUNT,
      ));
    } catch (error) {
      let txLogs = ((error as SendTransactionError).logs as string[]).join(" ");
      expect(txLogs).toMatch(/RegistryError::NotYetInitialized/);
    }
  
    // RegistryInstruction::TransferTokenAuthority
    try {
      await sendAndConfirmTx(await createInstructionTransferTokenAuthority(
        connection,
        userKeypair.publicKey,
        ARBITRARY_USER_ACCOUNT,
      ));
    } catch (error) {
      let txLogs = ((error as SendTransactionError).logs as string[]).join(" ");
      expect(txLogs).toMatch(/RegistryError::NotYetInitialized/);
    }
  
  }, TEST_TIMEOUT);

  it("Read-over-Write for InitializeRegistry", async () => {

    let sig = await sendAndConfirmTx(await createInstructionInitializeRegistry(
      connection,
      userKeypair.publicKey,
      USDT_PUBLICKEY,
      ARBITRARY_USER_ACCOUNT,
      ARBITRARY_BIGINT,
    ));

    let registryState = await getRegistryState(connection);
    expect(registryState).not.toBeNull();
    let [registryMetaAccount, _registryNodeAccounts] = registryState!;

    expect(registryMetaAccount.feeAmount).toEqual(ARBITRARY_BIGINT);
    expect(registryMetaAccount.feeMint).toEqual(USDT_PUBLICKEY);
    expect(registryMetaAccount.feeDestination).toEqual(ARBITRARY_USER_ACCOUNT);
    expect(registryMetaAccount.feeUpdateAuthority).toEqual(userKeypair.publicKey);

  }, TEST_TIMEOUT);

  it("Cannot InitializeRegistry twice", async () => {
    expect.assertions(1);
    await sendAndConfirmTx(await createInstructionInitializeRegistry(
      connection,
      userKeypair.publicKey,
      USDT_PUBLICKEY,
      ARBITRARY_USER_ACCOUNT,
      ARBITRARY_BIGINT,
    ));
    try {
      await sendAndConfirmTx(await createInstructionInitializeRegistry(
        connection,
        userKeypair.publicKey,
        USDT_PUBLICKEY,
        ARBITRARY_USER_ACCOUNT,
        ARBITRARY_BIGINT,
      ));
    } catch (error) {
      let txLogs = ((error as SendTransactionError).logs as string[]).join(" ");
      expect(txLogs).toMatch(/RegistryError::AlreadyInitialized/);
    }
  }, TEST_TIMEOUT);

  it("InitializeRegistry does not create any tokens", async () => {
    expect(await getAllTokens(connection)).toEqual([]);
    await sendAndConfirmTx(await createInstructionInitializeRegistry(
      connection,
      userKeypair.publicKey,
      USDT_PUBLICKEY,
      ARBITRARY_USER_ACCOUNT,
      ARBITRARY_BIGINT,
    ));
    expect(await getAllTokens(connection)).toEqual([]);
  }, TEST_TIMEOUT);

});

