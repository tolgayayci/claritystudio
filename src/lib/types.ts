export interface User {
  id: string;
  email: string;
  name?: string;
  company?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  code: string;
  created_at: string;
  updated_at: string;
  last_compilation?: CompilationResult;
  metadata?: Record<string, any>;
  last_activity_at?: string;
  is_public?: boolean;
  shared_at?: string;
  view_count?: number;
  deployment_count?: number;
  clarity_version?: number;
}

export interface CompilationResult {
  success: boolean;
  exit_code: number;
  stdout: string;
  stderr: string;
  details: {
    status: string;
    compilation_time: number;
    project_path: string;
    wasm_size?: number;
    optimized?: boolean;
  };
  abi: any[];
  code_snapshot: string;
}

export interface Deployment {
  id: string;
  project_id: string;
  contract_address: string;
  chain_id: string;
  chain_name: string;
  deployed_code: string;
  abi: any[];
  metadata: Record<string, any>;
  created_at: string;
  tx_id?: string;
}

export interface DeploymentWithProject extends Deployment {
  project?: {
    id: string;
    name: string;
  };
}

// Stacks / Clarity specific types

export interface StacksWallet {
  mnemonic: string;
  privateKey: string;
  address: string;
  balance?: string;
}

export interface ClarityError {
  line?: number;
  column?: number;
  message: string;
}

export interface ValidationResult {
  success: boolean;
  errors: ClarityError[];
  warnings: string[];
}

export interface StacksDeployResult {
  txId: string;
  contractAddress: string;
  explorerUrl: string;
}

export interface ClarityFunctionArg {
  name: string;
  type: string;
}

export interface ClarityFunction {
  name: string;
  access: 'public' | 'read_only' | 'private';
  args: ClarityFunctionArg[];
  outputs: { type: string };
}

export interface ContractInterface {
  functions: ClarityFunction[];
  variables: Array<{ name: string; type: string; access: string }>;
  maps: Array<{ name: string; key: string; value: string }>;
  fungible_tokens: Array<{ name: string }>;
  non_fungible_tokens: Array<{ name: string; type: string }>;
}

export interface ABIMethodInput {
  name: string;
  type: string;
  internalType?: string;
}

export interface ABIMethod {
  name: string;
  type: string; // 'function', 'event', 'constructor'
  stateMutability?: string; // 'view', 'pure', 'payable', 'nonpayable'
  inputs: ABIMethodInput[];
  outputs: ABIMethodInput[];
  modifiers?: string[];
  kind?: string;
}

export interface MethodCallResult {
  success: boolean;
  result?: any;
  error?: string;
}

export interface AccountInfo {
  address: string;
  balance: string;
  nonce: number;
}

// File system types (used by editor and file explorer)

export interface FileNode {
  name: string;
  path: string;
  is_directory: boolean;
  children?: FileNode[];
  size?: number;
}

export interface OpenFile {
  path: string;
  name: string;
  content: string;
  originalContent: string;
  language: string;
}

export function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'clar':
      return 'clarity';
    case 'rs':
      return 'rust';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'toml':
      return 'toml';
    case 'md':
      return 'markdown';
    case 'yml':
    case 'yaml':
      return 'yaml';
    default:
      return 'plaintext';
  }
}

export function isFileDirty(file: OpenFile): boolean {
  return file.content !== file.originalContent;
}
