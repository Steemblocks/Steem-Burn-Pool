// Application configuration constants
export const STEEM_BURN_POOL_ACCOUNT = 'steemburnpool';

export const API_ENDPOINTS = {
  STEEM_WORLD_DELEGATIONS: 'https://sds0.steemworld.org/delegations_api/getIncomingDelegations',
  STEEM_SUPPLY: 'https://sds1.steemworld.org/supplies_api/getSteemSupply',
  CONDENSER_API: 'https://api.steemit.com',
  HIVE_SQL: 'https://hivesql.io/api/GetAccountHistory',
  STEEMIT_API: 'https://api.steemit.com/get_account_history'
};

export const CACHE_DURATIONS = {
  BURN_POOL_DATA: 5, // minutes
  DELEGATION_DATA: 10, // minutes
  SUPPLY_DATA: 15 // minutes
};

// STEEM blockchain constants
export const STEEM_CONSTANTS = {
  VIRTUAL_SUPPLY_FALLBACK: 584003293.225, // STEEM (includes SBD debt conversion)
  CURRENT_SUPPLY_FALLBACK: 521000000 // STEEM (current supply only)
};
