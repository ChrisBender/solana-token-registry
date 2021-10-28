import {
  getAllTokens,
  createInstructionInitializeRegistry,
  createInstructionCreateEntry
} from '../index'

import {
  TEST_TIMEOUT,
  ARBITRARY_MINTS,
  ARBITRARY_USER_1,
  ARBITRARY_BIGINT_1,
  getConnection,
  unreachable,
  userKeypair,
  userKeypair2,
  deployProgram,
  sendAndConfirmTx,
  transferSolToUserKeypairs
} from './utils'

import {
  PublicKey,
  SendTransactionError
} from '@solana/web3.js'

import {
  TOKEN_PROGRAM_ID,
  Token
} from '@solana/spl-token'

const ATA_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')

describe('CreateEntry', () => {
  test.concurrent('Read-over-write for CreateEntry', async () => {
    const connection = getConnection()
    const programId = await deployProgram(connection, userKeypair)

    await sendAndConfirmTx(connection, await createInstructionInitializeRegistry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[0],
      ARBITRARY_USER_1,
      ARBITRARY_BIGINT_1
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set())

    await sendAndConfirmTx(connection, await createInstructionCreateEntry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[1],
      'SYMBOL_1',
      'NAME_1',
      'LOGO_URL_1',
      ['TAGS_1_1', 'TAGS_1_2'],
      [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']]
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINTS[1],
        symbol: 'SYMBOL_1',
        name: 'NAME_1',
        logoURL: 'LOGO_URL_1',
        tags: ['TAGS_1_1', 'TAGS_1_2'],
        extensions: [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']],
        updateAuthority: userKeypair.publicKey
      }
    ]))
  }, TEST_TIMEOUT)

  test.concurrent('Read-over-write multiple times for CreateEntry', async () => {
    const connection = getConnection()
    const programId = await deployProgram(connection, userKeypair)

    await sendAndConfirmTx(connection, await createInstructionInitializeRegistry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[0],
      ARBITRARY_USER_1,
      ARBITRARY_BIGINT_1
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set())

    await sendAndConfirmTx(connection, await createInstructionCreateEntry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[1],
      'SYMBOL_1',
      'NAME_1',
      'LOGO_URL_1',
      ['TAGS_1_1', 'TAGS_1_2'],
      [['EXTENSIONS_1_1_KEY', 'EXTENSIONS_1_1_VAL']]
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINTS[1],
        symbol: 'SYMBOL_1',
        name: 'NAME_1',
        logoURL: 'LOGO_URL_1',
        tags: ['TAGS_1_1', 'TAGS_1_2'],
        extensions: [['EXTENSIONS_1_1_KEY', 'EXTENSIONS_1_1_VAL']],
        updateAuthority: userKeypair.publicKey
      }
    ]))

    await sendAndConfirmTx(connection, await createInstructionCreateEntry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[2],
      'SYMBOL_2',
      'NAME_2',
      'LOGO_URL_2',
      ['TAGS_2_1', 'TAGS_2_2'],
      [['EXTENSIONS_2_1_KEY', 'EXTENSIONS_2_1_VAL']]
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINTS[2],
        symbol: 'SYMBOL_2',
        name: 'NAME_2',
        logoURL: 'LOGO_URL_2',
        tags: ['TAGS_2_1', 'TAGS_2_2'],
        extensions: [['EXTENSIONS_2_1_KEY', 'EXTENSIONS_2_1_VAL']],
        updateAuthority: userKeypair.publicKey
      },
      {
        mint: ARBITRARY_MINTS[1],
        symbol: 'SYMBOL_1',
        name: 'NAME_1',
        logoURL: 'LOGO_URL_1',
        tags: ['TAGS_1_1', 'TAGS_1_2'],
        extensions: [['EXTENSIONS_1_1_KEY', 'EXTENSIONS_1_1_VAL']],
        updateAuthority: userKeypair.publicKey
      }
    ]))
  }, TEST_TIMEOUT)

  test.concurrent('CreateEntry twice on the same mint should fail', async () => {
    const connection = getConnection()
    const programId = await deployProgram(connection, userKeypair)

    await sendAndConfirmTx(connection, await createInstructionInitializeRegistry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[0],
      ARBITRARY_USER_1,
      ARBITRARY_BIGINT_1
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set())

    await sendAndConfirmTx(connection, await createInstructionCreateEntry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[1],
      'SYMBOL_1',
      'NAME_1',
      'LOGO_URL_1',
      ['TAGS_1_1', 'TAGS_1_2'],
      [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']]
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINTS[1],
        symbol: 'SYMBOL_1',
        name: 'NAME_1',
        logoURL: 'LOGO_URL_1',
        tags: ['TAGS_1_1', 'TAGS_1_2'],
        extensions: [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']],
        updateAuthority: userKeypair.publicKey
      }
    ]))
    try {
      await sendAndConfirmTx(connection, await createInstructionCreateEntry(
        connection,
        programId,
        userKeypair.publicKey,
        ARBITRARY_MINTS[1],
        'SYMBOL_1',
        'NAME_1',
        'LOGO_URL_1',
        ['TAGS_1_1', 'TAGS_1_2'],
        [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']]
      ))
      unreachable()
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::PreviouslyRegisteredMint/)
    }
  }, TEST_TIMEOUT)

  test.concurrent('CreateEntry with too much data', async () => {
    const connection = getConnection()
    const programId = await deployProgram(connection, userKeypair)

    await sendAndConfirmTx(connection, await createInstructionInitializeRegistry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[0],
      ARBITRARY_USER_1,
      ARBITRARY_BIGINT_1
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set())

    try {
      await sendAndConfirmTx(connection, await createInstructionCreateEntry(
        connection,
        programId,
        userKeypair.publicKey,
        ARBITRARY_MINTS[1],
        'SYMBOL_1',
        'NAME_1',
        'X'.repeat(2500), // More data than the Solana transaction limit of 1232 bytes.
        ['TAGS_1_1', 'TAGS_1_2'],
        [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']]
      ))
      unreachable()
    } catch (error) {
      expect((error as RangeError).name).toEqual('RangeError')
    }
  }, TEST_TIMEOUT)

  test.concurrent('Check that CreateEntry decrements token balance', async () => {
    const connection = getConnection()
    const programId = await deployProgram(connection, userKeypair)
    await transferSolToUserKeypairs(connection)

    await sendAndConfirmTx(connection, await createInstructionInitializeRegistry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[0],
      ARBITRARY_USER_1,
      ARBITRARY_BIGINT_1
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set())

    const feeMint = new Token(
      connection,
      ARBITRARY_MINTS[0],
      TOKEN_PROGRAM_ID,
      userKeypair
    )
    const sourceATA = await Token.getAssociatedTokenAddress(
      ATA_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      ARBITRARY_MINTS[0],
      userKeypair2.publicKey
    )

    const balanceBefore = (await feeMint.getAccountInfo(sourceATA)).amount
    await sendAndConfirmTx(connection, await createInstructionCreateEntry(
      connection,
      programId,
      userKeypair2.publicKey,
      ARBITRARY_MINTS[1],
      'SYMBOL_1',
      'NAME_1',
      'LOGO_URL_1',
      ['TAGS_1_1', 'TAGS_1_2'],
      [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']]
    ), [userKeypair, userKeypair2])
    const balanceAfter = (await feeMint.getAccountInfo(sourceATA)).amount

    expect(balanceBefore.sub(balanceAfter).toString()).toEqual(ARBITRARY_BIGINT_1.toString())
  }, TEST_TIMEOUT)
})
