import { Router } from 'express';

const router = Router();

const CLAUDE_SERVICE_URL = process.env.CLAUDE_SERVICE_URL || 'http://localhost:3002';

router.post('/', async (req, res) => {
  const { message } = req.body as { message?: string };

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Set up SSE to the browser client
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const upstream = await fetch(`${CLAUDE_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!upstream.ok || !upstream.body) {
      sendEvent({ type: 'error', text: `AI service unavailable (${upstream.status}). Start it with: docker-compose up -d` });
      return res.end();
    }

    // Pipe SSE stream from claude-service directly to client
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
  } catch (err: any) {
    const isConnRefused = err.cause?.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED');
    const msg = isConnRefused
      ? 'AI service is not running. Start it with: cd stacks-backend && docker-compose up -d'
      : `Failed to reach AI service: ${err.message}`;
    sendEvent({ type: 'error', text: msg });
  }

  res.end();
});

export { router as aiRouter };
