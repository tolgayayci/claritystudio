import { Router } from 'express';
import { TESTNET_API, getAccountBalance } from '../lib/stacks';

const router = Router();

// Return the deployer wallet address (no private key exposed)
router.get('/info', async (_, res) => {
  const address = process.env.DEPLOYER_ADDRESS;

  if (!address) {
    return res.status(500).json({ error: 'Deployer wallet not configured on server' });
  }

  try {
    const balance = await getAccountBalance(address);
    return res.json({ address, balance });
  } catch (err: any) {
    return res.json({ address, balance: '0' });
  }
});

router.post('/faucet', async (req, res) => {
  const { address } = req.body as { address?: string };

  // Use provided address or fall back to deployer address
  const targetAddress = address || process.env.DEPLOYER_ADDRESS;

  if (!targetAddress) {
    return res.status(400).json({ error: 'Address required' });
  }

  try {
    const response = await fetch(
      `${TESTNET_API}/extended/v1/faucets/stx?address=${targetAddress}&stacking=false`,
      { method: 'POST' }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text || 'Faucet request failed' });
    }

    const data = await response.json() as { txId: string };
    return res.json({ success: true, txId: data.txId, amount: '500000000' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export { router as walletRouter };
