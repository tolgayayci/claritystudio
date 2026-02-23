import { StacksTestnet } from '@stacks/network';

export const TESTNET_API = 'https://api.testnet.hiro.so';
export const network = new StacksTestnet();

export async function getAccountNonce(address: string): Promise<number> {
  const response = await fetch(`${TESTNET_API}/v2/accounts/${address}?proof=0`);
  const data = await response.json() as { nonce: number };
  return data.nonce;
}

export async function getAccountBalance(address: string): Promise<string> {
  const response = await fetch(`${TESTNET_API}/v2/accounts/${address}?proof=0`);
  const data = await response.json() as { balance: string };
  // balance is in microSTX, convert to STX
  const microStx = BigInt(data.balance || '0');
  const stx = Number(microStx) / 1_000_000;
  return stx.toFixed(6);
}
