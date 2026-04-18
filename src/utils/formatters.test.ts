import { describe, test, expect } from 'vitest';
import { formatCurrency, formatPercent, formatBracketRange } from './formatters';

describe('formatCurrency', () => {
  test.each([
    [0, '$0.00'],
    [7500, '$7,500.00'],
    [17739.17, '$17,739.17'],
    [1234567.89, '$1,234,567.89'],
  ])('formats %s as %s', (n, expected) => {
    expect(formatCurrency(n)).toBe(expected);
  });
});

describe('formatPercent', () => {
  test.each([
    [0, '0.00%'],
    [0.15, '15.00%'],
    [0.1774, '17.74%'],
    [0.205, '20.50%'],
  ])('formats %s as %s', (n, expected) => {
    expect(formatPercent(n)).toBe(expected);
  });
});

describe('formatBracketRange', () => {
  test('bounded bracket', () => {
    expect(formatBracketRange({ min: 0, max: 50197 })).toBe('$0 – $50,197');
  });

  test('upper brackets', () => {
    expect(formatBracketRange({ min: 50197, max: 100392 })).toBe('$50,197 – $100,392');
  });

  test('top (open-ended) bracket', () => {
    expect(formatBracketRange({ min: 221708 })).toBe('$221,708+');
  });
});
