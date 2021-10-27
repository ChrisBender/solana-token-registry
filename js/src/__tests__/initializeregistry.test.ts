import {
  getAllTokens,
  createInstructionInitializeRegistry,
  createInstructionUpdateFees,
  createInstructionCreateEntry,
  createInstructionDeleteEntry,
  createInstructionUpdateEntry,
  createInstructionTransferFeeAuthority,
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
  deployProgram,
  sendAndConfirmTx,
  assertMetaAccountEquals
} from './utils'

import {
  SendTransactionError
} from '@solana/web3.js'

describe('InitializeRegistry', () => {
  test.concurrent('Read-over-write for InitializeRegistry', async () => {
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
  }, TEST_TIMEOUT)

  test.concurrent('All transactions fail before InitializeRegistry', async () => {
    const connection = getConnection()
    const programId = await deployProgram(connection, userKeypair)

    // RegistryInstruction::UpdateFees
    try {
      await sendAndConfirmTx(connection, await createInstructionUpdateFees(
        connection,
        programId,
        userKeypair.publicKey,
        ARBITRARY_MINTS[0],
        ARBITRARY_USER_1,
        ARBITRARY_BIGINT_1
      ))
      unreachable()
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::NotYetInitialized/)
    }

    // RegistryInstruction::CreateEntry
    try {
      await sendAndConfirmTx(connection, await createInstructionCreateEntry(
        connection,
        programId,
        userKeypair.publicKey,
        ARBITRARY_MINTS[1],
        'wSUSHI',
        'SushiSwap (Wormhole)',
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HbMGwfGjGPchtaPwyrtJFy8APZN5w1hi63xnzmj1f23v/logo.png',
        ['wrapped', 'wormhole'],
        [
          ['address', '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2'],
          ['bridgeContract', 'https://etherscan.io/address/0xf92cD566Ea4864356C5491c177A430C222d7e678']
        ]
      ))
      unreachable()
    } catch (error) {
      // Note that createInstructionCreateEntry throws an error itself if the registry has not been initialized.
      expect((error as Error).message).toEqual('Registry has not yet been initialized.')
    }

    // RegistryInstruction::DeleteEntry
    try {
      await sendAndConfirmTx(connection, await createInstructionDeleteEntry(
        connection,
        programId,
        userKeypair.publicKey,
        ARBITRARY_MINTS[1]
      ))
      unreachable()
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::NotYetInitialized/)
    }

    // RegistryInstruction::UpdateEntry
    try {
      await sendAndConfirmTx(connection, await createInstructionUpdateEntry(
        connection,
        programId,
        userKeypair.publicKey,
        ARBITRARY_MINTS[1],
        'wSUSHI',
        'SushiSwap (Wormhole)',
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HbMGwfGjGPchtaPwyrtJFy8APZN5w1hi63xnzmj1f23v/logo.png',
        ['wrapped', 'wormhole'],
        [
          ['address', '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2'],
          ['bridgeContract', 'https://etherscan.io/address/0xf92cD566Ea4864356C5491c177A430C222d7e678']
        ]
      ))
      unreachable()
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::NotYetInitialized/)
    }

    // RegistryInstruction::TransferFeeAuthority
    try {
      await sendAndConfirmTx(connection, await createInstructionTransferFeeAuthority(
        connection,
        programId,
        userKeypair.publicKey,
        ARBITRARY_USER_1
      ))
      unreachable()
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::NotYetInitialized/)
    }

    // RegistryInstruction::TransferTokenAuthority
    try {
      await sendAndConfirmTx(connection, await createInstructionTransferTokenAuthority(
        connection,
        programId,
        userKeypair.publicKey,
        ARBITRARY_MINTS[1],
        ARBITRARY_USER_1
      ))
      unreachable()
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::NotYetInitialized/)
    }
  }, TEST_TIMEOUT)

  test.concurrent('Cannot InitializeRegistry twice', async () => {
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
      await sendAndConfirmTx(connection, await createInstructionInitializeRegistry(
        connection,
        programId,
        userKeypair.publicKey,
        ARBITRARY_MINTS[0],
        ARBITRARY_USER_1,
        ARBITRARY_BIGINT_1
      ))
      unreachable()
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::AlreadyInitialized/)
    }
  }, TEST_TIMEOUT)

  test.concurrent('InitializeRegistry does not create any tokens', async () => {
    const connection = getConnection()
    const programId = await deployProgram(connection, userKeypair)

    expect(await getAllTokens(connection, programId)).toEqual(new Set())
    await sendAndConfirmTx(connection, await createInstructionInitializeRegistry(
      connection,
      programId,
      userKeypair.publicKey,
      ARBITRARY_MINTS[0],
      ARBITRARY_USER_1,
      ARBITRARY_BIGINT_1
    ))
    expect(await getAllTokens(connection, programId)).toEqual(new Set())
  }, TEST_TIMEOUT)
})
