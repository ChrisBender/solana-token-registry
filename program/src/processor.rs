use crate::{error::RegistryError, instruction::RegistryInstruction, state::RegistryMetaAccount};
use borsh::BorshDeserialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

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
        _program_id: &Pubkey,
        accounts: &[AccountInfo],
        _fee_amount: u64,
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let _account_user = next_account_info(accounts_iter)?;
        let _account_fee_mint = next_account_info(accounts_iter)?;
        let _account_fee_destination = next_account_info(accounts_iter)?;
        let _account_system_program = next_account_info(accounts_iter)?;
        let _account_registry_meta = next_account_info(accounts_iter)?;
        Ok(())
    }

    fn process_update_fees(
        _program_id: &Pubkey,
        accounts: &[AccountInfo],
        _fee_amount: u64,
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let _account_user = next_account_info(accounts_iter)?;
        let _account_fee_mint = next_account_info(accounts_iter)?;
        let _account_fee_destination = next_account_info(accounts_iter)?;
        let account_registry_meta = next_account_info(accounts_iter)?;
        Self::assert_initialized(account_registry_meta)?;
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
        let _account_mint = next_account_info(accounts_iter)?;
        let _account_fee_source_ata = next_account_info(accounts_iter)?;
        let _account_fee_destination_ata = next_account_info(accounts_iter)?;
        let _account_system_program = next_account_info(accounts_iter)?;
        let _account_token_program = next_account_info(accounts_iter)?;
        let account_registry_meta = next_account_info(accounts_iter)?;
        Self::assert_initialized(account_registry_meta)?;
        Ok(())
    }

    fn process_delete_entry(_program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let _account_user = next_account_info(accounts_iter)?;
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
        let _account_token_authority = next_account_info(accounts_iter)?;
        let account_registry_meta = next_account_info(accounts_iter)?;
        Self::assert_initialized(account_registry_meta)?;
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
