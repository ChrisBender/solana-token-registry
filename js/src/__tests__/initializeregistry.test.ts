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
  connection,
  userKeypair,
  deployProgram,
  sendAndConfirmTx
} from './utils'

import {
  SendTransactionError
} from '@solana/web3.js'

describe('InitializeRegistry', () => {
  beforeEach(deployProgram)

  it('Read-over-write for InitializeRegistry', async () => {
    expect.assertions(4)

    await sendAndConfirmTx(await createInstructionInitializeRegistry(
      connection,
      userKeypair.publicKey,
      USDT_PUBLICKEY,
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
    expect(registryMetaAccount.feeMint).toEqual(USDT_PUBLICKEY)
    expect(registryMetaAccount.feeDestination).toEqual(ARBITRARY_USER_ACCOUNT)
    expect(registryMetaAccount.feeUpdateAuthority).toEqual(userKeypair.publicKey)
  }, TEST_TIMEOUT)

  it('All transactions fail before InitializeRegistry', async () => {
    expect.assertions(6)

    // RegistryInstruction::UpdateFees
    try {
      await sendAndConfirmTx(await createInstructionUpdateFees(
        connection,
        userKeypair.publicKey,
        USDT_PUBLICKEY,
        ARBITRARY_USER_ACCOUNT,
        ARBITRARY_BIGINT
      ))
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::NotYetInitialized/)
    }

    // RegistryInstruction::CreateEntry
    try {
      await sendAndConfirmTx(await createInstructionCreateEntry(
        connection,
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
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::NotYetInitialized/)
    }

    // RegistryInstruction::DeleteEntry
    try {
      await sendAndConfirmTx(await createInstructionDeleteEntry(
        connection,
        userKeypair.publicKey,
        ARBITRARY_TOKEN_ACCOUNT
      ))
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::NotYetInitialized/)
    }

    // RegistryInstruction::UpdateEntry
    try {
      await sendAndConfirmTx(await createInstructionUpdateEntry(
        connection,
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
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::NotYetInitialized/)
    }

    // RegistryInstruction::TransferFeeAuthority
    try {
      await sendAndConfirmTx(await createInstructionTransferFeeAuthority(
        connection,
        userKeypair.publicKey,
        ARBITRARY_USER_ACCOUNT
      ))
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::NotYetInitialized/)
    }

    // RegistryInstruction::TransferTokenAuthority
    try {
      await sendAndConfirmTx(await createInstructionTransferTokenAuthority(
        connection,
        userKeypair.publicKey,
        ARBITRARY_USER_ACCOUNT
      ))
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::NotYetInitialized/)
    }
  }, TEST_TIMEOUT)

  it('Cannot InitializeRegistry twice', async () => {
    expect.assertions(1)
    await sendAndConfirmTx(await createInstructionInitializeRegistry(
      connection,
      userKeypair.publicKey,
      USDT_PUBLICKEY,
      ARBITRARY_USER_ACCOUNT,
      ARBITRARY_BIGINT
    ))
    try {
      await sendAndConfirmTx(await createInstructionInitializeRegistry(
        connection,
        userKeypair.publicKey,
        USDT_PUBLICKEY,
        ARBITRARY_USER_ACCOUNT,
        ARBITRARY_BIGINT
      ))
    } catch (error) {
      const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
      expect(txLogs).toMatch(/RegistryError::AlreadyInitialized/)
    }
  }, TEST_TIMEOUT)

  it('InitializeRegistry does not create any tokens', async () => {
    expect(await getAllTokens(connection)).toEqual([])
    await sendAndConfirmTx(await createInstructionInitializeRegistry(
      connection,
      userKeypair.publicKey,
      USDT_PUBLICKEY,
      ARBITRARY_USER_ACCOUNT,
      ARBITRARY_BIGINT
    ))
    expect(await getAllTokens(connection)).toEqual([])
  }, TEST_TIMEOUT)
})
