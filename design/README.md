# Design

## State
These two account types are owned by the program, and they are used to construct the doubly-linked list of token records. There is only one `RegistryMetaAccount` (to keep track of metadata and a pointer to the head of the doubly-linked list), but there is a `RegistryNodeAccount` for each token record (plus two extra `RegistryNodeAccount`s for the head and tail of the list).

```
struct RegistryMetaAccount {
    /// The address of the first (most-recently-added) RegistryNodeAccount.
    pub head_registry_node: &Pubkey,
    /// The required fee to create a new RegistryNodeAccount.
    pub fee_amount: u64,
    /// The address of the Mint that fees are denominated in.
    pub fee_mint: &Pubkey,
    /// The address of owner of the Associated Token Account that fees are sent to.
    pub fee_destination: &Pubkey,
    /// The address that is allowed to change fee settings.
    pub fee_update_authority: &Pubkey,
    /// If the registry has been initialized yet.
    pub initialized: bool,
}
```

```
struct RegistryNodeAccount {
    /// The address of the next RegistryNodeAccount.
    pub next_registry_node: &Pubkey,
    /// The address of the previous RegistryNodeAccount.
    pub prev_registry_node: &Pubkey,
    /// The address of the token Mint. Only one RegistryNodeAccount per Mint address is allowed.
    pub token_mint: &Pubkey, 
    /// The token ticker.
    pub token_symbol: &str,
    /// The token name.
    pub token_name: &str,
    /// URL for the token's logo.
    pub token_logo_url: &str,
    /// A list of tags identifying the token (e.g, "stablecoin", "lp-token").
    pub token_tags: &str[]
    /// A list of links for the token (e.g, "website", "twitter").
    pub token_extensions: [&str; 2][]
    /// The address that is allowed to update all token properties (except the mint address), delete the node, or change the RegistryNodeAccount::token_update_authority.
    pub token_update_authority: &Pubkey,
}
```

## Contract API
```
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
InitializeRegistry {
    fee_amount: u64,
}
```

```
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
UpdateFees {
    fee_amount: u64,
}
```

```
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
    token_symbol: &str,
    token_name: &str,
    token_logo_url: &str,
    token_tags: &str[],
    token_extensions: [&str; 2][],
}
```

```
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
DeleteEntry
```

```
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
    token_symbol: &str,
    token_name: &str,
    token_logo_url: &str,
    token_tags: &str[],
    token_extensions: [&str; 2][],
}
```

```
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
TransferFeeAuthority
```

```
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
TransferTokenAuthority
```

## Contract Errors
```
NotYetInitialized
InvalidMint
InvalidFeeMint
InvalidSourceAccount
InvalidDestinationAccount
InvalidNamedProgram
InvalidTokenUpdateAuthority
InvalidFeeUpdateAuthority
InvalidFeeDestination
InvalidInstructionData
```

## JavaScript API
```
/**
 * Returns a list of all the registered tokens.
 *
 */
function getAllTokens(connection: Connection) -> TokenEntry[]
interface TokenEntry {
  mint: PublicKey,
  symbol: string,
  name: string,
  logo_url: string,
  token_tags: string[],
  token_extensions: [string, string][],
}
```

```
/**
 * Returns a sanitized list of all the registered tokens. Throw away all duplicate tickers and names, only keeping the ticker or name with highest active DEX volume.
 *
 */
function getAllTokensSanitized(connection: Connection) -> TokenEntry[]
```

```
/**
 * Creates a TransactionInstruction corresponding to the InitializeRegistry contract instruction.
 *
 */
function createInstructionInitializeRegistry(
  userPublicKey: PublicKey, 
  feeMintPublicKey: PublicKey,
  feeDestinationPublicKey: PublicKey,
  feeAmount: int,
) -> TransactionInstruction
```

```
/**
 * Creates a TransactionInstruction corresponding to the UpdateFees contract instruction.
 *
 */
function createInstructionUpdateFees(
  userPublicKey: PublicKey, 
  feeMintPublicKey: PublicKey,
  feeDestinationPublicKey: PublicKey,
  feeAmount: int,
) -> TransactionInstruction
```

```
/**
 * Creates a TransactionInstruction corresponding to the CreateEntry contract instruction.
 *
 */
function createInstructionCreateEntry(
  userPublicKey: PublicKey, 
  mintPublicKey: PublicKey,
  sourceTokenAccount: PublicKey,
  destinationTokenAccount: PublicKey,
  tokenSymbol: string,
  tokenName: string,
  tokenLogoUrl: string,
  tokenTags: string[],
  tokenExtensions: [string, string][],
) -> TransactionInstruction
```

```
/**
 * Creates a TransactionInstruction corresponding to the DeleteEntry contract instruction.
 *
 */
function createInstructionDeleteEntry(
  userPublicKey: PublicKey, 
  mintPublicKey: PublicKey,
) -> TransactionInstruction
```

```
/**
 * Creates a TransactionInstruction corresponding to the UpdateEntry contract instruction.
 *
 */
function createInstructionUpdateEntry(
  userPublicKey: PublicKey, 
  mintPublicKey: PublicKey,
  sourceTokenAccount: PublicKey,
  destinationTokenAccount: PublicKey,
  tokenSymbol: string,
  tokenName: string,
  tokenLogoUrl: string,
  tokenTags: string[],
  tokenExtensions: [string, string][],
) -> TransactionInstruction
```

```
/**
 * Creates a TransactionInstruction corresponding to the TransferFeeAuthority contract instruction.
 *
 */
function createInstructionTransferFeeAuthority(
  userPublicKey: PublicKey, 
  feeAuthorityPublicKey: PublicKey,
) -> TransactionInstruction
```

```
/**
 * Creates a TransactionInstruction corresponding to the TransferTokenAuthority contract instruction.
 *
 */
function createInstructionTransferTokenAuthority(
  userPublicKey: PublicKey, 
  tokenAuthorityPublicKey: PublicKey,
) -> TransactionInstruction
```

