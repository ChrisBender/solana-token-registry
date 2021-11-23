import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY
} from '@solana/web3.js'

import { serialize, deserialize } from 'borsh'
import { registryPrivateKey } from './registryKeypair'

export const PROGRAM_ID = Keypair.fromSecretKey(new Uint8Array(registryPrivateKey)).publicKey
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const ATA_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')

export interface RegistryMetaAccount {
  publicKey: PublicKey
  feeAmount: bigint
  feeMint: PublicKey
  feeDestination: PublicKey
  feeUpdateAuthority: PublicKey
}
export interface RegistryNodeAccount {
  publicKey: PublicKey
  nextRegistryNode: PublicKey
  mint: PublicKey
  symbol: string
  name: string
  logoURL: string
  tags: string[]
  extensions: string[][]
  updateAuthority: PublicKey
  deleted: boolean
}
export interface TokenEntry {
  mint: PublicKey
  symbol: string
  name: string
  logoURL: string
  tags: string[]
  extensions: string[][]
  updateAuthority: PublicKey
}

class BorshCreateEntryInstructionData {
  token_symbol = ''
  token_name = ''
  token_logo_url = ''
  token_tags = ['']
  token_extensions = [['']]
  constructor (fields: {
    token_symbol: string
    token_name: string
    token_logo_url: string
    token_tags: string[]
    token_extensions: string[][]
  } | undefined = undefined) {
    if (fields != null) {
      this.token_symbol = fields.token_symbol
      this.token_name = fields.token_name
      this.token_logo_url = fields.token_logo_url
      this.token_tags = fields.token_tags
      this.token_extensions = fields.token_extensions
    }
  }
}
const BorshCreateEntryInstructionDataSchema = new Map([
  [BorshCreateEntryInstructionData, {
    kind: 'struct',
    fields: [
      ['token_symbol', 'String'],
      ['token_name', 'String'],
      ['token_logo_url', 'String'],
      ['token_tags', ['String']],
      ['token_extensions', [['String']]]
    ]
  }]
])

/**
 * Returns the RegistryMetaAccount and a generator for all the RegistryMetaNodes.
 *
 */
