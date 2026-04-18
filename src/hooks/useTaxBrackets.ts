import { useQuery } from '@tanstack/react-query';
import { fetchTaxBrackets, ApiError } from '../api/taxBrackets';
import type { Bracket } from '../utils/taxCalculator';

const FIVE_MINUTES = 5 * 60 * 1000;
const MAX_RETRIES = 3;

export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  if (error instanceof ApiError) {
    if (error.code === 'validation') return false;
    if (error.code === 'http' && error.status < 500) return false;
  }
  return true;
}

export function useTaxBrackets(year: number | null) {
  return useQuery<Bracket[], ApiError>({
    queryKey: ['taxBrackets', year],
    queryFn: () => fetchTaxBrackets(year!),
    enabled: year !== null,
    retry: shouldRetry,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    staleTime: FIVE_MINUTES,
  });
}
