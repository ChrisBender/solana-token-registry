import {
  getRegistryState,
  createInstructionInitializeRegistry,
  createInstructionUpdateFees
} from '../index'

import {
  TEST_TIMEOUT,
  USDT_PUBLICKEY,
  ARBITRARY_TOKEN_ACCOUNT,
  ARBITRARY_USER_ACCOUNT,
  ARBITRARY_BIGINT,
  getConnection,
  userKeypair,
  deployProgram,
  sendAndConfirmTx
} from './utils'

describe('UpdateFees', () => {
  test.concurrent('Read-over-write for UpdateFees', async () => {
    const connection = getConnection()
    const programId = await deployProgram(connection, userKeypair)

    await sendAndConfirmTx(connection, await createInstructionInitializeRegistry(
      connection,
      programId,
      userKeypair.publicKey,
      USDT_PUBLICKEY,
      ARBITRARY_USER_ACCOUNT,
      ARBITRARY_BIGINT
    ))
    await sendAndConfirmTx(connection, await createInstructionUpdateFees(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_TOKEN_ACCOUNT,
      ARBITRARY_USER_ACCOUNT,
      ARBITRARY_BIGINT
    ))

    const registryState = await getRegistryState(connection, programId)
    let registryMetaAccount
    if (registryState === null) {
      return
    } else {
      registryMetaAccount = registryState[0]
    }

    expect(registryMetaAccount.feeAmount).toEqual(ARBITRARY_BIGINT)
    expect(registryMetaAccount.feeMint).toEqual(ARBITRARY_TOKEN_ACCOUNT)
    expect(registryMetaAccount.feeDestination).toEqual(ARBITRARY_USER_ACCOUNT)
    expect(registryMetaAccount.feeUpdateAuthority).toEqual(userKeypair.publicKey)
  }, TEST_TIMEOUT)
})
