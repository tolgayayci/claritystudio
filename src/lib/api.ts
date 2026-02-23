import { ValidationResult, StacksDeployResult, ContractInterface, MethodCallResult, AccountInfo } from './types';
import { API_URL } from './config';

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed: ${res.status}`);
  }

  return data as T;
}

// ============================================
// Contract Validation & Deployment
// ============================================

/**
 * Validate a Clarity smart contract
 */
export async function validateContract(
  code: string,
  contractName: string
): Promise<ValidationResult> {
  return fetchAPI<ValidationResult>('/validate', {
    method: 'POST',
    body: JSON.stringify({ code, contractName }),
  });
}

/**
 * Deploy a Clarity smart contract to Stacks testnet.
 * The backend uses its pre-funded deployer wallet — no private key needed from client.
 */
export async function deployContract(params: {
  code: string;
  contractName: string;
  fee?: number;
}): Promise<StacksDeployResult> {
  return fetchAPI<StacksDeployResult>('/deploy', {
    method: 'POST',
    body: JSON.stringify({
      code: params.code,
      contractName: params.contractName,
      fee: params.fee,
    }),
  });
}

// ============================================
// Contract Interaction
// ============================================

/**
 * Get the interface of a deployed Clarity contract
 */
export async function getContractInterface(
  address: string,
  name: string
): Promise<ContractInterface> {
  return fetchAPI<ContractInterface>(`/interface/${address}/${name}`);
}

/**
 * Call a read-only function on a deployed Clarity contract
 */
export async function callReadOnly(params: {
  contractAddress: string;
  contractName: string;
  functionName: string;
  args: any[];
  senderAddress: string;
}): Promise<MethodCallResult> {
  try {
    return await fetchAPI<MethodCallResult>('/call-read', {
      method: 'POST',
      body: JSON.stringify({
        contractAddress: params.contractAddress,
        contractName: params.contractName,
        functionName: params.functionName,
        args: params.args,
        senderAddress: params.senderAddress,
      }),
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to call read-only function',
    };
  }
}

/**
 * Call a public function on a deployed Clarity contract (submits a transaction)
 */
export async function callPublicFunction(params: {
  contractAddress: string;
  contractName: string;
  functionName: string;
  args: Array<{ value: string; type: string }>;
}): Promise<{ txId: string; explorerUrl: string }> {
  return fetchAPI('/call', {
    method: 'POST',
    body: JSON.stringify({
      contractAddress: params.contractAddress,
      contractName: params.contractName,
      functionName: params.functionName,
      args: params.args,
    }),
  });
}

// ============================================
// Wallet / Account API
// ============================================

/**
 * Request testnet STX from the faucet for the deployer wallet
 */
export async function requestFaucet(): Promise<{ success: boolean; txId?: string; error?: string }> {
  try {
    return await fetchAPI<{ success: boolean; txId: string }>('/wallet/faucet', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Faucet request failed',
    };
  }
}

/**
 * Get account info (balance, nonce) for a Stacks address
 */
export async function getAccountInfo(address: string): Promise<AccountInfo> {
  return fetchAPI<AccountInfo>(`/account/${address}`);
}
