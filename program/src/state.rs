use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug, Default)]
pub struct RegistryMetaAccount {
    /// The address of the first (most-recently-added) RegistryNodeAccount.
    pub head_registry_node: [u8; 32],
    /// The required fee to create a new RegistryNodeAccount.
    pub fee_amount: u64,
    /// The address of the Mint that fees are denominated in.
    pub fee_mint: [u8; 32],
    /// The address of owner of the Associated Token Account that fees are sent to.
    pub fee_destination: [u8; 32],
    /// The address that is allowed to change fee settings.
    pub fee_update_authority: [u8; 32],
    /// If the registry has been initialized yet.
    pub initialized: bool,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Default)]
pub struct RegistryNodeAccount {
    /// The address of the next RegistryNodeAccount.
    pub next_registry_node: [u8; 32],
    /// The address of the previous RegistryNodeAccount.
    pub prev_registry_node: [u8; 32],
    /// The address of the token Mint. Only one RegistryNodeAccount per Mint address is allowed.
    pub token_mint: [u8; 32],
    /// The token ticker.
    pub token_symbol: String,
    /// The token name.
    pub token_name: String,
    /// URL for the token's logo.
    pub token_logo_url: String,
    /// A list of tags identifying the token (e.g, "stablecoin", "lp-token").
    pub token_tags: Vec<String>,
    /// A list of links for the token (e.g, "website", "twitter").
    pub token_extensions: Vec<Vec<String>>,
    /// The address that is allowed to update all token properties (except the mint address), delete the node, or change the RegistryNodeAccount::token_update_authority.
    pub token_update_authority: [u8; 32],
}