export async function getRegistryStateGenerator (
  connection: Connection,
  programId: PublicKey
): Promise<null | [RegistryMetaAccount, AsyncGenerator<RegistryNodeAccount>]> {
  class BorshRegistryMetaAccount {
    head_registry_node = new Uint8Array(32)
    fee_amount = 0
    fee_mint = new Uint8Array(32)
    fee_destination = new Uint8Array(32)
    fee_update_authority = new Uint8Array(32)
    constructor (fields: {
      head_registry_node: Uint8Array
      fee_amount: number
      fee_mint: Uint8Array
      fee_destination: Uint8Array
      fee_update_authority: Uint8Array
    } | undefined = undefined) {
      if (fields != null) {
        this.head_registry_node = fields.head_registry_node
        this.fee_amount = fields.fee_amount
        this.fee_mint = fields.fee_mint
        this.fee_destination = fields.fee_destination
        this.fee_update_authority = fields.fee_update_authority
      }
    }
  }
  const BorshRegistryMetaAccountSchema = new Map([
    [BorshRegistryMetaAccount, {
      kind: 'struct',
      fields: [
        ['head_registry_node', [32]],
        ['fee_amount', 'u64'],
        ['fee_mint', [32]],
        ['fee_destination', [32]],
        ['fee_update_authority', [32]]
      ]
    }]
  ])

  class BorshRegistryNodeAccount {
    next_registry_node = new Uint8Array(32)
    prev_registry_node = new Uint8Array(32)
    token_mint = new Uint8Array(32)
    token_symbol = ''
    token_name = ''
    token_logo_url = ''
    token_tags = ['']
    token_extensions = [['']]
    token_update_authority = new Uint8Array(32)
    deleted = false
    constructor (fields: {
      next_registry_node: Uint8Array
      prev_registry_node: Uint8Array
      token_mint: Uint8Array
      token_symbol: string
      token_name: string
      token_logo_url: string
      token_tags: string[]
      token_extensions: string[][]
      token_update_authority: Uint8Array
      deleted: boolean
    } | undefined = undefined) {
      if (fields != null) {
        this.next_registry_node = fields.next_registry_node
        this.prev_registry_node = fields.prev_registry_node
        this.token_mint = fields.token_mint
        this.token_symbol = fields.token_symbol
        this.token_name = fields.token_name
        this.token_logo_url = fields.token_logo_url
        this.token_tags = fields.token_tags
        this.token_extensions = fields.token_extensions
        this.token_update_authority = fields.token_update_authority
        this.deleted = fields.deleted
      }
    }
  }
  const BorshRegistryNodeAccountSchema = new Map([
    [BorshRegistryNodeAccount, {
      kind: 'struct',
      fields: [
        ['next_registry_node', [32]],
        ['prev_registry_node', [32]],
        ['token_mint', [32]],
        ['token_symbol', 'String'],
        ['token_name', 'String'],
        ['token_logo_url', 'String'],
        ['token_tags', ['String']],
        ['token_extensions', [['String']]],
        ['token_update_authority', [32]],
        ['deleted', 'u8']
      ]
    }]
  ])

  const registryMetaPublicKey = await getPDA('meta', programId)
  const registryHeadPublicKey = await getPDA('head', programId)
  const registryMetaAccountInfo = await connection.getAccountInfo(registryMetaPublicKey)
  const registryHeadAccountInfo = await connection.getAccountInfo(registryHeadPublicKey)

  /* If the registry has not yet been initialized, return null. */
  if (registryMetaAccountInfo === null || registryHeadAccountInfo === null) {
    return null
  }

  const borshRegistryMetaAccount = deserialize(
    BorshRegistryMetaAccountSchema,
    BorshRegistryMetaAccount,
    registryMetaAccountInfo.data
  )
  let length = registryHeadAccountInfo.data.readUInt32BE(0)
  const borshRegistryHeadAccount = deserialize(
    BorshRegistryNodeAccountSchema,
    BorshRegistryNodeAccount,
    registryHeadAccountInfo.data.slice(4, 4 + length)
  )

  const registryMetaAccount = {
    publicKey: registryMetaPublicKey,
    feeAmount: BigInt(borshRegistryMetaAccount.fee_amount),
    feeMint: new PublicKey(borshRegistryMetaAccount.fee_mint),
    feeDestination: new PublicKey(borshRegistryMetaAccount.fee_destination),
    feeUpdateAuthority: new PublicKey(borshRegistryMetaAccount.fee_update_authority)
  }
  const registryHeadAccount = {
    publicKey: registryHeadPublicKey,
    nextRegistryNode: new PublicKey(borshRegistryHeadAccount.next_registry_node),
    mint: new PublicKey(borshRegistryHeadAccount.token_mint),
    symbol: borshRegistryHeadAccount.token_symbol,
    name: borshRegistryHeadAccount.token_name,
    logoURL: borshRegistryHeadAccount.token_logo_url,
    tags: borshRegistryHeadAccount.token_tags,
    extensions: borshRegistryHeadAccount.token_extensions,
    updateAuthority: new PublicKey(borshRegistryHeadAccount.token_update_authority),
    deleted: +borshRegistryHeadAccount.deleted !== 0
  }

  async function * registryNodeAccountsIterator (): RegistryNodeAccount {
    yield registryHeadAccount
    let prevRegistryNode = registryHeadAccount
    while (prevRegistryNode.nextRegistryNode.toString() !== PublicKey.default.toString()) {
      const registryNodePublicKey = prevRegistryNode.nextRegistryNode
      const registryNodeAccountInfo = await connection.getAccountInfo(registryNodePublicKey)
      // @ts-expect-error
      length = registryNodeAccountInfo.data.readUInt32BE(0)
      const borshRegistryNodeAccount = deserialize(
        BorshRegistryNodeAccountSchema,
        BorshRegistryNodeAccount,
        // @ts-expect-error
        registryNodeAccountInfo.data.slice(4, 4 + length)
      )
      const registryNodeAccount = {
        publicKey: registryNodePublicKey,
        nextRegistryNode: new PublicKey(borshRegistryNodeAccount.next_registry_node),
        mint: new PublicKey(borshRegistryNodeAccount.token_mint),
        symbol: borshRegistryNodeAccount.token_symbol,
        name: borshRegistryNodeAccount.token_name,
        logoURL: borshRegistryNodeAccount.token_logo_url,
        tags: borshRegistryNodeAccount.token_tags,
        extensions: borshRegistryNodeAccount.token_extensions,
        updateAuthority: new PublicKey(borshRegistryNodeAccount.token_update_authority),
        deleted: +borshRegistryNodeAccount.deleted !== 0
      }
      yield registryNodeAccount
      prevRegistryNode = registryNodeAccount
    }
  }
  return [registryMetaAccount, registryNodeAccountsIterator()]
}

/**
 * Returns the RegistryMetaAccount and a list of all the RegistryMetaNodes.
 *
 */
