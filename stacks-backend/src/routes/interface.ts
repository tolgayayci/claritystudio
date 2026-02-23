import { Router } from 'express';
import { TESTNET_API } from '../lib/stacks';

const router = Router();

router.get('/:address/:name', async (req, res) => {
  const { address, name } = req.params;

  try {
    const response = await fetch(`${TESTNET_API}/v2/contracts/interface/${address}/${name}`);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Contract not found or not deployed' });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export { router as interfaceRouter };
