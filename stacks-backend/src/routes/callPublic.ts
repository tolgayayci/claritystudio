import { Router } from 'express';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  stringUtf8CV,
  uintCV,
  intCV,
  boolCV,
  principalCV,
  bufferCV,
  noneCV,
  someCV,
  ClarityValue,
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { getAccountNonce } from '../lib/stacks';

const router = Router();
const network = new StacksTestnet();

interface CallPublicRequest {
  contractAddress: string;
  contractName: string;
  functionName: string;
  args?: Array<{ value: string; type: string }>;
  fee?: number;
}

function buildClarityArg(value: string, type: string): ClarityValue {
  const trimmed = value.trim();
  // Handle nested type strings like "(optional uint128)", "(response ...)", etc.
  const baseType = type.replace(/\(.*\)/, '').trim() || type;

  if (type === 'uint128' || type.startsWith('uint')) {
    const n = trimmed.startsWith('u') ? trimmed.slice(1) : trimmed;
    return uintCV(BigInt(n || '0'));
  }
  if (type === 'int128' || type.startsWith('int')) {
    return intCV(BigInt(trimmed || '0'));
  }
  if (type === 'bool') {
    return boolCV(trimmed === 'true' || trimmed === '1');
  }
  if (type === 'principal') {
    return principalCV(trimmed);
  }
  if (type.startsWith('(string-ascii') || type === 'string-ascii') {
    return stringAsciiCV(trimmed);
  }
  if (type.startsWith('(string-utf8') || type === 'string-utf8') {
    return stringUtf8CV(trimmed);
  }
  if (type.startsWith('(buff') || type === 'buff') {
    const hex = trimmed.startsWith('0x') ? trimmed.slice(2) : trimmed;
    return bufferCV(Buffer.from(hex, 'hex'));
  }
  if (type === 'none') return noneCV();
  // Default: try as string-ascii
  return stringAsciiCV(trimmed);
}

router.post('/', async (req, res) => {
  const { contractAddress, contractName, functionName, args = [], fee = 10000 } = req.body as CallPublicRequest;

  if (!contractAddress || !contractName || !functionName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const senderAddress = process.env.DEPLOYER_ADDRESS;

  if (!privateKey || !senderAddress) {
    return res.status(500).json({ error: 'Deployer wallet not configured' });
  }

  try {
    const nonce = await getAccountNonce(senderAddress);

    const functionArgs: ClarityValue[] = args.map(a => buildClarityArg(a.value, a.type));

    const txOptions = {
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      senderKey: privateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: BigInt(fee),
      nonce: BigInt(nonce),
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, network);

    if ('error' in result) {
      const reason = (result as any).reason as string | undefined;
      let message = result.error as string;
      if (reason === 'ContractAlreadyExists') message = `Contract already exists.`;
      else if (reason === 'BadNonce') message = `Nonce mismatch — please try again.`;
      else if (reason === 'FeeTooLow') message = `Transaction fee too low.`;
      else if (reason === 'NotEnoughFunds') message = `Deployer wallet has insufficient funds.`;
      else if (reason) message = `Transaction rejected: ${reason}`;
      return res.status(400).json({ error: message, reason });
    }

    const txId = result.txid;
    const explorerUrl = `https://explorer.hiro.so/txid/${txId}?chain=testnet`;
    return res.json({ txId, explorerUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export { router as callPublicRouter };
