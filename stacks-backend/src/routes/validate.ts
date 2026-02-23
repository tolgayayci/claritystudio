import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);
const router = Router();

interface ValidateRequest {
  code: string;
  contractName?: string;
}

interface ValidateResponse {
  success: boolean;
  errors: Array<{ line?: number; column?: number; message: string }>;
  warnings: string[];
}

function basicClarityCheck(code: string): ValidateResponse {
  const errors: Array<{ line?: number; column?: number; message: string }> = [];
  const warnings: string[] = [];
  const lines = code.split('\n');

  let depth = 0;
  lines.forEach((line, lineNum) => {
    for (const char of line) {
      if (char === '(') depth++;
      if (char === ')') depth--;
      if (depth < 0) {
        errors.push({ line: lineNum + 1, message: 'Unexpected closing parenthesis' });
        depth = 0;
      }
    }
  });

  if (depth !== 0) {
    errors.push({ message: `Unbalanced parentheses: ${depth} unclosed` });
  }

  // Check for common issues
  if (!code.trim()) {
    errors.push({ message: 'Contract code is empty' });
  }

  return { success: errors.length === 0, errors, warnings };
}

async function clarityCheckWithClarinet(code: string, contractName: string): Promise<ValidateResponse> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clarity-'));
  const contractFile = path.join(tmpDir, `${contractName}.clar`);

  try {
    fs.writeFileSync(contractFile, code);

    // Try clarinet if available
    const { stderr } = await execAsync(`clarinet check ${contractFile}`, { timeout: 30000 });

    if (stderr && stderr.toLowerCase().includes('error')) {
      const errorLines = stderr.split('\n').filter(l => l.includes('error') || l.includes('Error'));
      return {
        success: false,
        errors: errorLines.map(msg => ({ message: msg.trim() })),
        warnings: []
      };
    }

    return { success: true, errors: [], warnings: [] };
  } catch (err: any) {
    const errMsg = err.stderr || err.message || '';
    // Parse clarinet error output
    const errors = errMsg.split('\n')
      .filter((l: string) => l.trim())
      .map((msg: string) => ({ message: msg.trim() }));
    return { success: false, errors: errors.length > 0 ? errors : [{ message: errMsg }], warnings: [] };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

router.post('/', async (req, res) => {
  const { code, contractName = 'contract' } = req.body as ValidateRequest;

  if (!code) {
    return res.status(400).json({ success: false, errors: [{ message: 'No code provided' }], warnings: [] });
  }

  try {
    // Try clarinet first, fall back to basic check
    let result: ValidateResponse;
    try {
      await execAsync('which clarinet');
      result = await clarityCheckWithClarinet(code, contractName);
    } catch {
      result = basicClarityCheck(code);
    }

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, errors: [{ message: err.message }], warnings: [] });
  }
});

export { router as validateRouter };
