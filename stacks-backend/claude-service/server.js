const express = require('express');
const { spawn } = require('child_process');

const app = express();
app.use(express.json({ limit: '1mb' }));

const SYSTEM_PROMPT = `You are an expert AI assistant for Clarity smart contracts, the Stacks blockchain (Bitcoin L2), and Clarinet (the Clarity development tool).

Key knowledge:
- Clarity is an interpreted, decidable, LISP-like smart contract language — no compilation step
- Stacks is a Bitcoin Layer 2 blockchain that settles to Bitcoin
- Contract addresses: ST{address}.{contract-name} on testnet, SP on mainnet
- Core functions: define-public, define-read-only, define-private, define-data-var, define-map, define-constant
- Built-ins: tx-sender, contract-caller, block-height, stx-transfer?, var-get, var-set, map-get?, map-set
- Types: uint, int, bool, principal, (buff N), (string-ascii N), (string-utf8 N), (optional T), (response T E)
- No reentrancy possible (decidability guarantee)
- Clarinet is the local development/testing tool for Clarity contracts

Answer questions about Clarity syntax, debugging, deployment, Clarinet usage, and Stacks ecosystem. Be concise and include code examples when helpful. Format code with clarity syntax in code blocks.`;

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'claude-service' }));

app.post('/chat', (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Build full prompt with system context
  const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\nUser question: ${message}`;

  const claude = spawn('/usr/local/bin/claude', [
    '-p', fullPrompt,
    '--output-format', 'stream-json',
    '--verbose',
    '--model', 'claude-sonnet-4-6',
    '--tools', '',
  ], {
    env: { ...process.env, HOME: '/root' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let buffer = '';
  let hasError = false;

  claude.stdout.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep last incomplete line

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line);

        // stream-json format: type=assistant has message.content blocks
        if (event.type === 'assistant' && event.message?.content) {
          for (const block of event.message.content) {
            if (block.type === 'text' && block.text) {
              sendEvent({ type: 'chunk', text: block.text });
            }
          }
        }

        // Error from Claude
        if (event.type === 'result' && event.subtype === 'error') {
          hasError = true;
          sendEvent({ type: 'error', text: event.error || 'Claude returned an error' });
        }
      } catch {
        // Skip malformed lines
      }
    }
  });

  claude.stderr.on('data', (chunk) => {
    // Claude Code sometimes writes status to stderr — log but don't send to client
    console.error('[claude stderr]', chunk.toString().trim());
  });

  claude.on('close', (code, signal) => {
    if (signal) {
      // Killed intentionally (client disconnect) — just close
      res.end();
      return;
    }
    if (!hasError && code !== 0) {
      sendEvent({ type: 'error', text: `Claude process exited with code ${code}` });
    } else if (!hasError) {
      sendEvent({ type: 'done' });
    }
    res.end();
  });

  claude.on('error', (err) => {
    if (err.code === 'ENOENT') {
      sendEvent({ type: 'error', text: 'Claude Code CLI not found. The Docker container may not be set up correctly.' });
    } else {
      sendEvent({ type: 'error', text: err.message });
    }
    res.end();
  });

  // Kill claude process if client disconnects
  res.on('close', () => {
    claude.kill('SIGTERM');
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Claude service running on port ${PORT}`);
  console.log('Waiting for requests...');
});