export async function getRegistryState (
  connection: Connection,
  programId: PublicKey
): Promise<null | [RegistryMetaAccount, RegistryNodeAccount[]]> {
  const registryStateGenerator = await getRegistryStateGenerator(connection, programId)
  if (registryStateGenerator === null) {
    return null
  } else {
    const [registryMetaAccount, registryNodeAccountsGenerator] = registryStateGenerator
    const registryNodeAccounts: RegistryNodeAccount[] = []
    for await (const registryNodeAccount of registryNodeAccountsGenerator) {
      registryNodeAccounts.push(registryNodeAccount)
    }
    return [registryMetaAccount, registryNodeAccounts]
  }
}

/**
 * Returns a list of all the registered tokens.
 *
 */
export async function getAllTokens (
  connection: Connection,
  programId: PublicKey
): Promise<Set<TokenEntry>> {
  const registryState = await getRegistryState(connection, programId)
  if (registryState !== null) {
    const registryNodeAccounts = registryState[1]
    const tokenEntries = new Set<TokenEntry>()
    for (const registryNodeAccount of registryNodeAccounts.slice(1, -1)) {
      if (registryNodeAccount.deleted) {
        continue
      }
      tokenEntries.add({
        mint: registryNodeAccount.mint,
        symbol: registryNodeAccount.symbol,
        name: registryNodeAccount.name,
        logoURL: registryNodeAccount.logoURL,
        tags: registryNodeAccount.tags,
        extensions: registryNodeAccount.extensions,
        updateAuthority: registryNodeAccount.updateAuthority
      })
    }
    return tokenEntries
  }
  return new Set<TokenEntry>()
}

/**
 * Returns a generator for all the registered tokens.
 *
 */
export async function getAllTokensGenerator (
  connection: Connection,
  programId: PublicKey
): Promise<AsyncGenerator<TokenEntry>> {
  const registryStateGenerator = await getRegistryStateGenerator(connection, programId)
  async function * allTokensIterator (): TokenEntry {
    if (registryStateGenerator !== null) {
      const registryNodeAccountsGenerator = registryStateGenerator[1]
      let prevTokenEntry: null | TokenEntry = null
      let hasSkippedOne = false
      for await (const registryNodeAccount of registryNodeAccountsGenerator) {
        if (prevTokenEntry !== null) {
          if (hasSkippedOne) {
            yield prevTokenEntry
          } else {
            hasSkippedOne = true
          }
        }
        prevTokenEntry = {
          mint: registryNodeAccount.mint,
          symbol: registryNodeAccount.symbol,
          name: registryNodeAccount.name,
          logoURL: registryNodeAccount.logoURL,
          tags: registryNodeAccount.tags,
          extensions: registryNodeAccount.extensions,
          updateAuthority: registryNodeAccount.updateAuthority
        }
      }
    }
  }
  return allTokensIterator()
}

/**
 * Returns a sanitized list of all the registered tokens. Throw away all
 * duplicate tickers and names, only keeping the ticker or name with highest
 * active DEX volume.
 *
 */
export async function getAllTokensSanitized (
  connection: Connection,
  programId: PublicKey
): Promise<Set<TokenEntry>> {
  return await getAllTokens(connection, programId)
}

/**
 * Creates a TransactionInstruction corresponding to the InitializeRegistry
 * contract instruction.
 *
 */
