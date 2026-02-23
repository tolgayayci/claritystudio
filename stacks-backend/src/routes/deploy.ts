import { Router } from 'express';
import {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { getAccountNonce } from '../lib/stacks';

const router = Router();
const network = new StacksTestnet();

interface DeployRequest {
  code: string;
  contractName: string;
  fee?: number;
}

router.post('/', async (req, res) => {
  const { code, contractName, fee = 10000 } = req.body as DeployRequest;

  if (!code || !contractName) {
    return res.status(400).json({ error: 'Missing required fields: code, contractName' });
  }

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const senderAddress = process.env.DEPLOYER_ADDRESS;

  if (!privateKey || !senderAddress) {
    return res.status(500).json({ error: 'Deployer wallet not configured on server' });
  }

  try {
    const nonce = await getAccountNonce(senderAddress);

    const txOptions = {
      contractName,
      codeBody: code,
      senderKey: privateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: BigInt(fee),
      nonce: BigInt(nonce),
    };

    const transaction = await makeContractDeploy(txOptions);
    const result = await broadcastTransaction(transaction, network);

    if ('error' in result) {
      const reason = (result as any).reason as string | undefined;
      const reasonData = (result as any).reason_data;
      let message = result.error as string;
      if (reason === 'ContractAlreadyExists') {
        message = `A contract named "${contractName}" already exists for this deployer. Please choose a different name.`;
      } else if (reason === 'BadNonce') {
        message = `Nonce mismatch — please try again.`;
      } else if (reason === 'FeeTooLow') {
        message = `Transaction fee too low. Please try again.`;
      } else if (reason === 'NotEnoughFunds') {
        message = `Deployer wallet has insufficient funds.`;
      } else if (reason) {
        message = `Transaction rejected: ${reason}`;
      }
      return res.status(400).json({ error: message, reason });
    }

    const txId = result.txid;
    const contractAddress = `${senderAddress}.${contractName}`;
    const explorerUrl = `https://explorer.hiro.so/txid/${txId}?chain=testnet`;

    return res.json({ txId, contractAddress, explorerUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export { router as deployRouter };
