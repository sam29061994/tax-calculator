import type { ReactNode } from 'react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTaxBrackets, shouldRetry } from './useTaxBrackets';
import { ApiError } from '../api/taxBrackets';

const brackets2022 = [
  { min: 0, max: 50197, rate: 0.15 },
  { min: 50197, max: 100392, rate: 0.205 },
  { min: 221708, rate: 0.33 },
];

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

function wrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe('shouldRetry', () => {
  test('retries network errors up to the cap', () => {
    const err = new ApiError('offline', 0, 'network');
    expect(shouldRetry(0, err)).toBe(true);
    expect(shouldRetry(2, err)).toBe(true);
    expect(shouldRetry(3, err)).toBe(false);
  });

  test('retries 5xx http errors', () => {
    const err = new ApiError('server', 500, 'http');
    expect(shouldRetry(0, err)).toBe(true);
  });

  test('does not retry 4xx http errors', () => {
    const err = new ApiError('bad url', 404, 'http');
    expect(shouldRetry(0, err)).toBe(false);
  });

  test('does not retry validation errors', () => {
    const err = new ApiError('bad body', 200, 'validation');
    expect(shouldRetry(0, err)).toBe(false);
  });

  test('retries unknown errors as transient', () => {
    expect(shouldRetry(0, new Error('weird'))).toBe(true);
  });
});

describe('useTaxBrackets', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('fetches brackets when a year is provided', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ tax_brackets: brackets2022 }));
    const { result } = renderHook(() => useTaxBrackets(2022), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(brackets2022);
  });

  test('does not fetch when year is null', () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ tax_brackets: brackets2022 }));
    const { result } = renderHook(() => useTaxBrackets(null), { wrapper: wrapper() });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('idle');
  });

  test('surfaces a typed ApiError without retrying when the predicate rejects', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ errors: [] }, 404));
    const { result } = renderHook(() => useTaxBrackets(2022), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.error?.code).toBe('http');
    expect(result.current.error?.status).toBe(404);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
