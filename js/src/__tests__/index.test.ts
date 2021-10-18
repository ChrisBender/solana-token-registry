import {
  getAllTokens,
  createInstructionInitializeRegistry,
  createInstructionUpdateFees
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
  expect.assertions(1);
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
});

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

