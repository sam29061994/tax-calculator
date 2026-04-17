import type { Bracket } from '../utils/taxCalculator';

const BASE_URL = 'http://localhost:5001';

export type ApiErrorCode = 'http' | 'network' | 'validation';

export class ApiError extends Error {
  status: number;
  code: ApiErrorCode;

  constructor(message: string, status: number, code: ApiErrorCode) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function fetchTaxBrackets(year: number): Promise<Bracket[]> {
  const url = `${BASE_URL}/tax-calculator/tax-year/${year}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    console.error('[taxBrackets] network error', { year, err });
    throw new ApiError('Unable to reach tax API', 0, 'network');
  }

  if (!res.ok) {
    console.warn('[taxBrackets] non-OK response', { year, status: res.status });
    throw new ApiError(`Tax API returned ${res.status}`, res.status, 'http');
  }

  const data: unknown = await res.json().catch(() => null);
  const brackets = parseBrackets(data);
  if (!brackets) {
    console.warn('[taxBrackets] invalid response body', { year, data });
    throw new ApiError('Invalid tax API response', res.status, 'validation');
  }
  return brackets;
}

function parseBrackets(data: unknown): Bracket[] | null {
  if (!data || typeof data !== 'object') return null;
  const raw = (data as { tax_brackets?: unknown }).tax_brackets;
  if (!Array.isArray(raw)) return null;

  const out: Bracket[] = [];
  for (const b of raw) {
    if (!b || typeof b !== 'object') return null;
    const rec = b as Record<string, unknown>;
    if (typeof rec.min !== 'number' || typeof rec.rate !== 'number') return null;
    if (rec.max !== undefined && typeof rec.max !== 'number') return null;
    const bracket: Bracket = { min: rec.min, rate: rec.rate };
    if (typeof rec.max === 'number') bracket.max = rec.max;
    out.push(bracket);
  }
  return out;
}
