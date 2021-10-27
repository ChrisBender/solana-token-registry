import {
  createInstructionInitializeRegistry,
  createInstructionUpdateFees
} from '../index'

import {
  TEST_TIMEOUT,
  ARBITRARY_MINTS,
  ARBITRARY_USER_1,
  ARBITRARY_USER_2,
  ARBITRARY_BIGINT_1,
  ARBITRARY_BIGINT_2,
  getConnection,
  userKeypair,
  deployProgram,
  sendAndConfirmTx,
  assertMetaAccountEquals
} from './utils'

describe('UpdateFees', () => {
  test.concurrent('Read-over-write for UpdateFees', async () => {
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
    await assertMetaAccountEquals(
      connection,
      programId,
      ARBITRARY_BIGINT_1,
      ARBITRARY_MINTS[0],
      ARBITRARY_USER_1,
      userKeypair.publicKey
    )

    await sendAndConfirmTx(connection, await createInstructionUpdateFees(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[1],
      ARBITRARY_USER_2,
      ARBITRARY_BIGINT_2
    ))
    await assertMetaAccountEquals(
      connection,
      programId,
      ARBITRARY_BIGINT_2,
      ARBITRARY_MINTS[1],
      ARBITRARY_USER_2,
      userKeypair.publicKey
    )
  }, TEST_TIMEOUT)

  test.concurrent('Read-over-write for UpdateFees twice', async () => {
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
    await sendAndConfirmTx(connection, await createInstructionUpdateFees(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[1],
      ARBITRARY_USER_2,
      ARBITRARY_BIGINT_2
    ))
    await assertMetaAccountEquals(
      connection,
      programId,
      ARBITRARY_BIGINT_2,
      ARBITRARY_MINTS[1],
      ARBITRARY_USER_2,
      userKeypair.publicKey
    )
    await sendAndConfirmTx(connection, await createInstructionUpdateFees(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[0],
      ARBITRARY_USER_1,
      ARBITRARY_BIGINT_1
    ))
    await assertMetaAccountEquals(
      connection,
      programId,
      ARBITRARY_BIGINT_1,
      ARBITRARY_MINTS[0],
      ARBITRARY_USER_1,
      userKeypair.publicKey
    )
  }, TEST_TIMEOUT)
})