export async function createInstructionInitializeRegistry (
  connection: Connection,
  programId: PublicKey,
  userPublicKey: PublicKey,
  feeMintPublicKey: PublicKey,
  feeDestinationPublicKey: PublicKey,
  feeAmount: bigint
): Promise<TransactionInstruction> {
  const buffer = Buffer.alloc(9)
  buffer.writeUInt8(0)
  buffer.writeBigUInt64BE(feeAmount, 1)

  const destinationTokenAccount = await getATA(
    connection,
    feeDestinationPublicKey,
    feeMintPublicKey
  )

  const keys = [
    { isSigner: true, isWritable: false, pubkey: userPublicKey },
    { isSigner: false, isWritable: false, pubkey: feeMintPublicKey },
    { isSigner: false, isWritable: false, pubkey: feeDestinationPublicKey },
    { isSigner: false, isWritable: true, pubkey: destinationTokenAccount },
    { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
    { isSigner: false, isWritable: false, pubkey: TOKEN_PROGRAM_ID },
    { isSigner: false, isWritable: false, pubkey: ATA_PROGRAM_ID },
    { isSigner: false, isWritable: false, pubkey: SYSVAR_RENT_PUBKEY },
    { isSigner: false, isWritable: true, pubkey: await getPDA('meta', programId) },
    { isSigner: false, isWritable: true, pubkey: await getPDA('head', programId) },
    { isSigner: false, isWritable: true, pubkey: await getPDA('tail', programId) }
  ]

  return new TransactionInstruction({
    data: buffer,
    keys: keys,
    programId: programId
  })
}

/**
 * Creates a TransactionInstruction corresponding to the UpdateFees contract
 * instruction.
 *
 */
export async function createInstructionUpdateFees (
  connection: Connection,
  programId: PublicKey,
  userPublicKey: PublicKey,
  feeMintPublicKey: PublicKey,
  feeDestinationPublicKey: PublicKey,
  feeAmount: bigint
): Promise<TransactionInstruction> {
  const buffer = Buffer.alloc(9)
  buffer.writeUInt8(1)
  buffer.writeBigUInt64BE(feeAmount, 1)

  const destinationTokenAccount = await getATA(
    connection,
    feeDestinationPublicKey,
    feeMintPublicKey
  )

  const keys = [
    { isSigner: true, isWritable: false, pubkey: userPublicKey },
    { isSigner: false, isWritable: false, pubkey: feeMintPublicKey },
    { isSigner: false, isWritable: false, pubkey: feeDestinationPublicKey },
    { isSigner: false, isWritable: true, pubkey: destinationTokenAccount },
    { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
    { isSigner: false, isWritable: false, pubkey: TOKEN_PROGRAM_ID },
    { isSigner: false, isWritable: false, pubkey: ATA_PROGRAM_ID },
    { isSigner: false, isWritable: false, pubkey: SYSVAR_RENT_PUBKEY },
    { isSigner: false, isWritable: true, pubkey: await getPDA('meta', programId) }
  ]

  return new TransactionInstruction({
    data: buffer,
    keys: keys,
    programId: programId
  })
}

/**
 * Creates a TransactionInstruction corresponding to the CreateEntry contract
 * instruction.
 *
 */
export async function createInstructionCreateEntry (
  connection: Connection,
  programId: PublicKey,
  userPublicKey: PublicKey,
  mintPublicKey: PublicKey,
  tokenSymbol: string,
  tokenName: string,
  tokenLogoUrl: string,
  tokenTags: string[],
  tokenExtensions: Array<[string, string]>
): Promise<TransactionInstruction> {
  const serializedFlag = Buffer.alloc(1)
  serializedFlag.writeUInt8(2)
  const serializedInstructionData = serialize(
    BorshCreateEntryInstructionDataSchema,
    new BorshCreateEntryInstructionData({
      token_symbol: tokenSymbol,
      token_name: tokenName,
      token_logo_url: tokenLogoUrl,
      token_tags: tokenTags,
      token_extensions: tokenExtensions
    })
  )
  const buffer = Buffer.concat([Buffer.from(serializedFlag), Buffer.from(serializedInstructionData)])

  const registryState = await getRegistryState(connection, programId)
  let registryMetaAccount, registryNodeAccounts
  if (registryState === null) {
    throw Error('Registry has not yet been initialized.')
  } else {
    [registryMetaAccount, registryNodeAccounts] = registryState
  }

  const sourceTokenAccount = await getATA(connection, userPublicKey, registryMetaAccount.feeMint)
  const destinationTokenAccount = await getATA(
    connection,
    registryMetaAccount.feeDestination,
    registryMetaAccount.feeMint
  )

  const keys = [
    { isSigner: true, isWritable: true, pubkey: userPublicKey },
    { isSigner: false, isWritable: false, pubkey: mintPublicKey },
    { isSigner: false, isWritable: true, pubkey: sourceTokenAccount },
    { isSigner: false, isWritable: true, pubkey: destinationTokenAccount },
    { isSigner: false, isWritable: false, pubkey: SystemProgram.programId },
    { isSigner: false, isWritable: false, pubkey: TOKEN_PROGRAM_ID },
    { isSigner: false, isWritable: false, pubkey: await getPDA('meta', programId) },
    { isSigner: false, isWritable: true, pubkey: registryNodeAccounts[0].publicKey },
    { isSigner: false, isWritable: true, pubkey: registryNodeAccounts[1].publicKey },
    { isSigner: false, isWritable: true, pubkey: await getPDA(mintPublicKey.toBytes(), programId) }
  ]

  return new TransactionInstruction({
    data: buffer,
    keys: keys,
    programId: programId
  })
}

/**
 * Creates a TransactionInstruction corresponding to the DeleteEntry contract
 * instruction.
 *
 */
export async function createInstructionDeleteEntry (
  connection: Connection,
  programId: PublicKey,
  userPublicKey: PublicKey,
  mintPublicKey: PublicKey
): Promise<TransactionInstruction> {
  const buffer = Buffer.alloc(1)
  buffer.writeUInt8(3)

  const keys = [
    { isSigner: true, isWritable: false, pubkey: userPublicKey },
    { isSigner: false, isWritable: false, pubkey: mintPublicKey },
    { isSigner: false, isWritable: false, pubkey: await getPDA('meta', programId) },
    { isSigner: false, isWritable: true, pubkey: await getPDA(mintPublicKey.toBytes(), programId) }
  ]

  return new TransactionInstruction({
    data: Buffer.from(buffer),
    keys: keys,
    programId: programId
  })
}

/**
 * Creates a TransactionInstruction corresponding to the UpdateEntry contract
 * instruction.
 *
 */
export async function createInstructionUpdateEntry (
  connection: Connection,
  programId: PublicKey,
  userPublicKey: PublicKey,
  mintPublicKey: PublicKey,
  tokenSymbol: string,
  tokenName: string,
  tokenLogoUrl: string,
  tokenTags: string[],
  tokenExtensions: Array<[string, string]>
): Promise<TransactionInstruction> {
  const serializedFlag = Buffer.alloc(1)
  serializedFlag.writeUInt8(4)
  const serializedInstructionData = serialize(
    BorshCreateEntryInstructionDataSchema,
    new BorshCreateEntryInstructionData({
      token_symbol: tokenSymbol,
      token_name: tokenName,
      token_logo_url: tokenLogoUrl,
      token_tags: tokenTags,
      token_extensions: tokenExtensions
    })
  )
  const buffer = Buffer.concat([Buffer.from(serializedFlag), Buffer.from(serializedInstructionData)])

  const keys = [
    { isSigner: true, isWritable: false, pubkey: userPublicKey },
    { isSigner: false, isWritable: false, pubkey: mintPublicKey },
    { isSigner: false, isWritable: false, pubkey: await getPDA('meta', programId) },
    { isSigner: false, isWritable: true, pubkey: await getPDA(mintPublicKey.toBytes(), programId) }
  ]

  return new TransactionInstruction({
    data: buffer,
    keys: keys,
    programId: programId
  })
}

/**
 * Creates a TransactionInstruction corresponding to the TransferFeeAuthority
 * contract instruction.
 *
 */
export async function createInstructionTransferFeeAuthority (
  connection: Connection,
  programId: PublicKey,
  userPublicKey: PublicKey,
  newFeeAuthorityPublicKey: PublicKey
): Promise<TransactionInstruction> {
  const buffer = Buffer.alloc(1)
  buffer.writeUInt8(5)

  const keys = [
    { isSigner: true, isWritable: false, pubkey: userPublicKey },
    { isSigner: false, isWritable: false, pubkey: newFeeAuthorityPublicKey },
    { isSigner: false, isWritable: true, pubkey: await getPDA('meta', programId) }
  ]

  return new TransactionInstruction({
    data: Buffer.from(buffer),
    keys: keys,
    programId: programId
  })
}

/**
 * Creates a TransactionInstruction corresponding to the TransferTokenAuthority
 * contract instruction.
 *
 */
export async function createInstructionTransferTokenAuthority (
  connection: Connection,
  programId: PublicKey,
  userPublicKey: PublicKey,
  mintPublicKey: PublicKey,
  newTokenAuthorityPublicKey: PublicKey
): Promise<TransactionInstruction> {
  const buffer = Buffer.alloc(1)
  buffer.writeUInt8(6)

  const keys = [
    { isSigner: true, isWritable: false, pubkey: userPublicKey },
    { isSigner: false, isWritable: false, pubkey: mintPublicKey },
    { isSigner: false, isWritable: false, pubkey: await getPDA('meta', programId) },
    { isSigner: false, isWritable: true, pubkey: await getPDA(mintPublicKey.toBytes(), programId) },
    { isSigner: false, isWritable: false, pubkey: newTokenAuthorityPublicKey }
  ]

  return new TransactionInstruction({
    data: Buffer.from(buffer),
    keys: keys,
    programId: programId
  })
}

/* Utilities */
export async function getPDA (
  seed: string | Uint8Array,
  programId: PublicKey
): Promise<PublicKey> {
  const publicKey = (await PublicKey.findProgramAddress(
    [Buffer.from(seed)],
    programId
  ))[0]
  return publicKey
}

async function getATA (
  connection: Connection,
  userAccount: PublicKey,
  tokenAccount: PublicKey
): Promise<PublicKey> {
  const associatedTokenAccount = (await PublicKey.findProgramAddress(
    [
      userAccount.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      tokenAccount.toBuffer()
    ],
    ATA_PROGRAM_ID
  ))[0]
  return associatedTokenAccount
}
