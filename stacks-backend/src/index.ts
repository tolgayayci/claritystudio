import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { validateRouter } from './routes/validate';
import { deployRouter } from './routes/deploy';
import { interfaceRouter } from './routes/interface';
import { callRouter } from './routes/call';
import { callPublicRouter } from './routes/callPublic';
import { walletRouter } from './routes/wallet';
import { accountRouter } from './routes/account';
import { aiRouter } from './routes/ai';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'stacks-backend' }));

app.use('/validate', validateRouter);
app.use('/deploy', deployRouter);
app.use('/interface', interfaceRouter);
app.use('/call-read', callRouter);
app.use('/call', callPublicRouter);
app.use('/wallet', walletRouter);
app.use('/account', accountRouter);
app.use('/ai', aiRouter);

app.listen(PORT, () => {
  console.log(`Stacks backend running on port ${PORT}`);
});
