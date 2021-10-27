import {
  createInstructionInitializeRegistry,
  createInstructionTransferFeeAuthority
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
  assertMetaAccountEquals
} from './utils'

import {
  SendTransactionError
} from '@solana/web3.js'

describe('TransferFeeAuthority', () => {
  test.concurrent('Read-over-write for TransferFeeAuthority', async () => {
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

    await sendAndConfirmTx(connection, await createInstructionTransferFeeAuthority(
      connection,
      programId,
      userKeypair.publicKey,
      userKeypair2.publicKey
    ))
    await assertMetaAccountEquals(
      connection,
      programId,
      ARBITRARY_BIGINT_1,
      ARBITRARY_MINTS[0],
      ARBITRARY_USER_1,
      userKeypair2.publicKey
    )
  }, TEST_TIMEOUT)

  test.concurrent('Read-over-write multiple times for TransferFeeAuthority', async () => {
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

    await sendAndConfirmTx(connection, await createInstructionTransferFeeAuthority(
      connection,
      programId,
      userKeypair.publicKey,
      userKeypair2.publicKey
    ))
    await assertMetaAccountEquals(
      connection,
      programId,
      ARBITRARY_BIGINT_1,
      ARBITRARY_MINTS[0],
      ARBITRARY_USER_1,
      userKeypair2.publicKey
    )

    await sendAndConfirmTx(connection, await createInstructionTransferFeeAuthority(
      connection,
      programId,
      userKeypair2.publicKey,
      userKeypair.publicKey
    ), [userKeypair, userKeypair2])
    await assertMetaAccountEquals(
      connection,
      programId,
      ARBITRARY_BIGINT_1,
      ARBITRARY_MINTS[0],
      ARBITRARY_USER_1,
      userKeypair.publicKey
    )
  }, TEST_TIMEOUT)

  test.concurrent('TransferFeeAuthority to yourself is OK', async () => {
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

    await sendAndConfirmTx(connection, await createInstructionTransferFeeAuthority(
      connection,
      programId,
      userKeypair.publicKey,
      userKeypair.publicKey
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

  test.concurrent('TransferFeeAuthority with invalid authority', async () => {
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

    try {
      await sendAndConfirmTx(connection, await createInstructionTransferFeeAuthority(
        connection,
        programId,
        userKeypair2.publicKey,
        userKeypair2.publicKey
      ), [userKeypair, userKeypair2])
      unreachable()
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::InvalidFeeUpdateAuthority/)
    }
  }, TEST_TIMEOUT)
})
