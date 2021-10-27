import {
  getAllTokens,
  createInstructionInitializeRegistry,
  createInstructionCreateEntry,
  createInstructionDeleteEntry,
  createInstructionUpdateEntry
} from '../index'

import {
  TEST_TIMEOUT,
  ARBITRARY_MINTS,
  ARBITRARY_USER_1,
  ARBITRARY_BIGINT_1,
  getConnection,
  userKeypair,
  userKeypair2,
  userKeypair3,
  deployProgram,
  sendAndConfirmTx
} from './utils'

import {
  SendTransactionError,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'

describe('DeleteEntry', () => {
  test.concurrent('Read-over-write for DeleteEntry', async () => {
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

    await sendAndConfirmTx(connection, await createInstructionDeleteEntry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[1]
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set())
  }, TEST_TIMEOUT)

  test.concurrent('Create, Delete, Create, Delete the same mint', async () => {
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

    await sendAndConfirmTx(connection, await createInstructionDeleteEntry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[1]
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set())

    await sendAndConfirmTx(connection, await createInstructionCreateEntry(
      connection,
      programId,
      userKeypair2.publicKey,
      ARBITRARY_MINTS[1],
      'SYMBOL_2',
      'NAME_2',
      'LOGO_URL_2',
      ['TAGS_2_1', 'TAGS_2_2'],
      [['EXTENSIONS_2_KEY', 'EXTENSIONS_2_VAL']]
    ), [userKeypair, userKeypair2])
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINTS[1],
        symbol: 'SYMBOL_2',
        name: 'NAME_2',
        logoURL: 'LOGO_URL_2',
        tags: ['TAGS_2_1', 'TAGS_2_2'],
        extensions: [['EXTENSIONS_2_KEY', 'EXTENSIONS_2_VAL']],
        updateAuthority: userKeypair2.publicKey
      }
    ]))

    await sendAndConfirmTx(connection, await createInstructionDeleteEntry(
      connection,
      programId,
      userKeypair2.publicKey,
      ARBITRARY_MINTS[1]
    ), [userKeypair, userKeypair2])
    expect(await getAllTokens(connection, programId)).toEqual(new Set())
  }, TEST_TIMEOUT)

  test.concurrent('DeleteEntry with invalid authority', async () => {
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
      await sendAndConfirmTx(connection, await createInstructionDeleteEntry(
        connection,
        programId,
        userKeypair2.publicKey,
        ARBITRARY_MINTS[1]
      ), [userKeypair, userKeypair2])
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::InvalidTokenUpdateAuthority/)
    }
  }, TEST_TIMEOUT)

  test.concurrent('Create, Update, and Delete multiple mints', async () => {
    const connection = getConnection()
    const programId = await deployProgram(connection, userKeypair)

    /* Give 1 SOL to userKeypair2 and userKeypair3 */
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

    await sendAndConfirmTx(connection, await createInstructionCreateEntry(
      connection,
      programId,
      userKeypair2.publicKey,
      ARBITRARY_MINTS[2],
      'SYMBOL_2',
      'NAME_2',
      'LOGO_URL_2',
      ['TAGS_2_1', 'TAGS_2_2'],
      [['EXTENSIONS_2_KEY', 'EXTENSIONS_2_VAL']]
    ), [userKeypair, userKeypair2])
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINTS[2],
        symbol: 'SYMBOL_2',
        name: 'NAME_2',
        logoURL: 'LOGO_URL_2',
        tags: ['TAGS_2_1', 'TAGS_2_2'],
        extensions: [['EXTENSIONS_2_KEY', 'EXTENSIONS_2_VAL']],
        updateAuthority: userKeypair2.publicKey
      },
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

    await sendAndConfirmTx(connection, await createInstructionDeleteEntry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[1]
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINTS[2],
        symbol: 'SYMBOL_2',
        name: 'NAME_2',
        logoURL: 'LOGO_URL_2',
        tags: ['TAGS_2_1', 'TAGS_2_2'],
        extensions: [['EXTENSIONS_2_KEY', 'EXTENSIONS_2_VAL']],
        updateAuthority: userKeypair2.publicKey
      }
    ]))

    await sendAndConfirmTx(connection, await createInstructionUpdateEntry(
      connection,
      programId,
      userKeypair2.publicKey,
      ARBITRARY_MINTS[2],
      'SYMBOL_2_NEW',
      'NAME_2_NEW',
      'LOGO_URL_2_NEW',
      ['TAGS_2_1_NEW', 'TAGS_2_2_NEW'],
      [['EXTENSIONS_2_KEY_NEW', 'EXTENSIONS_2_VAL_NEW']]
    ), [userKeypair, userKeypair2])
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINTS[2],
        symbol: 'SYMBOL_2_NEW',
        name: 'NAME_2_NEW',
        logoURL: 'LOGO_URL_2_NEW',
        tags: ['TAGS_2_1_NEW', 'TAGS_2_2_NEW'],
        extensions: [['EXTENSIONS_2_KEY_NEW', 'EXTENSIONS_2_VAL_NEW']],
        updateAuthority: userKeypair2.publicKey
      }
    ]))

    await sendAndConfirmTx(connection, await createInstructionCreateEntry(
      connection,
      programId,
      userKeypair3.publicKey,
      ARBITRARY_MINTS[1],
      'SYMBOL_1',
      'NAME_1',
      'LOGO_URL_1',
      ['TAGS_1_1', 'TAGS_1_2'],
      [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']]
    ), [userKeypair, userKeypair3])
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINTS[2],
        symbol: 'SYMBOL_2_NEW',
        name: 'NAME_2_NEW',
        logoURL: 'LOGO_URL_2_NEW',
        tags: ['TAGS_2_1_NEW', 'TAGS_2_2_NEW'],
        extensions: [['EXTENSIONS_2_KEY_NEW', 'EXTENSIONS_2_VAL_NEW']],
        updateAuthority: userKeypair2.publicKey
      },
      {
        mint: ARBITRARY_MINTS[1],
        symbol: 'SYMBOL_1',
        name: 'NAME_1',
        logoURL: 'LOGO_URL_1',
        tags: ['TAGS_1_1', 'TAGS_1_2'],
        extensions: [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']],
        updateAuthority: userKeypair3.publicKey
      }
    ]))

    await sendAndConfirmTx(connection, await createInstructionDeleteEntry(
      connection,
      programId,
      userKeypair2.publicKey,
      ARBITRARY_MINTS[2]
    ), [userKeypair, userKeypair2])
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINTS[1],
        symbol: 'SYMBOL_1',
        name: 'NAME_1',
        logoURL: 'LOGO_URL_1',
        tags: ['TAGS_1_1', 'TAGS_1_2'],
        extensions: [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']],
        updateAuthority: userKeypair3.publicKey
      }
    ]))
  }, TEST_TIMEOUT)
})
