import { Router } from 'express';
import { TESTNET_API } from '../lib/stacks';

const router = Router();

interface CallReadRequest {
  contractAddress: string;
  contractName: string;
  functionName: string;
  args?: string[];
  senderAddress?: string;
}

router.post('/', async (req, res) => {
  const { contractAddress, contractName, functionName, args = [], senderAddress } = req.body as CallReadRequest;

  if (!contractAddress || !contractName || !functionName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const body = {
      sender: senderAddress || contractAddress,
      arguments: args,
    };

    const response = await fetch(
      `${TESTNET_API}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export { router as callRouter };
