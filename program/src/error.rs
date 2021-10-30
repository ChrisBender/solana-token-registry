use num_derive::FromPrimitive;
use solana_program::{
    decode_error::DecodeError,
    msg,
    program_error::{PrintProgramError, ProgramError},
};
use thiserror::Error;

#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum RegistryError {
    #[error("The registry has not yet been initialized.")]
    NotYetInitialized,
    #[error("The registry has already been initialized.")]
    AlreadyInitialized,
    #[error("Passed an invalid number of accounts.")]
    InvalidNumberOfAccounts,
    #[error("The provided user account is not a signer.")]
    InvalidUserAccount,
    #[error("The provided system account is not owned by the system program.")]
    InvalidSystemAccount,
    #[error("The provided mint is already in the registry.")]
    PreviouslyRegisteredMint,
    #[error("The provided mint has not been registered yet.")]
    NotYetRegisteredMint,
    #[error("A provided program derived account is not correct.")]
    InvalidProgramDerivedAccount,
    #[error("The provided first Registry Node is not correct.")]
    InvalidRegistryNodeFirst,
    #[error("The provided mint is not owned by the token program.")]
    InvalidMint,
    #[error("The provided mint has not yet been initialized.")]
    UninitializedMint,
    #[error("The provided account is not a valid Associated Token Account.")]
    InvalidAssociatedTokenAccount,
    #[error("The provided Associated Token Account has no data.")]
    UninitializedAssociatedTokenAccount,
    #[error("The provided system program is not the real system program.")]
    InvalidSystemProgram,
    #[error("The provided token program is not the real token program.")]
    InvalidTokenProgram,
    #[error("The provided ATA program is not the real ATA program.")]
    InvalidATAProgram,
    #[error("The provided sysvar rent program is not the real sysvar rent program.")]
    InvalidSysvarRentProgram,
    #[error("Attempted to update a token without having update authority.")]
    InvalidTokenUpdateAuthority,
    #[error("Attempted to update the fees without having update authority.")]
    InvalidFeeUpdateAuthority,
    #[error("The provided fee destination is not owned by the system program.")]
    InvalidFeeDestination,
    #[error("The provided instruction data cannot be parsed.")]
    InvalidInstructionData,
}

impl PrintProgramError for RegistryError {
    fn print<E>(&self) {
        match self {
            RegistryError::NotYetInitialized => {
                msg!(
                    "RegistryError::NotYetInitialized - The registry has not yet been initialized."
                )
            }
            RegistryError::AlreadyInitialized => {
                msg!("RegistryError::AlreadyInitialized - The registry has already been initialized.")
            }
            RegistryError::InvalidNumberOfAccounts => {
                msg!("RegistryError::InvalidNumberOfAccounts - Passed an invalid number of accounts.")
            }
            RegistryError::InvalidUserAccount => {
                msg!("RegistryError::InvalidUserAccount - The provided user account is not a signer.")
            }
            RegistryError::InvalidSystemAccount => {
                msg!("RegistryError::InvalidSystemAccount - The provided system account is not owned by the system program.")
            }
            RegistryError::PreviouslyRegisteredMint => {
                msg!("RegistryError::PreviouslyRegisteredMint - The provided mint is already in the registry.")
            }
            RegistryError::NotYetRegisteredMint => {
                msg!("RegistryError::NotYetRegisteredMint - The provided mint has not been registered yet.")
            }
            RegistryError::InvalidProgramDerivedAccount => {
                msg!("RegistryError::InvalidProgramDerivedAccount - A provided program derived account is not correct.")
            }
            RegistryError::InvalidRegistryNodeFirst => {
                msg!("RegistryError::InvalidRegistryNodeFirst - The provided first Registry Node is not correct.")
            }
            RegistryError::InvalidMint => {
                msg!("RegistryError::InvalidMint - The provided mint is not owned by the token program.")
            }
            RegistryError::UninitializedMint => {
                msg!("RegistryError::UninitializedMint - The provided mint has not yet been initialized.")
            }
            RegistryError::InvalidAssociatedTokenAccount => {
                msg!("RegistryError::InvalidAssociatedTokenAccount - The provided account is not a valid Associated Token Account.")
            }
            RegistryError::UninitializedAssociatedTokenAccount => {
                msg!("RegistryError::UninitializedAssociatedTokenAccount - The provided Associated Token Account has no data.")
            }
            RegistryError::InvalidSystemProgram => {
                msg!("RegistryError::InvalidSystemProgram - The provided system program is not the real system program.")
            }
            RegistryError::InvalidTokenProgram => {
                msg!("RegistryError::InvalidTokenProgram - The provided token program is not the real token program.")
            }
            RegistryError::InvalidATAProgram => {
                msg!("RegistryError::InvalidATAProgram - The provided ATA program is not the real ATA program.")
            }
            RegistryError::InvalidSysvarRentProgram => {
                msg!("RegistryError::InvalidSysvarRentProgram - The provided sysvar rent program is not the real sysvar rent program.")
            }
            RegistryError::InvalidTokenUpdateAuthority => {
                msg!("RegistryError::InvalidTokenUpdateAuthority - Attempted to update a token without having update authority.")
            }
            RegistryError::InvalidFeeUpdateAuthority => {
                msg!("RegistryError::InvalidFeeUpdateAuthority - Attempted to update the fees without having update authority.")
            }
            RegistryError::InvalidFeeDestination => {
                msg!("RegistryError::InvalidFeeDestination - The provided fee destination is not owned by the system program.")
            }
            RegistryError::InvalidInstructionData => {
                msg!("RegistryError::InvalidInstructionData - The provided instruction data cannot be parsed.")
            }
        }
    }
}

impl From<RegistryError> for ProgramError {
    fn from(e: RegistryError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

impl<T> DecodeError<T> for RegistryError {
    fn type_of() -> &'static str {
        "RegistryError"
    }
}
