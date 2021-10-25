use crate::{error::RegistryError, state::CreateUpdateEntryInstructionData};
use borsh::BorshDeserialize;

// #[repr(C)]
pub enum RegistryInstruction {
    /**
     * Initialize the registry.
     *
     * Accounts:
     * 0. [writable, signer] Fee-payer.
     * 1. [] The program account.
     * 2. [] The initial `fee_mint`.
     * 3. [] The initial `fee_destination`.
     * 4. [] The system program.
     * 5. [writable] The RegistryMetaAccount.
     * 6. [writable] The RegistryHeadAccount.
     * 7. [writable] The RegistryTailAccount.
     *
     * Instruction Data:
     * Byte 0: Instruction number (here, it equals 0).
     * Bytes 1-8: The `fee_amount` in big-endian order.
     *
     * Errors:
     * `AlreadyInitialized` if the registry has already been initialized.
     * `InvalidFeeMint` if the supplied `fee_mint` address is not owned by the token program.
     * `InvalidFeeDestination` if the supplied `fee_destination` is not owned by the system program.
     * `InvalidNamedProgram` If the supplied system program is not the real system program.
     *
     */
    InitializeRegistry { fee_amount: u64 },

    /**
     * Update the fees for token registration.
     *
     * Accounts:
     * 0. [writable, signer] Fee-payer. Must have pubkey matching `RegistryHeadAccount::fee_update_authority`.
     * 1. [] The new `fee_mint`.
     * 2. [] The new `fee_destination`.
     * 3. [writable] The RegistryMetaAccount.
     *
     * Instruction Data:
     * Byte 0: Instruction number (here, it equals 1).
     * Bytes 1-8: The new `fee_amount` in big-endian order.
     *
     * Errors:
     * `NotYetInitialized` if the registry has not yet been initialized.
     * `InvalidFeeUpdateAuthority` if the fee-payer address does not match `fee_update_authority`.
     * `InvalidFeeMint` if the supplied `fee_mint` address is not owned by the token program.
     * `InvalidFeeDestination` if the supplied `fee_destination` is not owned by the system program.
     *
     */
    UpdateFees { fee_amount: u64 },

    /**
     * Create a new registry node for the supplied mint address.
     *
     * Accounts:
     * 0. [writable, signer] Fee-payer. Will be assigned to the `RegistryNodeAccount::token_update_authority`.
     * 1. [] The program account.
     * 2. [] Mint address to create a `RegistryNode` for. Must have not been registered before. Must be owned by the token program.
     * 3. [writable] The source account. Must be the Associated Token Account of the fee-payer.
     * 4. [writable] The destination account. Must be the Associated Token Account of `fee_destination`.
     * 5. [] The system program (to create a new account).
     * 6. [] The token program (to transfer tokens).
     * 7. [writable] The RegistryMetaAccount.
     * 8. [writable] The RegistryHeadAccount.
     * 9. [writable] The new RegistryNodeAccount.
     *
     * Instruction Data:
     * Byte 0: Instruction number (here, it equals 2).
     * Bytes 1-?: A zero-terminated string for the `token_symbol`.
     * Bytes ?-?: A zero-terminated string for the `token_name`.
     * Bytes ?-?: A zero-terminated string for the `token_logo_url`.
     * Bytes ?-?: A zero-terminated string representing a JSON-parsable list of tags for `token_tags`.
     * Bytes ?-?: A zero-terminated string representing a JSON-parsable list of lists for `token_extensions`.
     *
     * Errors:
     * `NotYetInitialized` if the registry has not yet been initialized.
     * `InvalidMint` if the supplied mint address has been previously registered or is not owned by the token program.
     * `InvalidSourceAccount` if the source account is not the ATA of the fee-payer.
     * `InvalidDestinationAccount` if the destination account is not the ATA of the `fee_destination`.
     * `InvalidNamedProgram` If either the system program or the token program are not correct.
     * `InvalidInstructionData` if there are not exactly 5 zero-termianted strings, or if the JSON-parsable lists cannot be parsed.
     *
     */
    CreateEntry {
        token_symbol: String,
        token_name: String,
        token_logo_url: String,
        token_tags: Vec<String>,
        token_extensions: Vec<Vec<String>>,
    },

    /**
     * Delete the (unique) registry node corresponding the supplied mint address.
     *
     * Accounts:
     * 0. [writable, signer] Fee-payer. Must have pubkey matching `RegistryNodeAccount::token_update_authority`.
     * 1. [] The program account.
     * 2. [] The address of the mint to be deleted.
     * 3. [] The RegistryMetaAccount.
     * .. [] All the RegistryNodeAccounts, in order.
     *
     * Instruction Data:
     * Byte 0: Instruction number (here, it equals 3).
     *
     * Errors:
     * `NotYetInitialized` if the registry has not yet been initialized.
     * `InvalidMint` if the supplied mint address is not owned by the token program, or has not been previously registered.
     * `InvalidTokenUpdateAuthority` if the fee-payer address does not match `token_update_authority`.
     *
     */
    DeleteEntry,

