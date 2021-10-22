use crate::{
    error::RegistryError,
    instruction::RegistryInstruction,
    state::{RegistryMetaAccount, RegistryNodeAccount},
};
use borsh::{BorshDeserialize, BorshSerialize};
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
use std::mem::size_of;

pub struct Processor {}
impl Processor {
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
        let account_program = next_account_info(accounts_iter)?;
        let account_fee_mint = next_account_info(accounts_iter)?;
        let account_fee_destination = next_account_info(accounts_iter)?;
        let account_system_program = next_account_info(accounts_iter)?;
        Self::assert_valid_account_system_program(account_system_program)?;
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
            account_program.key,
        );
        invoke_signed(
            &initialize_instruction_meta,
            &[account_user.clone(), account_registry_meta.clone()],
            &[&[b"meta", &[account_registry_meta_bump_seed]]],
        )?;

        /* Create the account_registry_head and account_registry_tail */
        let default_registry_node = RegistryNodeAccount::default();
        let mut default_registry_node_buffer: Vec<u8> = Vec::new();
        default_registry_node.serialize(&mut default_registry_node_buffer)?;
        let account_registry_node_space = default_registry_node_buffer.len();
        let initialize_instruction_head = system_instruction::create_account(
            account_user.key,
            account_registry_head.key,
            Rent::default().minimum_balance(account_registry_node_space),
            account_registry_node_space as u64,
            account_program.key,
        );
        let initialize_instruction_tail = system_instruction::create_account(
            account_user.key,
            account_registry_tail.key,
            Rent::default().minimum_balance(account_registry_node_space),
            account_registry_node_space as u64,
            account_program.key,
        );
        invoke_signed(
            &initialize_instruction_head,
            &[account_user.clone(), account_registry_head.clone()],
            &[&[b"head", &[account_registry_head_bump_seed]]],
        )?;
        invoke_signed(
            &initialize_instruction_tail,
            &[account_user.clone(), account_registry_tail.clone()],
            &[&[b"tail", &[account_registry_tail_bump_seed]]],
        )?;

        /* Set the fields of account_registry_meta */
        let mut registry_meta = RegistryMetaAccount::default();
        registry_meta.head_registry_node = account_registry_head.key.to_bytes();
        registry_meta.fee_amount = fee_amount;
        registry_meta.fee_mint = account_fee_mint.key.to_bytes();
        registry_meta.fee_destination = account_fee_destination.key.to_bytes();
        registry_meta.fee_update_authority = account_user.key.to_bytes();
        registry_meta.initialized = true;
        registry_meta.serialize(&mut &mut account_registry_meta.data.borrow_mut()[..])?;

        /* Set the fields of account_registry_head and account_registry_tail */
        let mut registry_head = RegistryNodeAccount::default();
        registry_head.next_registry_node = account_registry_tail.key.to_bytes();
        registry_head.serialize(&mut &mut account_registry_head.data.borrow_mut()[..])?;
        msg!("new registry_head: {:?}", registry_head);
        let mut registry_tail = RegistryNodeAccount::default();
        registry_tail.prev_registry_node = account_registry_head.key.to_bytes();
        registry_tail.serialize(&mut &mut account_registry_tail.data.borrow_mut()[..])?;

        Ok(())
    }

    fn process_update_fees(
        _program_id: &Pubkey,
        accounts: &[AccountInfo],
        fee_amount: u64,
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let _account_user = next_account_info(accounts_iter)?;
        let _account_program = next_account_info(accounts_iter)?;
        let account_fee_mint = next_account_info(accounts_iter)?;
        let account_fee_destination = next_account_info(accounts_iter)?;
        let account_registry_meta = next_account_info(accounts_iter)?;
        Self::assert_initialized(account_registry_meta)?;

        /* TODO */
        let mut registry_meta =
            RegistryMetaAccount::try_from_slice(&account_registry_meta.data.borrow())?;
        registry_meta.fee_amount = fee_amount;
        registry_meta.fee_mint = account_fee_mint.key.to_bytes();
        registry_meta.fee_destination = account_fee_destination.key.to_bytes();

        Ok(())
    }

    fn process_create_entry(
        _program_id: &Pubkey,
        accounts: &[AccountInfo],
        _token_symbol: &str,
        _token_name: &str,
        _token_logo_url: &str,
        _token_tags: Vec<&str>,
        _token_extensions: Vec<[&str; 2]>,
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let _account_user = next_account_info(accounts_iter)?;
        let _account_program = next_account_info(accounts_iter)?;
        let _account_mint = next_account_info(accounts_iter)?;
        let _account_fee_source_ata = next_account_info(accounts_iter)?;
        let _account_fee_destination_ata = next_account_info(accounts_iter)?;
        let account_system_program = next_account_info(accounts_iter)?;
        Self::assert_valid_account_system_program(account_system_program)?;
        let _account_token_program = next_account_info(accounts_iter)?;
        let account_registry_meta = next_account_info(accounts_iter)?;
        Self::assert_initialized(account_registry_meta)?;
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
        _token_symbol: &str,
        _token_name: &str,
        _token_logo_url: &str,
        _token_tags: Vec<&str>,
        _token_extensions: Vec<[&str; 2]>,
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
        let (derived_pubkey, derived_bump_seed) = Pubkey::find_program_address(&[seed], program_id);
        if *account.key != derived_pubkey {
            return Err(RegistryError::InvalidProgramDerivedAccount);
        }
        Ok(derived_bump_seed)
    }

    fn assert_valid_account_system_program(
        _account_system_program: &AccountInfo,
    ) -> Result<(), RegistryError> {
        Ok(())
    }

    fn assert_initialized(account_registry_meta: &AccountInfo) -> Result<(), RegistryError> {
        if account_registry_meta.data_len() == 0 {
            return Err(RegistryError::NotYetInitialized);
        }
        let registry_meta_account =
            RegistryMetaAccount::try_from_slice(&account_registry_meta.data.borrow()).unwrap();
        if !registry_meta_account.initialized {
            return Err(RegistryError::NotYetInitialized);
        }
        Ok(())
    }
}
