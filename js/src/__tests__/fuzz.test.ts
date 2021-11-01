import {
  createInstructionInitializeRegistry,
  createInstructionUpdateFees,
  createInstructionCreateEntry,
  createInstructionDeleteEntry,
  createInstructionUpdateEntry,
  createInstructionTransferFeeAuthority,
  createInstructionTransferTokenAuthority,
  RegistryMetaAccount,
  RegistryNodeAccount,
  getRegistryState,
  getPDA
} from '../index'

import {
  getConnection,
  unreachable,
  deployProgram,
  sendAndConfirmTx,
  userKeypair
} from './utils'

import {
  PublicKey,
  Keypair,
  SendTransactionError,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'

import {
  TOKEN_PROGRAM_ID,
  Token
} from '@solana/spl-token'

import { create } from 'random-seed'

function randomElement (rng: any, array: any[]): any {
  return array[rng.range(array.length)]
}

const VERBOSE = false
const NUM_INSTRUCTIONS = 200

describe('Fuzz', () => {
  test.concurrent('Random fuzz test', async () => {
    const connection = getConnection()
    const tempKeypair = Keypair.generate()
    await sendAndConfirmTx(
      connection,
      SystemProgram.transfer({
        fromPubkey: userKeypair.publicKey,
        lamports: 1 * LAMPORTS_PER_SOL,
        toPubkey: tempKeypair.publicKey
      })
    )

    const programId = await deployProgram(connection, tempKeypair)

    const USERS = []
    for (let i = 0; i < 5; i++) {
      const keypair = Keypair.generate()
      await sendAndConfirmTx(
        connection,
        SystemProgram.transfer({
          fromPubkey: userKeypair.publicKey,
          lamports: 1 * LAMPORTS_PER_SOL,
          toPubkey: keypair.publicKey
        })
      )
      USERS.push(keypair)
    }

    const MINTS = []
    for (let i = 0; i < 5; i++) {
      const token = await Token.createMint(
        connection,
        tempKeypair,
        tempKeypair.publicKey,
        null,
        9,
        TOKEN_PROGRAM_ID
      )
      MINTS.push(token.publicKey)
      for (const user of USERS) {
        const userATA = await token.createAssociatedTokenAccount(user.publicKey)
        await token.mintTo(userATA, tempKeypair, [], 1e10)
      }
    }

    const SYSTEM_ACCTS = []
    for (let i = 0; i < 5; i++) {
      SYSTEM_ACCTS.push(Keypair.generate().publicKey)
    }
    const BIGINTS = [
      BigInt(1000000000),
      BigInt(1000000001),
      BigInt(1000000002),
      BigInt(1000000003),
      BigInt(1000000004)
    ]

    const rng = create('')
    let localState: null | [RegistryMetaAccount, RegistryNodeAccount[]] = null

    for (let i = 0; i < NUM_INSTRUCTIONS; i++) {
      expect(await getRegistryState(connection, programId)).toEqual(localState)
      switch (rng.range(7)) {
        // InitializeRegistry
        case 0: {
          if (VERBOSE) {
            console.log('InitializeRegistry')
          }
          const ix = await createInstructionInitializeRegistry(
            connection,
            programId,
            USERS[0].publicKey,
            MINTS[0],
            SYSTEM_ACCTS[0],
            BIGINTS[0]
          )
          if (localState == null) {
            await sendAndConfirmTx(connection, ix, [USERS[0]])
            localState = [
              {
                publicKey: await getPDA('meta', programId),
                feeAmount: BIGINTS[0],
                feeMint: MINTS[0],
                feeDestination: SYSTEM_ACCTS[0],
                feeUpdateAuthority: USERS[0].publicKey
              },
              [
                {
                  publicKey: await getPDA('head', programId),
                  nextRegistryNode: await getPDA('tail', programId),
                  mint: PublicKey.default,
                  symbol: '',
                  name: '',
                  logoURL: '',
                  tags: [],
                  extensions: [],
                  updateAuthority: PublicKey.default,
                  deleted: false
                },
                {
                  publicKey: await getPDA('tail', programId),
                  nextRegistryNode: PublicKey.default,
                  mint: PublicKey.default,
                  symbol: '',
                  name: '',
                  logoURL: '',
                  tags: [],
                  extensions: [],
                  updateAuthority: PublicKey.default,
                  deleted: false
                }
              ]
            ]
          } else {
            try {
              await sendAndConfirmTx(connection, ix, [USERS[0]])
              unreachable()
            } catch (error) {
              const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
              expect(txLogs).toMatch(/RegistryError::AlreadyInitialized/)
            }
          }
          break
        }

        // UpdateFees
        case 1: {
          if (VERBOSE) {
            console.log('UpdateFees')
          }
          const user = randomElement(rng, USERS)
          const feeMint = randomElement(rng, MINTS)
          const feeDestination = randomElement(rng, SYSTEM_ACCTS)
          const feeAmount = randomElement(rng, BIGINTS)

          const ix = await createInstructionUpdateFees(
            connection,
            programId,
            user.publicKey,
            feeMint,
            feeDestination,
            feeAmount
          )
          if (localState == null) {
            try {
              await sendAndConfirmTx(connection, ix, [user])
              unreachable()
            } catch (error) {
              const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
              expect(txLogs).toMatch(/RegistryError::NotYetInitialized/)
            }
            break
          }
          if (user.publicKey.toString() === localState[0].feeUpdateAuthority.toString()) {
            await sendAndConfirmTx(connection, ix, [user])
            localState[0].feeAmount = feeAmount
            localState[0].feeMint = feeMint
            localState[0].feeDestination = feeDestination
          } else {
            try {
              await sendAndConfirmTx(connection, ix, [user])
              unreachable()
            } catch (error) {
              const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
              expect(txLogs).toMatch(/RegistryError::InvalidFeeUpdateAuthority/)
            }
          }
          break
        }

        // CreateEntry
        case 2: {
          if (VERBOSE) {
            console.log('CreateEntry')
          }
          const user = randomElement(rng, USERS)
          const mint = randomElement(rng, MINTS)
          const tokenSymbol = rng.string(8)
          const tokenName = rng.string(16)
          const tokenLogoURL = rng.string(128)
          const tokenTags = [rng.string(16), rng.string(16)]
          const tokenExtensions = [
            [rng.string(16), rng.string(64)],
            [rng.string(16), rng.string(64)]
          ] as Array<[string, string]>

          let ix
          try {
            ix = await createInstructionCreateEntry(
              connection,
              programId,
              user.publicKey,
              mint,
              tokenSymbol,
              tokenName,
              tokenLogoURL,
              tokenTags,
              tokenExtensions
            )
          } catch (error) {
            if (localState == null) {
              expect((error as Error).message).toEqual('Registry has not yet been initialized.')
              break
            } else {
              unreachable()
              break
            }
          }
          if (localState === null) {
            unreachable()
          } else {
            if (localState[1].some(
              (node) => node.mint.toString() === mint.toString() && !node.deleted
            )) {
              try {
                await sendAndConfirmTx(connection, ix, [user])
                unreachable()
              } catch (error) {
                const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
                expect(txLogs).toMatch(/RegistryError::PreviouslyRegisteredMint/)
              }
            } else {
              await sendAndConfirmTx(connection, ix, [user])
              if (localState[1].some(
                (node) => node.mint.toString() === mint.toString() && node.deleted
              )) {
                for (const node of localState[1]) {
                  if (node.mint.toString() === mint.toString() && node.deleted) {
                    node.symbol = tokenSymbol
                    node.name = tokenName
                    node.logoURL = tokenLogoURL
                    node.tags = tokenTags
                    node.extensions = tokenExtensions
                    node.updateAuthority = user.publicKey
                    node.deleted = false
                    break
                  }
                }
              } else {
                localState[1][0].nextRegistryNode = await getPDA(mint.toBytes(), programId)
                localState[1].splice(1, 0, {
                  publicKey: await getPDA(mint.toBytes(), programId),
                  nextRegistryNode: localState[1][1].publicKey,
                  mint: mint,
                  symbol: tokenSymbol,
                  name: tokenName,
                  logoURL: tokenLogoURL,
                  tags: tokenTags,
                  extensions: tokenExtensions,
                  updateAuthority: user.publicKey,
                  deleted: false
                })
              }
            }
          }
          break
        }

        // DeleteEntry
        case 3: {
          if (VERBOSE) {
            console.log('DeleteEntry')
          }
          const user = randomElement(rng, USERS)
          const mint = randomElement(rng, MINTS)
          const ix = await createInstructionDeleteEntry(
            connection,
            programId,
            user.publicKey,
            mint
          )
          if (localState == null) {
            try {
              await sendAndConfirmTx(connection, ix, [user])
              unreachable()
            } catch (error) {
              const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
              expect(txLogs).toMatch(/RegistryError::NotYetInitialized/)
            }
            break
          } else {
            if (localState[1].some(
              (node) => node.mint.toString() === mint.toString() &&
                !node.deleted &&
                node.updateAuthority.toString() === user.publicKey.toString()
            )) {
              // If the mint exists, is not deleted, and we have valid update
              // authority, tx should succeed.
              await sendAndConfirmTx(connection, ix, [user])
              for (const node of localState[1]) {
                if (node.mint.toString() === mint.toString()) {
                  node.deleted = true
                  break
                }
              }
            } else if (!localState[1].some(
              (node) => node.mint.toString() === mint.toString()
            )) {
              // If the mint does not exist, tx should yield NotYetRegisteredMint.
              try {
                await sendAndConfirmTx(connection, ix, [user])
                unreachable()
              } catch (error) {
                const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
                expect(txLogs).toMatch(/RegistryError::NotYetRegisteredMint/)
              }
            } else if (localState[1].some(
              (node) => node.mint.toString() === mint.toString() &&
                node.updateAuthority.toString() !== user.publicKey.toString()
            )) {
              // If invalid authority, tx should yield InvalidTokenUpdateAuthority.
              try {
                await sendAndConfirmTx(connection, ix, [user])
                unreachable()
              } catch (error) {
                const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
                expect(txLogs).toMatch(/RegistryError::InvalidTokenUpdateAuthority/)
              }
            } else {
              // If the mint exists but has been deleted, tx should yield PreviouslyDeletedMint.
              try {
                await sendAndConfirmTx(connection, ix, [user])
                unreachable()
              } catch (error) {
                const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
                expect(txLogs).toMatch(/RegistryError::PreviouslyDeletedMint/)
              }
            }
          }
          break
        }

        // UpdateEntry
        case 4: {
          if (VERBOSE) {
            console.log('UpdateEntry')
          }
          const user = randomElement(rng, USERS)
          const mint = randomElement(rng, MINTS)
          const tokenSymbol = rng.string(8)
          const tokenName = rng.string(16)
          const tokenLogoURL = rng.string(128)
          const tokenTags = [rng.string(16), rng.string(16)]
          const tokenExtensions = [
            [rng.string(16), rng.string(64)],
            [rng.string(16), rng.string(64)]
          ] as Array<[string, string]>

          const ix = await createInstructionUpdateEntry(
            connection,
            programId,
            user.publicKey,
            mint,
            tokenSymbol,
            tokenName,
            tokenLogoURL,
            tokenTags,
            tokenExtensions
          )
          if (localState === null) {
            try {
              await sendAndConfirmTx(connection, ix, [user])
              unreachable()
            } catch (error) {
              const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
              expect(txLogs).toMatch(/RegistryError::NotYetInitialized/)
            }
            break
          } else {
            if (!localState[1].some(
              (node) => node.mint.toString() === mint.toString()
            )) {
              // If the mint does not exist, tx should yield NotYetRegisteredMint.
              try {
                await sendAndConfirmTx(connection, ix, [user])
                unreachable()
              } catch (error) {
                const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
                expect(txLogs).toMatch(/RegistryError::NotYetRegisteredMint/)
              }
            } else if (localState[1].some(
              (node) => node.mint.toString() === mint.toString() &&
                node.updateAuthority.toString() !== user.publicKey.toString()
            )) {
              // If invalid authority, tx should yield InvalidTokenUpdateAuthority.
              try {
                await sendAndConfirmTx(connection, ix, [user])
                unreachable()
              } catch (error) {
                const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
                expect(txLogs).toMatch(/RegistryError::InvalidTokenUpdateAuthority/)
              }
            } else {
              await sendAndConfirmTx(connection, ix, [user])
              for (const node of localState[1]) {
                if (node.mint.toString() === mint.toString()) {
                  node.symbol = tokenSymbol
                  node.name = tokenName
                  node.logoURL = tokenLogoURL
                  node.tags = tokenTags
                  node.extensions = tokenExtensions
                  break
                }
              }
            }
          }
          break
        }

        // TransferFeeAuthority
        case 5: {
          if (VERBOSE) {
            console.log('TransferFeeAuthority')
          }
          const user = randomElement(rng, USERS)
          const newFeeAuthority = randomElement(rng, SYSTEM_ACCTS)
          const ix = await createInstructionTransferFeeAuthority(
            connection,
            programId,
            user.publicKey,
            newFeeAuthority
          )
          if (localState == null) {
            try {
              await sendAndConfirmTx(connection, ix, [user])
              unreachable()
            } catch (error) {
              const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
              expect(txLogs).toMatch(/RegistryError::NotYetInitialized/)
            }
            break
          } else {
            if (localState[0].feeUpdateAuthority.toString() !== user.publicKey.toString()) {
              // If invalid authority, tx should yield InvalidFeeUpdateAuthority.
              try {
                await sendAndConfirmTx(connection, ix, [user])
                unreachable()
              } catch (error) {
                const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
                expect(txLogs).toMatch(/RegistryError::InvalidFeeUpdateAuthority/)
              }
            } else {
              await sendAndConfirmTx(connection, ix, [user])
              localState[0].feeUpdateAuthority = newFeeAuthority
            }
          }
          break
        }

        // TransferTokenAuthority
        case 6: {
          if (VERBOSE) {
            console.log('TransferTokenAuthority')
          }
          const user = randomElement(rng, USERS)
          const mint = randomElement(rng, MINTS)
          const newTokenAuthority = randomElement(rng, SYSTEM_ACCTS)
          const ix = await createInstructionTransferTokenAuthority(
            connection,
            programId,
            user.publicKey,
            mint,
            newTokenAuthority
          )
          if (localState == null) {
            try {
              await sendAndConfirmTx(connection, ix, [user])
              unreachable()
            } catch (error) {
              const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
              expect(txLogs).toMatch(/RegistryError::NotYetInitialized/)
            }
            break
          } else {
            if (!localState[1].some(
              (node) => node.mint.toString() === mint.toString()
            )) {
              // If the mint does not exist, tx should yield NotYetRegisteredMint.
              try {
                await sendAndConfirmTx(connection, ix, [user])
                unreachable()
              } catch (error) {
                const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
                expect(txLogs).toMatch(/RegistryError::NotYetRegisteredMint/)
              }
            } else if (localState[1].some(
              (node) => node.mint.toString() === mint.toString() &&
                node.updateAuthority.toString() !== user.publicKey.toString()
            )) {
              // If the mint exists but we do not have update authority, tx
              // should yield InvalidTokenUpdateAuthority.
              try {
                await sendAndConfirmTx(connection, ix, [user])
                unreachable()
              } catch (error) {
                const txLogs = ((error as SendTransactionError).logs as string[]).join(' ')
                expect(txLogs).toMatch(/RegistryError::InvalidTokenUpdateAuthority/)
              }
            } else {
              await sendAndConfirmTx(connection, ix, [user])
              for (const node of localState[1]) {
                if (node.mint.toString() === mint.toString()) {
                  node.updateAuthority = newTokenAuthority
                  break
                }
              }
            }
          }
          break
        }

        default: {
          throw Error('Invalid instruction.')
        }
      }
    }
  }, 150000)
})
