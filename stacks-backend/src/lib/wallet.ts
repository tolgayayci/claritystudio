import * as bip39 from 'bip39';
import { getAddressFromPrivateKey, TransactionVersion } from '@stacks/transactions';

export interface StacksWallet {
  mnemonic: string;
  privateKey: string;
  address: string;
}

export function generateWallet(): StacksWallet {
  const mnemonic = bip39.generateMnemonic(256);
  // Derive a simple private key from mnemonic seed
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  // Use first 32 bytes of seed as private key
  const privateKeyBytes = seed.slice(0, 32);
  const privateKey = privateKeyBytes.toString('hex') + '01'; // compressed
  const address = getAddressFromPrivateKey(privateKey, TransactionVersion.Testnet);
  return { mnemonic, privateKey, address };
}
