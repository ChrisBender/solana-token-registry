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
  connection,
  userKeypair,
  deployProgram,
  sendAndConfirmTx
} from './utils'

describe('UpdateFees', () => {
  beforeEach(deployProgram)

  it('Read-over-write for UpdateFees', async () => {
    expect.assertions(1)

    await sendAndConfirmTx(await createInstructionInitializeRegistry(
      connection,
      userKeypair.publicKey,
      USDT_PUBLICKEY,
      ARBITRARY_USER_ACCOUNT,
      ARBITRARY_BIGINT
    ))
    await sendAndConfirmTx(await createInstructionUpdateFees(
      connection,
      userKeypair.publicKey,
      ARBITRARY_TOKEN_ACCOUNT,
      ARBITRARY_USER_ACCOUNT,
      ARBITRARY_BIGINT
    ))

    const registryState = await getRegistryState(connection)
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
