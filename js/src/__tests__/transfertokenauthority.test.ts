import {
  getAllTokens,
  createInstructionInitializeRegistry,
  createInstructionCreateEntry,
  createInstructionTransferTokenAuthority
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
  userKeypair3,
  deployProgram,
  sendAndConfirmTx
} from './utils'

import {
  SendTransactionError
} from '@solana/web3.js'

describe('TransferTokenAuthority', () => {
  test.concurrent('Read-over-write for TransferTokenAuthority', async () => {
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

    await sendAndConfirmTx(connection, await createInstructionTransferTokenAuthority(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[1],
      userKeypair2.publicKey
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINTS[1],
        symbol: 'SYMBOL_1',
        name: 'NAME_1',
        logoURL: 'LOGO_URL_1',
        tags: ['TAGS_1_1', 'TAGS_1_2'],
        extensions: [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']],
        updateAuthority: userKeypair2.publicKey
      }
    ]))
  }, TEST_TIMEOUT)

  test.concurrent('Read-over-write multiple times for TransferTokenAuthority', async () => {
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

    await sendAndConfirmTx(connection, await createInstructionTransferTokenAuthority(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[1],
      userKeypair2.publicKey
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINTS[1],
        symbol: 'SYMBOL_1',
        name: 'NAME_1',
        logoURL: 'LOGO_URL_1',
        tags: ['TAGS_1_1', 'TAGS_1_2'],
        extensions: [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']],
        updateAuthority: userKeypair2.publicKey
      }
    ]))

    await sendAndConfirmTx(connection, await createInstructionTransferTokenAuthority(
      connection,
      programId,
      userKeypair2.publicKey,
      ARBITRARY_MINTS[1],
      userKeypair3.publicKey
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

    await sendAndConfirmTx(connection, await createInstructionTransferTokenAuthority(
      connection,
      programId,
      userKeypair3.publicKey,
      ARBITRARY_MINTS[1],
      userKeypair.publicKey
    ), [userKeypair, userKeypair3])
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

  test.concurrent('TransferTokenAuthority to yourself is OK', async () => {
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

    await sendAndConfirmTx(connection, await createInstructionTransferTokenAuthority(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[1],
      userKeypair.publicKey
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

  test.concurrent('TransferTokenAuthority with invalid authority', async () => {
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
      await sendAndConfirmTx(connection, await createInstructionTransferTokenAuthority(
        connection,
        programId,
        userKeypair2.publicKey,
        ARBITRARY_MINTS[1],
        userKeypair3.publicKey
      ), [userKeypair, userKeypair2])
      unreachable()
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::InvalidTokenUpdateAuthority/)
    }
  }, TEST_TIMEOUT)
})
