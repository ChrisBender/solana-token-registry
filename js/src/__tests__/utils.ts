import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'

import {
  TOKEN_PROGRAM_ID,
  Token
} from '@solana/spl-token'

import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { getRegistryState } from '../index'

// Hack to prevent API calls from displaying error messages.
console.error = () => undefined

export const TEST_TIMEOUT = 120000
export const ARBITRARY_MINTS: PublicKey[] = []
export const ARBITRARY_USER_1 = new PublicKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEAD')
export const ARBITRARY_USER_2 = new PublicKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFBEEF')
export const ARBITRARY_BIGINT_1 = BigInt(123456789)
export const ARBITRARY_BIGINT_2 = BigInt(987654321)

const configFile = '/Users/chris/.config/solana/id.json'
const userPrivateKeyString = readFileSync(configFile).toString()
export const userKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(userPrivateKeyString)))
export const userKeypair2 = Keypair.generate()
export const userKeypair3 = Keypair.generate()

export function getConnection (): Connection {
  return new Connection('http://127.0.0.1:8899', 'confirmed')
}

export async function deployProgram (
  connection: Connection,
  userKeypair: Keypair
): Promise<PublicKey> {
  /* Generate a Program ID and deploy the program. */
  const programId = Keypair.generate()
  execSync('echo "[' + programId.secretKey.toString() + ']" | solana program deploy --final --program-id - ../program/build/registry.so')

  /* Initialize a few mints, create ATA for all userKeypairs, mint some tokens, and transfer SOL. */
  for (let i = 0; i < 3; i++) {
    const token = await Token.createMint(
      connection,
      userKeypair,
      userKeypair.publicKey,
      null,
      9,
      TOKEN_PROGRAM_ID
    )
    ARBITRARY_MINTS.push(token.publicKey)
    const userKeypairATA = await token.createAssociatedTokenAccount(userKeypair.publicKey)
    const userKeypair2ATA = await token.createAssociatedTokenAccount(userKeypair2.publicKey)
    const userKeypair3ATA = await token.createAssociatedTokenAccount(userKeypair3.publicKey)
    await token.mintTo(userKeypairATA, userKeypair, [], 1e10)
    await token.mintTo(userKeypair2ATA, userKeypair, [], 1e10)
    await token.mintTo(userKeypair3ATA, userKeypair, [], 1e10)
  }

  return programId.publicKey
}

export async function transferSolToUserKeypairs (connection: Connection): Promise<void> {
  await sendAndConfirmTx(
    connection,
    SystemProgram.transfer({
      fromPubkey: userKeypair.publicKey,
      lamports: 1 * LAMPORTS_PER_SOL,
      toPubkey: userKeypair2.publicKey
    })
  )
  await sendAndConfirmTx(
    connection,
    SystemProgram.transfer({
      fromPubkey: userKeypair.publicKey,
      lamports: 1 * LAMPORTS_PER_SOL,
      toPubkey: userKeypair3.publicKey
    })
  )
}

export async function assertMetaAccountEquals (
  connection: Connection,
  programId: PublicKey,
  feeAmount: bigint,
  feeMint: PublicKey,
  feeDestination: PublicKey,
  feeUpdateAuthority: PublicKey
): Promise<void> {
  const registryState = await getRegistryState(connection, programId)
  let registryMetaAccount
  if (registryState === null) {
    unreachable()
    return
  } else {
    registryMetaAccount = registryState[0]
  }
  expect(registryMetaAccount.feeAmount).toEqual(feeAmount)
  expect(registryMetaAccount.feeMint).toEqual(feeMint)
  expect(registryMetaAccount.feeDestination).toEqual(feeDestination)
  expect(registryMetaAccount.feeUpdateAuthority).toEqual(feeUpdateAuthority)
}

export async function sendAndConfirmTx (
  connection: Connection,
  instruction: TransactionInstruction,
  signers: Keypair[] = [userKeypair]
): Promise<string> {
  const tx = new Transaction({
    feePayer: signers[0].publicKey,
    recentBlockhash: (await connection.getRecentBlockhash()).blockhash
  })
  tx.add(instruction)
  const signature = await connection.sendTransaction(tx, signers)
  await connection.confirmTransaction(signature)
  return signature
}

export function unreachable (): void {
  expect(true).toBe(false)
}
