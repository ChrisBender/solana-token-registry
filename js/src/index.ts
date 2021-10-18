import {
  Connection,
  PublicKey,
  SystemProgram,
  Keypair,
  TransactionInstruction
} from '@solana/web3.js';

const registryKeypair = require('./registry-keypair.json');

interface TokenEntry {
  mint: PublicKey,
  symbol: string,
  name: string,
  logo_url: string,
  token_tags: string[],
  token_extensions: [string, string][],
}

/**
 * Returns a list of all the registered tokens.
 *
 */
export function getAllTokens(connection: Connection) : TokenEntry[] {
  return [];
}

/**
 * Returns a sanitized list of all the registered tokens. Throw away all duplicate tickers and names, only keeping the ticker or name with highest active DEX volume.
 *
 */
export function getAllTokensSanitized(connection: Connection) : TokenEntry[] {
  return [];
}

/**
 * Creates a TransactionInstruction corresponding to the InitializeRegistry contract instruction.
 *
 */
export async function createInstructionInitializeRegistry(
  userPublicKey: PublicKey,
  feeMintPublicKey: PublicKey,
  feeDestinationPublicKey: PublicKey,
  feeAmount: bigint,
) : Promise<TransactionInstruction> {
  let buffer = new ArrayBuffer(9);
  let bufferView = new DataView(buffer);
  bufferView.setUint8(0, 0);
  bufferView.setBigUint64(1, feeAmount);
  return new TransactionInstruction({
    data: Buffer.from(buffer),
    keys: [
        {isSigner: true, isWritable: true, pubkey: userPublicKey},
        {isSigner: false, isWritable: false, pubkey: await getRegistryMetaPublicKey()},
        {isSigner: false, isWritable: false, pubkey: feeMintPublicKey},
        {isSigner: false, isWritable: false, pubkey: feeDestinationPublicKey},
        {isSigner: false, isWritable: false, pubkey: SystemProgram.programId},
    ],
    programId: getProgramId(),
  });
}

/**
 * Creates a TransactionInstruction corresponding to the UpdateFees contract instruction.
 *
 */
export async function createInstructionUpdateFees(
  userPublicKey: PublicKey,
  feeMintPublicKey: PublicKey,
  feeDestinationPublicKey: PublicKey,
  feeAmount: bigint,
) : Promise<TransactionInstruction> {
  let buffer = new ArrayBuffer(9);
  let bufferView = new DataView(buffer);
  bufferView.setUint8(0, 1);
  bufferView.setBigUint64(1, feeAmount);
  return new TransactionInstruction({
    data: Buffer.from(buffer),
    keys: [
        {isSigner: true, isWritable: true, pubkey: userPublicKey},
        {isSigner: false, isWritable: false, pubkey: await getRegistryMetaPublicKey()},
        {isSigner: false, isWritable: false, pubkey: feeMintPublicKey},
        {isSigner: false, isWritable: false, pubkey: feeDestinationPublicKey},
    ],
    programId: getProgramId(),
  });
}

/**
 * Creates a TransactionInstruction corresponding to the CreateEntry contract instruction.
 *
 */
export function createInstructionCreateEntry(
  userPublicKey: PublicKey,
  mintPublicKey: PublicKey,
  sourceTokenAccount: PublicKey,
  destinationTokenAccount: PublicKey,
  tokenSymbol: string,
  tokenName: string,
  tokenLogoUrl: string,
  tokenTags: string[],
  tokenExtensions: [string, string][],
) : TransactionInstruction {
  return new TransactionInstruction({
    keys: [],
    programId: getProgramId(),
  });
}

/**
 * Creates a TransactionInstruction corresponding to the DeleteEntry contract instruction.
 *
 */
export function createInstructionDeleteEntry(
  userPublicKey: PublicKey,
  mintPublicKey: PublicKey,
) : TransactionInstruction {
  return new TransactionInstruction({
    keys: [],
    programId: getProgramId(),
  });
}

/**
 * Creates a TransactionInstruction corresponding to the UpdateEntry contract instruction.
 *
 */
export function createInstructionUpdateEntry(
  userPublicKey: PublicKey,
  mintPublicKey: PublicKey,
  sourceTokenAccount: PublicKey,
  destinationTokenAccount: PublicKey,
  tokenSymbol: string,
  tokenName: string,
  tokenLogoUrl: string,
  tokenTags: string[],
  tokenExtensions: [string, string][],
) : TransactionInstruction {
  return new TransactionInstruction({
    keys: [],
    programId: getProgramId(),
  });
}

/**
 * Creates a TransactionInstruction corresponding to the TransferFeeAuthority contract instruction.
 *
 */
export function createInstructionTransferFeeAuthority(
  userPublicKey: PublicKey,
  feeAuthorityPublicKey: PublicKey,
) : TransactionInstruction {
  return new TransactionInstruction({
    keys: [],
    programId: getProgramId(),
  });
}

/**
 * Creates a TransactionInstruction corresponding to the TransferTokenAuthority contract instruction.
 *
 */
export function createInstructionTransferTokenAuthority(
  userPublicKey: PublicKey,
  tokenAuthorityPublicKey: PublicKey,
) : TransactionInstruction {
  return new TransactionInstruction({
    keys: [],
    programId: getProgramId(),
  });
}

async function getRegistryMetaPublicKey() : Promise<PublicKey> {
  let [registryMetaPublicKey, _registryMetaBumpSeed] = await PublicKey.findProgramAddress(
    [Buffer.from("")],
    getProgramId(),
  );
  return registryMetaPublicKey;
}

function getProgramId() : PublicKey {
  return Keypair.fromSecretKey(Uint8Array.from(registryKeypair)).publicKey;
}

