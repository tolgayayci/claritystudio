import { callReadOnly } from './api';

// Parse Clarity value string to proper type for API calls
export function parseClarityValue(value: string, type: string): string {
  const trimmed = value.trim();
  switch (type) {
    case 'uint128':
      return trimmed.startsWith('u') ? trimmed : `u${trimmed}`;
    case 'int128':
      return trimmed;
    case 'bool':
      return trimmed === 'true' || trimmed === '1' ? 'true' : 'false';
    case 'principal':
      return trimmed;
    default:
      return trimmed;
  }
}

// Decode a hex-encoded Clarity value into a human-readable string
// e.g. "0x070100000000000000000000000000000000" → "(ok u0)"
export function decodeClarityHex(hex: string): string {
  if (!hex || !hex.startsWith('0x')) return hex;
  try {
    const bytes = hex.slice(2); // strip 0x
    return decodeCV(bytes, 0).value;
  } catch {
    return hex; // fallback to raw hex on parse error
  }
}

function decodeCV(bytes: string, offset: number): { value: string; nextOffset: number } {
  const typeId = parseInt(bytes.slice(offset, offset + 2), 16);
  offset += 2;

  switch (typeId) {
    case 0x00: { // int128
      const raw = bytes.slice(offset, offset + 32);
      const big = BigInt('0x' + raw);
      // Signed: if high bit set, subtract 2^128
      const val = (big >> 127n) ? big - (1n << 128n) : big;
      return { value: val.toString(), nextOffset: offset + 32 };
    }
    case 0x01: { // uint128
      const raw = bytes.slice(offset, offset + 32);
      const val = BigInt('0x' + raw);
      return { value: `u${val}`, nextOffset: offset + 32 };
    }
    case 0x02: { // buffer
      const len = parseInt(bytes.slice(offset, offset + 8), 16);
      offset += 8;
      const buf = bytes.slice(offset, offset + len * 2);
      return { value: `0x${buf}`, nextOffset: offset + len * 2 };
    }
    case 0x03: return { value: 'false', nextOffset: offset };
    case 0x04: return { value: 'true', nextOffset: offset };
    case 0x05: { // standard principal (1 version byte + 20 hash bytes)
      // skip version + hash (21 bytes = 42 hex chars)
      const addr = bytes.slice(offset, offset + 42);
      return { value: `principal(${addr})`, nextOffset: offset + 42 };
    }
    case 0x07: { // ok
      const inner = decodeCV(bytes, offset);
      return { value: `(ok ${inner.value})`, nextOffset: inner.nextOffset };
    }
    case 0x08: { // err
      const inner = decodeCV(bytes, offset);
      return { value: `(err ${inner.value})`, nextOffset: inner.nextOffset };
    }
    case 0x09: return { value: 'none', nextOffset: offset };
    case 0x0a: { // some
      const inner = decodeCV(bytes, offset);
      return { value: `(some ${inner.value})`, nextOffset: inner.nextOffset };
    }
    case 0x0b: { // list
      const len = parseInt(bytes.slice(offset, offset + 8), 16);
      offset += 8;
      const items: string[] = [];
      for (let i = 0; i < len; i++) {
        const item = decodeCV(bytes, offset);
        items.push(item.value);
        offset = item.nextOffset;
      }
      return { value: `(list ${items.join(' ')})`, nextOffset: offset };
    }
    case 0x0c: { // tuple
      const len = parseInt(bytes.slice(offset, offset + 8), 16);
      offset += 8;
      const fields: string[] = [];
      for (let i = 0; i < len; i++) {
        const nameLen = parseInt(bytes.slice(offset, offset + 2), 16);
        offset += 2;
        const nameHex = bytes.slice(offset, offset + nameLen * 2);
        offset += nameLen * 2;
        const name = Buffer.from(nameHex, 'hex').toString('utf8');
        const val = decodeCV(bytes, offset);
        offset = val.nextOffset;
        fields.push(`${name}: ${val.value}`);
      }
      return { value: `{${fields.join(', ')}}`, nextOffset: offset };
    }
    case 0x0d: { // string-ascii
      const len = parseInt(bytes.slice(offset, offset + 8), 16);
      offset += 8;
      const str = bytes.slice(offset, offset + len * 2);
      const text = str.match(/.{2}/g)?.map(b => String.fromCharCode(parseInt(b, 16))).join('') ?? '';
      return { value: `"${text}"`, nextOffset: offset + len * 2 };
    }
    case 0x0e: { // string-utf8
      const len = parseInt(bytes.slice(offset, offset + 8), 16);
      offset += 8;
      const raw = bytes.slice(offset, offset + len * 2);
      return { value: `u"${Buffer.from(raw, 'hex').toString('utf8')}"`, nextOffset: offset + len * 2 };
    }
    default:
      return { value: `0x${bytes.slice(offset - 2)}`, nextOffset: bytes.length };
  }
}

// Execute a Clarity read-only function
export async function executeClarityReadOnly(
  contractAddress: string,
  contractName: string,
  functionName: string,
  args: string[],
  senderAddress?: string
): Promise<{
  success: boolean;
  result?: string;
  error?: string;
}> {
  try {
    const response = await callReadOnly({
      contractAddress,
      contractName,
      functionName,
      args,
      senderAddress: senderAddress || contractAddress,
    });

    // callReadOnly returns the raw Hiro API response: { okay: boolean, result: string }
    // or MethodCallResult on error: { success: false, error: string }
    const raw = response as any;

    if (raw.okay === false) {
      return { success: false, error: raw.cause || raw.error || 'Function call failed' };
    }
    if (raw.success === false) {
      return { success: false, error: raw.error || 'Function call failed' };
    }

    const hexResult = raw.result as string | undefined;
    const decoded = hexResult ? decodeClarityHex(hexResult) : undefined;

    return { success: true, result: decoded };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to call function',
    };
  }
}

// Get display label for a Clarity function type
export function getClarityFunctionTypeLabel(access: string): string {
  switch (access) {
    case 'public': return 'Public';
    case 'read_only': return 'Read Only';
    case 'private': return 'Private';
    default: return 'Function';
  }
}

// Check if a Clarity function is callable from the UI
export function isClarityFunctionCallable(access: string): boolean {
  return access === 'public' || access === 'read_only';
}
