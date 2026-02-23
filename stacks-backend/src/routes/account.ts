import { Router } from 'express';
import { TESTNET_API } from '../lib/stacks';

const router = Router();

router.get('/:address', async (req, res) => {
  const { address } = req.params;

  try {
    const response = await fetch(`${TESTNET_API}/v2/accounts/${address}?proof=0`);
    const data = await response.json() as { balance: string; nonce: number };

    const microStx = BigInt(data.balance || '0');
    const stxBalance = (Number(microStx) / 1_000_000).toFixed(6);

    return res.json({
      address,
      balance: stxBalance,
      balanceMicroStx: data.balance,
      nonce: data.nonce,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export { router as accountRouter };
