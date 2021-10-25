import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js'

import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { getRegistryState } from '../index'

// Hack to prevent API calls from displaying error messages.
console.error = () => undefined

export const TEST_TIMEOUT = 200000
export const ARBITRARY_MINT_1 = new PublicKey('7Cab8z1Lz1bTC9bQNeY7VQoZw5a2YbZoxmvFSvPgcTEL')
export const ARBITRARY_MINT_2 = new PublicKey('7STJWT74tAZzhbNNPRH8WuGDy9GZg27968EwALWuezrH')
export const ARBITRARY_MINT_3 = new PublicKey('3MoHgE6bJ2Ak1tEvTt5SVgSN2oXiwt6Gk5s6wbBxdmmN')
export const ARBITRARY_USER_1 = new PublicKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEAD')
export const ARBITRARY_USER_2 = new PublicKey('DEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEFBEEF')
export const ARBITRARY_BIGINT_1 = BigInt(123456789)
export const ARBITRARY_BIGINT_2 = BigInt(987654321)

const configFile = '/Users/chris/.config/solana/id.json'
const userPrivateKeyString = readFileSync(configFile).toString()
export const userKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(userPrivateKeyString)))
export const userKeypair2 = Keypair.generate()

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
    feePayer: userKeypair.publicKey,
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
