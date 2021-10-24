import {
  getAllTokens,
  createInstructionInitializeRegistry,
  createInstructionCreateEntry
} from '../index'

import {
  TEST_TIMEOUT,
  ARBITRARY_MINT_1,
  ARBITRARY_MINT_2,
  ARBITRARY_USER_1,
  ARBITRARY_BIGINT_1,
  getConnection,
  userKeypair,
  deployProgram,
  sendAndConfirmTx
} from './utils'

describe('CreateEntry', () => {
  test.concurrent('Read-over-write for CreateEntry', async () => {
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
    expect(await getAllTokens(connection, programId)).toEqual([])

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
    expect(await getAllTokens(connection, programId)).toEqual([
      {
        mint: ARBITRARY_MINT_2,
        symbol: 'SYMBOL_1',
        name: 'NAME_1',
        logoURL: 'LOGO_URL_1',
        tags: ['TAGS_1_1', 'TAGS_1_2'],
        extensions: [['EXTENSIONS_1_KEY', 'EXTENSIONS_1_VAL']],
        updateAuthority: userKeypair.publicKey
      }
    ])
  }, TEST_TIMEOUT)
})
