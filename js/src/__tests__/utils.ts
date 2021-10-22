import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js'

import { readFileSync } from 'fs'
import { execSync } from 'child_process'

// Hack to prevent API calls from displaying error messages.
console.error = () => undefined

export const TEST_TIMEOUT = 200000
export const USDT_PUBLICKEY = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
export const ARBITRARY_TOKEN_ACCOUNT = new PublicKey('7STJWT74tAZzhbNNPRH8WuGDy9GZg27968EwALWuezrH')
export const ARBITRARY_USER_ACCOUNT = new PublicKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEAD')
export const ARBITRARY_BIGINT = BigInt(123456789)

const configFile = '/Users/chris/.config/solana/id.json'
const userPrivateKeyString = readFileSync(configFile).toString()
export const userKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(userPrivateKeyString)))

export function getConnection (): Connection {
  return new Connection('http://127.0.0.1:8899', 'confirmed')
}

export async function deployProgram (
  connection: Connection,
  userKeypair: Keypair
): Promise<PublicKey> {
  const programId = Keypair.generate()
  execSync('echo "[' + programId.secretKey.toString() + ']" | solana program deploy --final --program-id - ../program/build/registry.so')
  return programId.publicKey
}

export function unreachable (): void {
  expect(true).toBe(false)
}

export async function sendAndConfirmTx (
  connection: Connection,
  instruction: TransactionInstruction
): Promise<string> {
  const tx = new Transaction({
    feePayer: userKeypair.publicKey,
    recentBlockhash: (await connection.getRecentBlockhash()).blockhash
  })
  tx.add(instruction)
  const signature = await connection.sendTransaction(
    tx,
    [userKeypair]
  )
  await connection.confirmTransaction(signature)
  return signature
}
