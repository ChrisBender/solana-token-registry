import {
  getAllTokens,
  getRegistryState,
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
  USDT_PUBLICKEY,
  ARBITRARY_TOKEN_ACCOUNT,
  ARBITRARY_USER_ACCOUNT,
  ARBITRARY_BIGINT,
  getConnection,
  unreachable,
  userKeypair,
  deployProgram,
  sendAndConfirmTx
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
      USDT_PUBLICKEY,
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
    expect(registryMetaAccount.feeMint).toEqual(USDT_PUBLICKEY)
    expect(registryMetaAccount.feeDestination).toEqual(ARBITRARY_USER_ACCOUNT)
    expect(registryMetaAccount.feeUpdateAuthority).toEqual(userKeypair.publicKey)
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
        USDT_PUBLICKEY,
        ARBITRARY_USER_ACCOUNT,
        ARBITRARY_BIGINT
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
        ARBITRARY_TOKEN_ACCOUNT,
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

    // RegistryInstruction::DeleteEntry
    try {
      await sendAndConfirmTx(connection, await createInstructionDeleteEntry(
        connection,
        programId,
        userKeypair.publicKey,
        ARBITRARY_TOKEN_ACCOUNT
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
        ARBITRARY_TOKEN_ACCOUNT,
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
        ARBITRARY_USER_ACCOUNT
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
        ARBITRARY_USER_ACCOUNT
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
      USDT_PUBLICKEY,
      ARBITRARY_USER_ACCOUNT,
      ARBITRARY_BIGINT
    ))
    try {
      await sendAndConfirmTx(connection, await createInstructionInitializeRegistry(
        connection,
        programId,
        userKeypair.publicKey,
        USDT_PUBLICKEY,
        ARBITRARY_USER_ACCOUNT,
        ARBITRARY_BIGINT
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

    expect(await getAllTokens(connection, programId)).toEqual([])
    await sendAndConfirmTx(connection, await createInstructionInitializeRegistry(
      connection,
      programId,
      userKeypair.publicKey,
      USDT_PUBLICKEY,
      ARBITRARY_USER_ACCOUNT,
      ARBITRARY_BIGINT
    ))
    expect(await getAllTokens(connection, programId)).toEqual([])
  }, TEST_TIMEOUT)
})
