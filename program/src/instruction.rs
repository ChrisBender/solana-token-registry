use crate::error::RegistryError;

// #[repr(C)]
pub enum RegistryInstruction<'a> {
    /**
     * Initialize the registry.
     *
     * Accounts:
     * 0. [writable, signer] Fee-payer.
     * 1. [] The initial `fee_mint`.
     * 2. [] The initial `fee_destination`.
     * 3. [] The system program.
     *
     * Instruction Data:
     * Byte 0: Instruction number (here, it equals 0).
     * Bytes 1-8: The `fee_amount` in big-endian order.
     *
     * Errors:
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
     * 1. [] Mint address to create a `RegistryNode` for. Must have not been registered before. Must be owned by the token program.
     * 2. [writable] The source account. Must be the Associated Token Account of the fee-payer.
     * 3. [writable] The destination account. Must be the Associated Token Account of `fee_destination`.
     * 4. [] The system program (to create a new account).
     * 5. [] The token program (to transfer tokens).
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
        token_symbol: &'a str,
        token_name: &'a str,
        token_logo_url: &'a str,
        token_tags: Vec<&'a str>,
        token_extensions: Vec<[&'a str; 2]>,
    },

    /**
     * Delete the (unique) registry node corresponding the supplied mint address.
     *
     * Accounts:
     * 0. [writable, signer] Fee-payer. Must have pubkey matching `RegistryNodeAccount::token_update_authority`.
     * 1. [] The address of the mint to be deleted.
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
     * 1. [] The address of the mint to be updated.
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
        token_symbol: &'a str,
        token_name: &'a str,
        token_logo_url: &'a str,
        token_tags: Vec<&'a str>,
        token_extensions: Vec<[&'a str; 2]>,
    },

    /**
     * Transfer the `RegistryMetaAccount::fee_update_authority` to a different account.
     *
     * Accounts:
     * [writable, signer] Fee-payer. Must have pubkey matching `RegistryMetaAccount::fee_update_authority`.
     * [] The new account to transfer authority to. Must be owned by the system program.
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
     * [writable, signer] Fee-payer. Must have pubkey matching `RegistryTokenAccount::token_update_authority`.
     * [] The new account to transfer authority to. Must be owned by the system program.
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

impl<'a> RegistryInstruction<'a> {
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
                let token_symbol = "Symbol";
                let token_name = "Name";
                let token_logo_url = "Logo URL";
                let token_tags = vec!["Tag1", "Tag2"];
                let token_extensions = vec![["UrlKey", "UrlValue"], ["TwitterKey", "TwitterValue"]];
                match tag {
                    2 => Self::CreateEntry {
                        token_symbol: token_symbol,
                        token_name: token_name,
                        token_logo_url: token_logo_url,
                        token_tags: token_tags,
                        token_extensions: token_extensions,
                    },
                    4 => Self::UpdateEntry {
                        token_symbol: token_symbol,
                        token_name: token_name,
                        token_logo_url: token_logo_url,
                        token_tags: token_tags,
                        token_extensions: token_extensions,
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
