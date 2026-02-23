// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Stacks Network Configuration
export const STACKS_CONFIG = {
  testnet: {
    network: 'testnet' as const,
    apiUrl: 'https://api.testnet.hiro.so',
    explorerUrl: 'https://explorer.hiro.so/?chain=testnet',
    name: 'Stacks Testnet',
  },
} as const;

export const STACKS_TESTNET_API = STACKS_CONFIG.testnet.apiUrl;
export const STACKS_EXPLORER_URL = STACKS_CONFIG.testnet.explorerUrl;
export const STACKS_NETWORK = STACKS_CONFIG.testnet.network;

// Analytics Configuration
export const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID;

// Application URLs
export const APP_URLS = {
  base: import.meta.env.VITE_APP_URL || 'https://claritystudio.app',
  docs: import.meta.env.VITE_DOCS_URL,
  telegram: import.meta.env.VITE_TELEGRAM_URL,
} as const;

// Application Info
export const APP_NAME = 'Clarity Studio';
export const APP_DOMAIN = 'claritystudio.app';

// Services
export const SERVICES = {
  avatar: import.meta.env.VITE_AVATAR_SERVICE_URL,
} as const;

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const;

// Helper function to get explorer URL for transaction
export function getExplorerTxUrl(txId: string): string {
  return `https://explorer.hiro.so/txid/${txId}?chain=testnet`;
}

// Helper function to get explorer URL for address
export function getExplorerAccountUrl(address: string): string {
  return `https://explorer.hiro.so/address/${address}?chain=testnet`;
}

// Helper function to get explorer URL for contract
export function getExplorerContractUrl(address: string, contractName: string): string {
  return `https://explorer.hiro.so/txid/${address}.${contractName}?chain=testnet`;
}

// Helper function to get avatar URL
export function getAvatarUrl(seed: string): string {
  return `${SERVICES.avatar}/${seed}`;
}

// Helper function to format STX amount (microSTX to STX)
export function formatStxAmount(microStx: string | number): string {
  const stx = Number(microStx) / 1_000_000;
  return stx.toFixed(6);
}
