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
export function getAllTokens(connection: Connection): TokenEntry[] {
    return [];
}

/**
 * Returns a sanitized list of all the registered tokens. Throw away all duplicate tickers and names, only keeping the ticker or name with highest active DEX volume.
 *
 */
export function getAllTokensSanitized(connection: Connection): TokenEntry[] {
    return [];
}

/**
 * Creates a TransactionInstruction corresponding to the InitializeRegistry contract instruction.
 *
 */
export async function createInstructionInitializeRegistry(
  connection: Connection,
  userPublicKey: PublicKey,
  feeMintPublicKey: PublicKey,
  feeDestinationPublicKey: PublicKey,
  feeAmount: bigint,
): Promise<TransactionInstruction> {

    let buffer = Buffer.alloc(9)
    buffer.writeUInt8(0);
    buffer.writeBigUInt64BE(feeAmount, 1);

    let keys = [
      { isSigner: true, isWritable: true, pubkey: userPublicKey },
      { isSigner: false, isWritable: false, pubkey: feeMintPublicKey },
      { isSigner: false, isWritable: false, pubkey: feeDestinationPublicKey },
      { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
      { isSigner: false, isWritable: false, pubkey: await getRegistryMetaPublicKey() },
    ]
    await pushAllRegistryNodes(connection, keys);

    return new TransactionInstruction({
        data: buffer,
        keys: keys,
        programId: getProgramId(),
    });

}

/**
 * Creates a TransactionInstruction corresponding to the UpdateFees contract instruction.
 *
 */
export async function createInstructionUpdateFees(
  connection: Connection,
  userPublicKey: PublicKey,
  feeMintPublicKey: PublicKey,
  feeDestinationPublicKey: PublicKey,
  feeAmount: bigint,
): Promise<TransactionInstruction> {

  let buffer = Buffer.alloc(9)
  buffer.writeUInt8(1);
  buffer.writeBigUInt64BE(feeAmount, 1);

  let keys = [
    { isSigner: true, isWritable: true, pubkey: userPublicKey },
    { isSigner: false, isWritable: false, pubkey: feeMintPublicKey },
    { isSigner: false, isWritable: false, pubkey: feeDestinationPublicKey },
    { isSigner: false, isWritable: false, pubkey: await getRegistryMetaPublicKey() },
  ]
  await pushAllRegistryNodes(connection, keys);

  return new TransactionInstruction({
      data: buffer,
      keys: keys,
      programId: getProgramId(),
  });

}

/**
 * Creates a TransactionInstruction corresponding to the CreateEntry contract instruction.
 *
 */
export async function createInstructionCreateEntry(
  connection: Connection,
  userPublicKey: PublicKey,
  mintPublicKey: PublicKey,
  sourceTokenAccount: PublicKey,
  destinationTokenAccount: PublicKey,
  tokenSymbol: string,
  tokenName: string,
  tokenLogoUrl: string,
  tokenTags: string[],
  tokenExtensions: [string, string][],
): Promise<TransactionInstruction> {

  let serializedTokenTags = JSON.stringify(tokenTags);
  let serializedTokenExtensions = JSON.stringify(tokenExtensions);
  let buffer = Buffer.alloc(
    1 + tokenSymbol.length + tokenName.length + tokenLogoUrl.length
    + serializedTokenTags.length + serializedTokenExtensions.length + 5
  );
  buffer.writeUInt8(2);
  buffer.write(
    tokenSymbol + '\0' + tokenName + '\0' + tokenLogoUrl + '\0' 
    + serializedTokenTags + '\0' + serializedTokenExtensions + '\0',
    1,
    buffer.length - 1,
    'ascii',
  );

  let keys = [
    { isSigner: true, isWritable: true, pubkey: userPublicKey },
    { isSigner: false, isWritable: false, pubkey: mintPublicKey },
    { isSigner: false, isWritable: true, pubkey: sourceTokenAccount },
    { isSigner: false, isWritable: true, pubkey: destinationTokenAccount },
    { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
    { isSigner: false, isWritable: false, pubkey: getTokenProgram() },
    { isSigner: false, isWritable: false, pubkey: await getRegistryMetaPublicKey() },
  ]
  await pushAllRegistryNodes(connection, keys);

  return new TransactionInstruction({
    data: buffer,
    keys: keys,
    programId: getProgramId(),
  });

}

/**
 * Creates a TransactionInstruction corresponding to the DeleteEntry contract instruction.
 *
 */
export async function createInstructionDeleteEntry(
  connection: Connection,
  userPublicKey: PublicKey,
  mintPublicKey: PublicKey,
): Promise<TransactionInstruction> {

  let buffer = Buffer.alloc(1)
  buffer.writeUInt8(3);

  let keys = [
    { isSigner: true, isWritable: true, pubkey: userPublicKey },
    { isSigner: false, isWritable: false, pubkey: mintPublicKey },
    { isSigner: false, isWritable: false, pubkey: await getRegistryMetaPublicKey() },
  ]
  await pushAllRegistryNodes(connection, keys);

  return new TransactionInstruction({
    data: Buffer.from(buffer),
    keys: keys,
    programId: getProgramId(),
  });

}

/**
 * Creates a TransactionInstruction corresponding to the UpdateEntry contract instruction.
 *
 */
export async function createInstructionUpdateEntry(
  connection: Connection,
  userPublicKey: PublicKey,
  mintPublicKey: PublicKey,
  sourceTokenAccount: PublicKey,
  destinationTokenAccount: PublicKey,
  tokenSymbol: string,
  tokenName: string,
  tokenLogoUrl: string,
  tokenTags: string[],
  tokenExtensions: [string, string][],
): Promise<TransactionInstruction> {

  let serializedTokenTags = JSON.stringify(tokenTags);
  let serializedTokenExtensions = JSON.stringify(tokenExtensions);
  let buffer = Buffer.alloc(
    1 + tokenSymbol.length + tokenName.length + tokenLogoUrl.length
    + serializedTokenTags.length + serializedTokenExtensions.length + 5
  );
  buffer.writeUInt8(4);
  buffer.write(
    tokenSymbol + '\0' + tokenName + '\0' + tokenLogoUrl + '\0' 
    + serializedTokenTags + '\0' + serializedTokenExtensions + '\0',
    1,
    buffer.length - 1,
    'ascii',
  );

  let keys = [
    { isSigner: true, isWritable: true, pubkey: userPublicKey },
    { isSigner: false, isWritable: false, pubkey: mintPublicKey },
    { isSigner: false, isWritable: false, pubkey: await getRegistryMetaPublicKey() },
  ]
  await pushAllRegistryNodes(connection, keys);

  return new TransactionInstruction({
    data: buffer,
    keys: keys,
    programId: getProgramId(),
  });

}

/**
 * Creates a TransactionInstruction corresponding to the TransferFeeAuthority contract instruction.
 *
 */
export async function createInstructionTransferFeeAuthority(
  connection: Connection,
  userPublicKey: PublicKey,
  feeAuthorityPublicKey: PublicKey,
): Promise<TransactionInstruction> {

  let buffer = Buffer.alloc(1)
  buffer.writeUInt8(5);

  let keys = [
    { isSigner: true, isWritable: true, pubkey: userPublicKey },
    { isSigner: false, isWritable: false, pubkey: feeAuthorityPublicKey },
    { isSigner: false, isWritable: false, pubkey: await getRegistryMetaPublicKey() },
  ]
  await pushAllRegistryNodes(connection, keys);

  return new TransactionInstruction({
    data: Buffer.from(buffer),
    keys: keys,
    programId: getProgramId(),
  });

}

/**
 * Creates a TransactionInstruction corresponding to the TransferTokenAuthority contract instruction.
 *
 */
export async function createInstructionTransferTokenAuthority(
  connection: Connection,
  userPublicKey: PublicKey,
  tokenAuthorityPublicKey: PublicKey,
): Promise<TransactionInstruction> {

  let buffer = Buffer.alloc(1)
  buffer.writeUInt8(6);

  let keys = [
    { isSigner: true, isWritable: true, pubkey: userPublicKey },
    { isSigner: false, isWritable: false, pubkey: tokenAuthorityPublicKey },
    { isSigner: false, isWritable: false, pubkey: await getRegistryMetaPublicKey() },
  ]
  await pushAllRegistryNodes(connection, keys);

  return new TransactionInstruction({
    data: Buffer.from(buffer),
    keys: keys,
    programId: getProgramId(),
  });

}

interface transactionKey {
  isSigner: boolean,
  isWritable: boolean,
  pubkey: PublicKey,
}
async function pushAllRegistryNodes(connection: Connection, keys: transactionKey[]) {
  let registryMetaAccountInfo = await connection.getAccountInfo(await getRegistryMetaPublicKey());
  if (registryMetaAccountInfo === null) {
    return;
  } else {
    throw Error("Not implemented non-null registryMetaAccountInfo.");
  }
}

async function getRegistryMetaPublicKey(): Promise<PublicKey> {
    let [registryMetaPublicKey, _registryMetaBumpSeed] = await PublicKey.findProgramAddress(
        [Buffer.from("")],
        getProgramId(),
    );
    return registryMetaPublicKey;
}

function getProgramId(): PublicKey {
    return Keypair.fromSecretKey(Uint8Array.from(registryKeypair)).publicKey;
}

function getTokenProgram(): PublicKey {
    return new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
}

