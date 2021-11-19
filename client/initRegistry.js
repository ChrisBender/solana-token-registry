import { readFileSync } from 'fs';
import fetch from 'node-fetch';

import {
  createInstructionInitializeRegistry,
  createInstructionCreateEntry,
  getAllTokens,
  PROGRAM_ID
} from 'solana-token-registry';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction
} from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

const configFile = '/Users/chris/.config/solana/id.json'
const userPrivateKeyString = readFileSync(configFile).toString()
const userKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(userPrivateKeyString)))
const DEST_PUBLICKEY = new PublicKey("3Xz7i56YzDA5TMDV3opGCQZFjVz5J61DfwXcdyp5WNxA")
// TODO: This is not the real USDC address on devnet; update for mainnet.
const USDC_PUBLICKEY = new PublicKey("3MoHgE6bJ2Ak1tEvTt5SVgSN2oXiwt6Gk5s6wbBxdmmN")

async function sendAndConfirmTx(connection, instruction) {
  const tx = new Transaction({
    feePayer: userKeypair.publicKey,
    recentBlockhash: (await connection.getRecentBlockhash()).blockhash
  })
  tx.add(instruction)
  const signature = await connection.sendTransaction(tx, [userKeypair])
  await connection.confirmTransaction(signature)
  return signature
}

console.log("Initializing Registry with PROGRAM_ID:", PROGRAM_ID.toString())
console.log(
  "InitializeRegistry tx:",
  await sendAndConfirmTx(connection, await createInstructionInitializeRegistry(
    connection,
    PROGRAM_ID,
    userKeypair.publicKey,
    USDC_PUBLICKEY,
    DEST_PUBLICKEY,
    BigInt(20000000)
  ))
)
fetch("https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json").then(
  tokensList => tokensList.json()
).then(
  async (tokensList) => {
    for (const token of tokensList.tokens) {
      console.log(token)
      const extensions = []
      if (token.extensions !== undefined) {
        for (const [key, value] of Object.entries(token.extensions)) {
          extensions.push([key, value])
        }
      }
      console.log(extensions)
      try {
        const sig = await sendAndConfirmTx(connection, await createInstructionCreateEntry(
          connection,
          PROGRAM_ID,
          userKeypair.publicKey,
          new PublicKey(token.address),
          token.symbol,
          token.name,
          token.logoURI,
          token.tags,
          extensions,
        ))
        console.log("CreateEntry for:", token.address)
        console.log("Signature:", sig)
      } catch (error) {
        continue
      }
    }
  }
)

