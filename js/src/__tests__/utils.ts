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

export const TEST_TIMEOUT = 100000
export const USDT_PUBLICKEY = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
export const ARBITRARY_TOKEN_ACCOUNT = new PublicKey('7STJWT74tAZzhbNNPRH8WuGDy9GZg27968EwALWuezrH')
export const ARBITRARY_USER_ACCOUNT = new PublicKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEAD')
export const ARBITRARY_BIGINT = BigInt(123456789)

export const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
const configFile = '/Users/chris/.config/solana/id.json'
const userPrivateKeyString = readFileSync(configFile).toString()
export const userKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(userPrivateKeyString)))

export function deployProgram (): void {
  execSync('cd ../program && npm run build && npm run deploy')
}

export async function sendAndConfirmTx (instruction: TransactionInstruction): Promise<string> {
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
