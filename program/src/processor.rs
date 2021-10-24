use crate::{
    error::RegistryError,
    instruction::RegistryInstruction,
    state::{RegistryMetaAccount, RegistryNodeAccount},
};
use borsh::{BorshDeserialize, BorshSerialize};
use byteorder::{BigEndian, ByteOrder};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
};
use std::{convert::TryInto, io::Write, mem::size_of};

pub struct Processor {}
impl<'a> Processor {
    pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], input: &[u8]) -> ProgramResult {
        let instruction = RegistryInstruction::unpack(input)?;
        match instruction {
            RegistryInstruction::InitializeRegistry { fee_amount } => {
                msg!("RegistryInstruction::InitializeRegistry");
                Self::process_initialize_registry(program_id, accounts, fee_amount)
            }
            RegistryInstruction::UpdateFees { fee_amount } => {
                msg!("RegistryInstruction::UpdateFees");
                Self::process_update_fees(program_id, accounts, fee_amount)
            }
            RegistryInstruction::CreateEntry {
                token_symbol,
                token_name,
                token_logo_url,
                token_tags,
                token_extensions,
            } => {
                msg!("RegistryInstruction::CreateEntry");
                Self::process_create_entry(
                    program_id,
                    accounts,
                    token_symbol,
                    token_name,
                    token_logo_url,
                    token_tags,
                    token_extensions,
                )
            }
            RegistryInstruction::DeleteEntry => {
                msg!("RegistryInstruction::DeleteEntry");
                Self::process_delete_entry(program_id, accounts)
            }
            RegistryInstruction::UpdateEntry {
                token_symbol,
                token_name,
                token_logo_url,
                token_tags,
                token_extensions,
            } => {
                msg!("RegistryInstruction::UpdateEntry");
                Self::process_update_entry(
                    program_id,
                    accounts,
                    token_symbol,
                    token_name,
                    token_logo_url,
                    token_tags,
                    token_extensions,
                )
            }
            RegistryInstruction::TransferFeeAuthority => {
                msg!("RegistryInstruction::TransferFeeAuthority");
                Self::process_transfer_fee_authority(program_id, accounts)
            }
            RegistryInstruction::TransferTokenAuthority => {
                msg!("RegistryInstruction::TransferTokenAuthority");
                Self::process_transfer_token_authority(program_id, accounts)
            }
        }
    }

    fn process_initialize_registry(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        fee_amount: u64,
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let account_user = next_account_info(accounts_iter)?;
        let _account_program = next_account_info(accounts_iter)?;
        let account_fee_mint = next_account_info(accounts_iter)?;
        let account_fee_destination = next_account_info(accounts_iter)?;
        let _account_system_program = next_account_info(accounts_iter)?;
        let account_registry_meta = next_account_info(accounts_iter)?;
        let account_registry_meta_bump_seed =
            Self::assert_valid_pda(program_id, account_registry_meta, b"meta")?;
        let account_registry_head = next_account_info(accounts_iter)?;
        let account_registry_head_bump_seed =
            Self::assert_valid_pda(program_id, account_registry_head, b"head")?;
        let account_registry_tail = next_account_info(accounts_iter)?;
        let account_registry_tail_bump_seed =
            Self::assert_valid_pda(program_id, account_registry_tail, b"tail")?;

        /* Assert that the accounts have not already been created. */
        if account_registry_meta.data_len() != 0
            || account_registry_head.data_len() != 0
            || account_registry_tail.data_len() != 0
        {
            return Err(ProgramError::from(RegistryError::AlreadyInitialized));
        }

        /* Create the account_registry_meta */
        let account_registry_meta_space = size_of::<RegistryMetaAccount>();
        let initialize_instruction_meta = system_instruction::create_account(
            account_user.key,
            account_registry_meta.key,
            Rent::default().minimum_balance(account_registry_meta_space),
            account_registry_meta_space as u64,
            program_id,
        );
        invoke_signed(
            &initialize_instruction_meta,
            &[account_user.clone(), account_registry_meta.clone()],
            &[&[b"meta", &[account_registry_meta_bump_seed]]],
        )?;

        /* Set the fields of account_registry_meta */
        let mut registry_meta = RegistryMetaAccount::default();
        registry_meta.head_registry_node = account_registry_head.key.to_bytes();
        registry_meta.fee_amount = fee_amount;
        registry_meta.fee_mint = account_fee_mint.key.to_bytes();
        registry_meta.fee_destination = account_fee_destination.key.to_bytes();
        registry_meta.fee_update_authority = account_user.key.to_bytes();
        registry_meta.serialize(&mut &mut account_registry_meta.data.borrow_mut()[..])?;

        /* Create the account_registry_head and account_registry_tail */
        Self::initialize_new_registry_account(
            program_id,
            account_user,
            account_registry_head,
            b"head",
            account_registry_head_bump_seed,
        )?;
        Self::initialize_new_registry_account(
            program_id,
            account_user,
            account_registry_tail,
            b"tail",
            account_registry_tail_bump_seed,
        )?;

        /* Set the fields of account_registry_head and account_registry_tail */
        let mut registry_head = RegistryNodeAccount::default();
        registry_head.next_registry_node = account_registry_tail.key.to_bytes();
        Self::serialize_registry_account(registry_head, account_registry_head)?;
        let mut registry_tail = RegistryNodeAccount::default();
        registry_tail.prev_registry_node = account_registry_head.key.to_bytes();
        Self::serialize_registry_account(registry_tail, account_registry_tail)?;

        Ok(())
    }

    fn process_update_fees(
        _program_id: &Pubkey,
        accounts: &[AccountInfo],
        fee_amount: u64,
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let account_user = next_account_info(accounts_iter)?;
        let account_fee_mint = next_account_info(accounts_iter)?;
        let account_fee_destination = next_account_info(accounts_iter)?;
        let account_registry_meta = next_account_info(accounts_iter)?;
        Self::assert_initialized(account_registry_meta)?;

        let mut registry_meta =
            RegistryMetaAccount::try_from_slice(&account_registry_meta.data.borrow())?;
        if account_user.key.to_bytes() != registry_meta.fee_update_authority {
            return Err(ProgramError::from(RegistryError::InvalidFeeUpdateAuthority));
        }
        registry_meta.fee_amount = fee_amount;
        registry_meta.fee_mint = account_fee_mint.key.to_bytes();
        registry_meta.fee_destination = account_fee_destination.key.to_bytes();
        registry_meta.serialize(&mut &mut account_registry_meta.data.borrow_mut()[..])?;

        Ok(())
    }

    fn process_create_entry(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        token_symbol: String,
        token_name: String,
        token_logo_url: String,
        token_tags: Vec<String>,
        token_extensions: Vec<Vec<String>>,
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let account_user = next_account_info(accounts_iter)?;
        let account_mint = next_account_info(accounts_iter)?;
        let _account_fee_source_ata = next_account_info(accounts_iter)?;
        let _account_fee_destination_ata = next_account_info(accounts_iter)?;
        let _account_system_program = next_account_info(accounts_iter)?;
        let _account_token_program = next_account_info(accounts_iter)?;
        let account_registry_meta = next_account_info(accounts_iter)?;
        Self::assert_initialized(account_registry_meta)?;
        let account_registry_head = next_account_info(accounts_iter)?;
        let account_registry_first = next_account_info(accounts_iter)?;
        let account_registry_new = next_account_info(accounts_iter)?;
        let account_registry_new_bump_seed = Self::assert_valid_pda(
            program_id,
            account_registry_new,
            &account_mint.key.to_bytes(),
        )?;

        /* Update linked list pointers of head and former first entry. */
        let mut registry_head = Self::deserialize_registry_account(account_registry_head)?;
        registry_head.next_registry_node = account_registry_new.key.to_bytes();
        Self::serialize_registry_account(registry_head, account_registry_head)?;
        let mut registry_first = Self::deserialize_registry_account(account_registry_first)?;
        registry_first.prev_registry_node = account_registry_new.key.to_bytes();
        Self::serialize_registry_account(registry_first, account_registry_first)?;

        /* Create an account for registry_node_new */
        Self::initialize_new_registry_account(
            program_id,
            account_user,
            account_registry_new,
            &account_mint.key.to_bytes(),
            account_registry_new_bump_seed,
        )?;

        /* Set the fields of registry_node_new */
        let mut registry_node_new = RegistryNodeAccount::default();
        registry_node_new.next_registry_node = account_registry_first.key.to_bytes();
        registry_node_new.prev_registry_node = account_registry_head.key.to_bytes();
        registry_node_new.token_mint = account_mint.key.to_bytes();
        registry_node_new.token_symbol = token_symbol;
        registry_node_new.token_name = token_name;
        registry_node_new.token_logo_url = token_logo_url;
        registry_node_new.token_tags = token_tags;
        registry_node_new.token_extensions = token_extensions;
        registry_node_new.token_update_authority = account_user.key.to_bytes();
        Self::serialize_registry_account(registry_node_new, account_registry_new)?;

        Ok(())
    }

    fn process_delete_entry(_program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let _account_user = next_account_info(accounts_iter)?;
        let _account_program = next_account_info(accounts_iter)?;
        let _account_mint = next_account_info(accounts_iter)?;
        let account_registry_meta = next_account_info(accounts_iter)?;
        Self::assert_initialized(account_registry_meta)?;
        Ok(())
    }

    fn process_update_entry(
        _program_id: &Pubkey,
        accounts: &[AccountInfo],
        _token_symbol: String,
        _token_name: String,
        _token_logo_url: String,
        _token_tags: Vec<String>,
        _token_extensions: Vec<Vec<String>>,
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let _account_user = next_account_info(accounts_iter)?;
        let _account_program = next_account_info(accounts_iter)?;
        let _account_mint = next_account_info(accounts_iter)?;
        let account_registry_meta = next_account_info(accounts_iter)?;
        Self::assert_initialized(account_registry_meta)?;
        Ok(())
    }

    fn process_transfer_fee_authority(
        _program_id: &Pubkey,
        accounts: &[AccountInfo],
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let _account_user = next_account_info(accounts_iter)?;
        let _account_program = next_account_info(accounts_iter)?;
        let _account_fee_authority = next_account_info(accounts_iter)?;
        let account_registry_meta = next_account_info(accounts_iter)?;
        Self::assert_initialized(account_registry_meta)?;
        Ok(())
    }

    fn process_transfer_token_authority(
        _program_id: &Pubkey,
        accounts: &[AccountInfo],
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let _account_user = next_account_info(accounts_iter)?;
        let _account_program = next_account_info(accounts_iter)?;
        let _account_token_authority = next_account_info(accounts_iter)?;
        let account_registry_meta = next_account_info(accounts_iter)?;
        Self::assert_initialized(account_registry_meta)?;
        Ok(())
    }

    fn assert_valid_pda(
        program_id: &Pubkey,
        account: &AccountInfo,
        seed: &[u8],
    ) -> Result<u8, RegistryError> {
        let subseed = &seed[..std::cmp::min(32, seed.len())];
        let (derived_pubkey, derived_bump_seed) =
            Pubkey::find_program_address(&[subseed], program_id);
        if *account.key != derived_pubkey {
            return Err(RegistryError::InvalidProgramDerivedAccount);
        }
        Ok(derived_bump_seed)
    }

    fn assert_initialized(account_registry_meta: &AccountInfo) -> Result<(), RegistryError> {
        if account_registry_meta.data_len() == 0 {
            return Err(RegistryError::NotYetInitialized);
        }
        Ok(())
    }

    fn initialize_new_registry_account(
        program_id: &Pubkey,
        account_user: &AccountInfo<'a>,
        account_registry_new: &AccountInfo<'a>,
        seed: &[u8],
        bump_seed: u8,
    ) -> Result<(), ProgramError> {
        let default_registry_node = RegistryNodeAccount::max_filled();
        let mut default_registry_node_buffer: Vec<u8> = Vec::new();
        default_registry_node.serialize(&mut default_registry_node_buffer)?;
        let account_registry_node_space = default_registry_node_buffer.len() + 4;
        let initialize_instruction = system_instruction::create_account(
            account_user.key,
            account_registry_new.key,
            Rent::default().minimum_balance(account_registry_node_space),
            account_registry_node_space as u64,
            program_id,
        );
        invoke_signed(
            &initialize_instruction,
            &[account_user.clone(), account_registry_new.clone()],
            &[&[seed, &[bump_seed]]],
        )?;
        Ok(())
    }

    fn serialize_registry_account(
        registry_node: RegistryNodeAccount,
        registry_node_account: &AccountInfo,
    ) -> Result<(), ProgramError> {
        let mut registry_node_data: Vec<u8> = Vec::new();
        registry_node.serialize(&mut registry_node_data)?;

        let mut length_bytes = [0; 4];
        BigEndian::write_u32(&mut length_bytes, registry_node_data.len() as u32);

        registry_node_data.insert(0, length_bytes[3]);
        registry_node_data.insert(0, length_bytes[2]);
        registry_node_data.insert(0, length_bytes[1]);
        registry_node_data.insert(0, length_bytes[0]);

        registry_node_account
            .data
            .borrow_mut()
            .write(&registry_node_data[..])?;

        Ok(())
    }

    fn deserialize_registry_account(
        registry_node_account: &AccountInfo,
    ) -> Result<RegistryNodeAccount, ProgramError> {
        let length_bytes = u32::from_be_bytes(
            (&registry_node_account.data.borrow()[..4])
                .try_into()
                .unwrap(),
        ) as usize;
        msg!("length_bytes: {:?}", length_bytes);

        Ok(RegistryNodeAccount::try_from_slice(
            &registry_node_account.data.borrow()[4..4 + length_bytes],
        )?)
    }
}