    /**
     * Update the registry node corresponding to the supplied mint address.
     *
     * Accounts:
     * 0. [writable, signer] Fee-payer. Must have pubkey matching `RegistryNodeAccount::token_update_authority`.
     * 1. [] The program account.
     * 2. [] The address of the mint to be updated.
     * 3. [] The RegistryMetaAccount.
     * .. [] All the RegistryNodeAccounts, in order.
     *
     * Instruction Data:
     * Byte 0: Instruction number (here, it equals 4).
     * Bytes 1-?: A zero-terminated string for the `token_symbol`.
     * Bytes ?-?: A zero-terminated string for the `token_name`.
     * Bytes ?-?: A zero-terminated string for the `token_logo_url`.
     * Bytes ?-?: A zero-terminated string representing a JSON-parsable list of tags for `token_tags`.
     * Bytes ?-?: A zero-terminated string representing a JSON-parsable list of lists for `token_extensions`.
     *
     * Errors:
     * `NotYetInitialized` if the registry has not yet been initialized.
     * `InvalidMint` if the supplied mint address has not been previously registered or is not owned by the token program.
     * `InvalidInstructionData` if there are not exactly 5 zero-termianted strings, or if the JSON-parsable lists cannot be parsed.
     * `InvalidTokenUpdateAuthority` if the fee-payer address does not match `token_update_authority`.
     *
     */
    UpdateEntry {
        token_symbol: String,
        token_name: String,
        token_logo_url: String,
        token_tags: Vec<String>,
        token_extensions: Vec<Vec<String>>,
    },

    /**
     * Transfer the `RegistryMetaAccount::fee_update_authority` to a different account.
     *
     * Accounts:
     * 0. [writable, signer] Fee-payer. Must have pubkey matching `RegistryMetaAccount::fee_update_authority`.
     * 1. [] The program account.
     * 2. [] The new account to transfer authority to. Must be owned by the system program.
     * 3. [] The RegistryMetaAccount.
     * .. [] All the RegistryNodeAccounts, in order.
     *
     * Instruction Data:
     * Byte 0: Instruction number (here, it equals 5).
     *
     * Errors:
     * `NotYetInitialized` if the registry has not yet been initialized.
     * `InvalidFeeUpdateAuthority` if the fee-payer address does not match `fee_update_authority`, or if the supplied new account is not owned by the system program.
     *
     */
    TransferFeeAuthority,

    /**
     * Transfer the `RegistryNodeAccount::token_update_authority` to a different account.
     *
     * Accounts:
     * 0. [writable, signer] Fee-payer. Must have pubkey matching `RegistryTokenAccount::token_update_authority`.
     * 1. [] The program account.
     * 2. [] The new account to transfer authority to. Must be owned by the system program.
     * 3. [] The RegistryMetaAccount.
     * .. [] All the RegistryNodeAccounts, in order.
     *
     * Instruction Data:
     * Byte 0: Instruction number (here, it equals 6).
     *
     * Errors:
     * `NotYetInitialized` if the registry has not yet been initialized.
     * `InvalidTokenUpdateAuthority` if the fee-payer address does not match `token_update_authority`, or if the supplied new account is not owned by the system program.
     *
     */
    TransferTokenAuthority,
}

impl RegistryInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, RegistryError> {
        let (tag, rest) = input
            .split_first()
            .ok_or(RegistryError::InvalidInstructionData)?;
        Ok(match tag {
            0 | 1 => {
                let fee_amount = u64::from_be_bytes([
                    rest[0], rest[1], rest[2], rest[3], rest[4], rest[5], rest[6], rest[7],
                ]);
                match tag {
                    0 => Self::InitializeRegistry {
                        fee_amount: fee_amount,
                    },
                    1 => Self::UpdateFees {
                        fee_amount: fee_amount,
                    },
                    _ => {
                        return Err(RegistryError::InvalidInstructionData);
                    }
                }
            }
            2 | 4 => {
                let parsed_instruction_data =
                    CreateUpdateEntryInstructionData::try_from_slice(rest)
                        .or(Err(RegistryError::InvalidInstructionData))?;
                match tag {
                    2 => Self::CreateEntry {
                        token_symbol: parsed_instruction_data.token_symbol,
                        token_name: parsed_instruction_data.token_name,
                        token_logo_url: parsed_instruction_data.token_logo_url,
                        token_tags: parsed_instruction_data.token_tags,
                        token_extensions: parsed_instruction_data.token_extensions,
                    },
                    4 => Self::UpdateEntry {
                        token_symbol: parsed_instruction_data.token_symbol,
                        token_name: parsed_instruction_data.token_name,
                        token_logo_url: parsed_instruction_data.token_logo_url,
                        token_tags: parsed_instruction_data.token_tags,
                        token_extensions: parsed_instruction_data.token_extensions,
                    },
                    _ => {
                        return Err(RegistryError::InvalidInstructionData);
                    }
                }
            }
            3 => Self::DeleteEntry,
            5 => Self::TransferFeeAuthority,
            6 => Self::TransferTokenAuthority,
            _ => {
                return Err(RegistryError::InvalidInstructionData);
            }
        })
    }
}
