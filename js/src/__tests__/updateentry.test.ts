import {
  getAllTokens,
  createInstructionInitializeRegistry,
  createInstructionCreateEntry,
  createInstructionUpdateEntry
} from '../index'

import {
  TEST_TIMEOUT,
  ARBITRARY_MINT_1,
  ARBITRARY_MINT_2,
  ARBITRARY_USER_1,
  ARBITRARY_BIGINT_1,
  getConnection,
  unreachable,
  userKeypair,
  userKeypair2,
  deployProgram,
  sendAndConfirmTx
} from './utils'

import {
  SendTransactionError
} from '@solana/web3.js'

describe('UpdateEntry', () => {
  test.concurrent('Read-over-write for UpdateEntry', async () => {
    const connection = getConnection()
    const programId = await deployProgram(connection, userKeypair)

    await sendAndConfirmTx(connection, await createInstructionInitializeRegistry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINT_1,
      ARBITRARY_USER_1,
      ARBITRARY_BIGINT_1
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set())

    await sendAndConfirmTx(connection, await createInstructionCreateEntry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINT_2,
      'SYMBOL_1',
      'NAME_1',
      'LOGO_URL_1',
      ['TAGS_1_1', 'TAGS_1_2'],
      [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']]
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINT_2,
        symbol: 'SYMBOL_1',
        name: 'NAME_1',
        logoURL: 'LOGO_URL_1',
        tags: ['TAGS_1_1', 'TAGS_1_2'],
        extensions: [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']],
        updateAuthority: userKeypair.publicKey
      }
    ]))

    await sendAndConfirmTx(connection, await createInstructionUpdateEntry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINT_2,
      'SYMBOL_1_NEW',
      'NAME_1_NEW',
      'LOGO_URL_1_NEW',
      ['TAGS_1_1_NEW', 'TAGS_1_2_NEW'],
      [['EXTENSIONS_1_KEY_NEW', 'EXTENSIONS_1_VAL_NEW']]
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINT_2,
        symbol: 'SYMBOL_1_NEW',
        name: 'NAME_1_NEW',
        logoURL: 'LOGO_URL_1_NEW',
        tags: ['TAGS_1_1_NEW', 'TAGS_1_2_NEW'],
        extensions: [['EXTENSIONS_1_KEY_NEW', 'EXTENSIONS_1_VAL_NEW']],
        updateAuthority: userKeypair.publicKey
      }
    ]))
  }, TEST_TIMEOUT)

  test.concurrent('Read-over-write multiple times for UpdateEntry', async () => {
    const connection = getConnection()
    const programId = await deployProgram(connection, userKeypair)

    await sendAndConfirmTx(connection, await createInstructionInitializeRegistry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINT_1,
      ARBITRARY_USER_1,
      ARBITRARY_BIGINT_1
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set())

    await sendAndConfirmTx(connection, await createInstructionCreateEntry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINT_2,
      'SYMBOL_1',
      'NAME_1',
      'LOGO_URL_1',
      ['TAGS_1_1', 'TAGS_1_2'],
      [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']]
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINT_2,
        symbol: 'SYMBOL_1',
        name: 'NAME_1',
        logoURL: 'LOGO_URL_1',
        tags: ['TAGS_1_1', 'TAGS_1_2'],
        extensions: [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']],
        updateAuthority: userKeypair.publicKey
      }
    ]))

    await sendAndConfirmTx(connection, await createInstructionUpdateEntry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINT_2,
      'SYMBOL_1_NEW',
      'NAME_1_NEW',
      'LOGO_URL_1_NEW',
      ['TAGS_1_1_NEW', 'TAGS_1_2_NEW'],
      [['EXTENSIONS_1_KEY_NEW', 'EXTENSIONS_1_VAL_NEW']]
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINT_2,
        symbol: 'SYMBOL_1_NEW',
        name: 'NAME_1_NEW',
        logoURL: 'LOGO_URL_1_NEW',
        tags: ['TAGS_1_1_NEW', 'TAGS_1_2_NEW'],
        extensions: [['EXTENSIONS_1_KEY_NEW', 'EXTENSIONS_1_VAL_NEW']],
        updateAuthority: userKeypair.publicKey
      }
    ]))

    await sendAndConfirmTx(connection, await createInstructionUpdateEntry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINT_2,
      'SYMBOL_1_NEW2',
      'NAME_1_NEW2',
      'LOGO_URL_1_NEW2',
      ['TAGS_1_1_NEW2', 'TAGS_1_2_NEW2'],
      [['EXTENSIONS_1_KEY_NEW2', 'EXTENSIONS_1_VAL_NEW2']]
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINT_2,
        symbol: 'SYMBOL_1_NEW2',
        name: 'NAME_1_NEW2',
        logoURL: 'LOGO_URL_1_NEW2',
        tags: ['TAGS_1_1_NEW2', 'TAGS_1_2_NEW2'],
        extensions: [['EXTENSIONS_1_KEY_NEW2', 'EXTENSIONS_1_VAL_NEW2']],
        updateAuthority: userKeypair.publicKey
      }
    ]))
  }, TEST_TIMEOUT)

  test.concurrent('UpdateEntry with invalid authority', async () => {
    const connection = getConnection()
    const programId = await deployProgram(connection, userKeypair)

    await sendAndConfirmTx(connection, await createInstructionInitializeRegistry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINT_1,
      ARBITRARY_USER_1,
      ARBITRARY_BIGINT_1
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set())

    await sendAndConfirmTx(connection, await createInstructionCreateEntry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINT_2,
      'SYMBOL_1',
      'NAME_1',
      'LOGO_URL_1',
      ['TAGS_1_1', 'TAGS_1_2'],
      [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']]
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set([
      {
        mint: ARBITRARY_MINT_2,
        symbol: 'SYMBOL_1',
        name: 'NAME_1',
        logoURL: 'LOGO_URL_1',
        tags: ['TAGS_1_1', 'TAGS_1_2'],
        extensions: [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']],
        updateAuthority: userKeypair.publicKey
      }
    ]))

    try {
      await sendAndConfirmTx(connection, await createInstructionUpdateEntry(
        connection,
        programId,
        userKeypair2.publicKey, // This pubkey does not match userKeypair.publicKey
        ARBITRARY_MINT_2,
        'SYMBOL_1_NEW',
        'NAME_1_NEW',
        'LOGO_URL_1_NEW',
        ['TAGS_1_1_NEW', 'TAGS_1_2_NEW'],
        [['EXTENSIONS_1_KEY_NEW', 'EXTENSIONS_1_VAL_NEW']]
      ), [userKeypair, userKeypair2])
      unreachable()
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::InvalidTokenUpdateAuthority/)
    }
  }, TEST_TIMEOUT)

  test.concurrent('UpdateEntry on a non-existent entry', async () => {
    const connection = getConnection()
    const programId = await deployProgram(connection, userKeypair)

    await sendAndConfirmTx(connection, await createInstructionInitializeRegistry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINT_1,
      ARBITRARY_USER_1,
      ARBITRARY_BIGINT_1
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set())

    try {
      await sendAndConfirmTx(connection, await createInstructionUpdateEntry(
        connection,
        programId,
        userKeypair.publicKey,
        ARBITRARY_MINT_2,
        'SYMBOL_1',
        'NAME_1',
        'LOGO_URL_1',
        ['TAGS_1_1', 'TAGS_1_2'],
        [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']]
      ))
      unreachable()
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::NotYetRegisteredMint/)
    }
  }, TEST_TIMEOUT)
})
