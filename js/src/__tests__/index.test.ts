import {
  getAllTokens,
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

const CONFIG_FILE = "/Users/chris/.config/solana/id.json"
let userPrivateKeyString = readFileSync(CONFIG_FILE).toString();
let userKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(userPrivateKeyString)));

const USDT_PUBLICKEY = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const ARBITRARY_TOKEN_ACCOUNT  = new PublicKey("7STJWT74tAZzhbNNPRH8WuGDy9GZg27968EwALWuezrH");
const ARBITRARY_USER_ACCOUNT = new PublicKey("DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEAD");

let connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Hack to prevent API calls from displaying error messages.
console.error = () => {};


async function sendTx(instruction: TransactionInstruction) : Promise<string> {
  let tx = new Transaction({
      feePayer: userKeypair.publicKey,
      recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
  });
  tx.add(instruction);
  let signature = await connection.sendTransaction(
    tx,
    [userKeypair],
  );
  return signature;
}

test("Connection Valid", async () => {
  let slot = await connection.getSlot();
  expect(slot).toBeGreaterThan(0);
});

test("getAllTokens return []", () => {
  expect(getAllTokens(connection)).toStrictEqual([]);
});

test("All Transactions Fail before InitializeRegistry", async () => {

  expect.assertions(6);

  // RegistryInstruction::UpdateFees
  try {
    await sendTx(await createInstructionUpdateFees(
      connection,
      userKeypair.publicKey,
      USDT_PUBLICKEY,
      ARBITRARY_USER_ACCOUNT,
      BigInt(20000000),
    ));
  } catch (error) {
    let txLogs = ((error as SendTransactionError).logs as string[]).join(" ");
    expect(txLogs).toMatch(/RegistryError::NotYetInitialized/);
  }

  // RegistryInstruction::CreateEntry
  try {
    await sendTx(await createInstructionCreateEntry(
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
    await sendTx(await createInstructionDeleteEntry(
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
    await sendTx(await createInstructionUpdateEntry(
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
    await sendTx(await createInstructionTransferFeeAuthority(
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
    await sendTx(await createInstructionTransferTokenAuthority(
      connection,
      userKeypair.publicKey,
      ARBITRARY_USER_ACCOUNT,
    ));
  } catch (error) {
    let txLogs = ((error as SendTransactionError).logs as string[]).join(" ");
    expect(txLogs).toMatch(/RegistryError::NotYetInitialized/);
  }

}, 10000);

test("Initialize Registry Succeeds", async () => {
  let signature = await sendTx(await createInstructionInitializeRegistry(
    connection,
    userKeypair.publicKey,
    USDT_PUBLICKEY,
    ARBITRARY_USER_ACCOUNT,
    BigInt(20000000),
  ));
  console.log("Sig ", signature);
});

