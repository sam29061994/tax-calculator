import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchTaxBrackets, ApiError } from './taxBrackets';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('fetchTaxBrackets', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('returns tax_brackets on 200', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({
        tax_brackets: [
          { min: 0, max: 50197, rate: 0.15 },
          { min: 221708, rate: 0.33 },
        ],
      }),
    );
    const brackets = await fetchTaxBrackets(2022);
    expect(brackets).toEqual([
      { min: 0, max: 50197, rate: 0.15 },
      { min: 221708, rate: 0.33 },
    ]);
  });

  test('hits the correct URL', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ tax_brackets: [] }));
    await fetchTaxBrackets(2022);
    expect(fetch).toHaveBeenCalledWith('http://localhost:5001/tax-calculator/tax-year/2022');
  });

  test('500 → ApiError with status=500 and code="http"', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ errors: [] }, 500));
    await expect(fetchTaxBrackets(2022)).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      code: 'http',
    });
  });

  test('404 → ApiError with status=404 and code="http"', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ errors: [] }, 404));
    await expect(fetchTaxBrackets(2022)).rejects.toMatchObject({
      status: 404,
      code: 'http',
    });
  });

  test('malformed body → ApiError with code="validation"', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ wrong: 'shape' }));
    await expect(fetchTaxBrackets(2022)).rejects.toMatchObject({ code: 'validation' });
  });

  test('bracket missing min or rate → validation error', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ tax_brackets: [{ max: 50197, rate: 0.15 }] }),
    );
    await expect(fetchTaxBrackets(2022)).rejects.toMatchObject({ code: 'validation' });
  });

  test('fetch rejects (offline) → ApiError with code="network", status=0', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(fetchTaxBrackets(2022)).rejects.toMatchObject({
      code: 'network',
      status: 0,
    });
  });

  test('ApiError is an actual Error subclass', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}, 500));
    await expect(fetchTaxBrackets(2022)).rejects.toBeInstanceOf(ApiError);
    await expect(fetchTaxBrackets(2022)).rejects.toBeInstanceOf(Error);
  });
});
