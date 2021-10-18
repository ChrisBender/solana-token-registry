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
    #[error("The provided mint is already in the registry.")]
    PreviouslyRegisteredMint,
    #[error("The provided mint is not owned by the token program.")]
    InvalidMint,
    #[error("The provided fee mint is not owned by the token program.")]
    InvalidFeeMint,
    #[error("The provided source account is not the Associated Token Account of the fee-payer.")]
    InvalidSourceAccount,
    #[error("The provided destination account is not the Associated Token Account of the fee destination.")]
    InvalidDestinationAccount,
    #[error("The provided system program is not the real system program.")]
    InvalidSystemProgram,
    #[error("The provided token program is not the real token program.")]
    InvalidTokenProgram,
    #[error("Attempted to update a token without having update authority.")]
    InvalidTokenUpdateAuthority,
    #[error("Attempted to update the fees without having update authority.")]
    InvalidFeeUpdateAuthority,
    #[error("The provided fee destination is not owned by the system program.")]
    InvalidFeeDestination,
    #[error("The provided instruction data cannot be parsed.")]
    InvalidInstructionData,
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

impl PrintProgramError for RegistryError {
    fn print<E>(&self) {
        match self {
            RegistryError::NotYetInitialized => {
                msg!("RegistryError::NotYetInitialized - The registry has not yet been initialized.")
            }
            RegistryError::PreviouslyRegisteredMint => {
                msg!("RegistryError::PreviouslyRegisteredMint - The provided mint is already in the registry.")
            }
            RegistryError::InvalidMint => {
                msg!("RegistryError::InvalidMint - The provided mint is not owned by the token program.")
            }
            RegistryError::InvalidFeeMint => {
                msg!("RegistryError::InvalidFeeMint - The provided fee mint is not owned by the token program.")
            }
            RegistryError::InvalidSourceAccount => {
                msg!("RegistryError::InvalidSourceAccount - The provided source account is not the Associated Token Account of the fee-payer.")
            }
            RegistryError::InvalidDestinationAccount => {
                msg!("RegistryError::InvalidDestinationAccount - The provided destination account is not the Associated Token Account of the fee destination.")
            }
            RegistryError::InvalidSystemProgram => {
                msg!("RegistryError::InvalidSystemProgram - The provided system program is not the real system program.")
            }
            RegistryError::InvalidTokenProgram => {
                msg!("RegistryError::InvalidTokenProgram - The provided token program is not the real token program.")
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
