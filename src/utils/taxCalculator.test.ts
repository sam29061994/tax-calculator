import { describe, test, expect } from 'vitest';
import { calculateTax, type Bracket } from './taxCalculator';

const brackets2022: Bracket[] = [
  { min: 0, max: 50197, rate: 0.15 },
  { min: 50197, max: 100392, rate: 0.205 },
  { min: 100392, max: 155625, rate: 0.26 },
  { min: 155625, max: 221708, rate: 0.29 },
  { min: 221708, rate: 0.33 },
];

describe('calculateTax: spec fixtures', () => {
  test('$0 salary → $0 tax', () => {
    const r = calculateTax(0, brackets2022);
    expect(r.total).toBe(0);
    expect(r.effectiveRate).toBe(0);
    expect(r.bands.every((b) => b.tax === 0)).toBe(true);
  });

  test('$50,000 → $7,500.00', () => {
    const r = calculateTax(50_000, brackets2022);
    expect(r.total).toBeCloseTo(7500, 2);
  });

  test('$100,000 → $17,739.17', () => {
    const r = calculateTax(100_000, brackets2022);
    expect(r.total).toBeCloseTo(17739.17, 2);
  });

  test('$1,234,567 → $385,587.65 (math gives 385587.645, rounds up at display)', () => {
    const r = calculateTax(1_234_567, brackets2022);
    expect(r.total).toBeCloseTo(385587.645, 2);
  });

  test('effective rate for $100,000 ≈ 17.74%', () => {
    const r = calculateTax(100_000, brackets2022);
    expect(r.effectiveRate).toBeCloseTo(0.1774, 4);
  });
});

describe('calculateTax: edge cases', () => {
  test('negative salary is treated as zero', () => {
    const r = calculateTax(-5000, brackets2022);
    expect(r.total).toBe(0);
    expect(r.effectiveRate).toBe(0);
  });

  test('empty brackets → zero tax', () => {
    const r = calculateTax(50_000, []);
    expect(r.total).toBe(0);
    expect(r.bands).toHaveLength(0);
    expect(r.effectiveRate).toBe(0);
  });

  test('salary exactly on a bracket boundary fills the lower band, not the next', () => {
    const r = calculateTax(50_197, brackets2022);
    expect(r.bands[0].taxable).toBe(50_197);
    expect(r.bands[0].tax).toBeCloseTo(50_197 * 0.15, 2);
    expect(r.bands[1].taxable).toBe(0);
    expect(r.bands[1].tax).toBe(0);
  });

  test('very high salary exercises the top (open-ended) bracket', () => {
    const r = calculateTax(1_000_000, brackets2022);
    const topBand = r.bands[r.bands.length - 1];
    expect(topBand.min).toBe(221_708);
    expect(topBand.taxable).toBeCloseTo(1_000_000 - 221_708, 2);
  });

  test('unsorted brackets still produce correct totals', () => {
    const shuffled = [brackets2022[3], brackets2022[0], brackets2022[4], brackets2022[2], brackets2022[1]];
    const r = calculateTax(100_000, shuffled);
    expect(r.total).toBeCloseTo(17739.17, 2);
    expect(r.bands.map((b) => b.min)).toEqual([0, 50_197, 100_392, 155_625, 221_708]);
  });
});

describe('calculateTax: per-band breakdown', () => {
  test('$100,000 hits exactly two bands', () => {
    const r = calculateTax(100_000, brackets2022);
    expect(r.bands[0].taxable).toBe(50_197);
    expect(r.bands[0].tax).toBeCloseTo(50_197 * 0.15, 2);
    expect(r.bands[1].taxable).toBeCloseTo(100_000 - 50_197, 2);
    expect(r.bands[1].tax).toBeCloseTo((100_000 - 50_197) * 0.205, 2);
    expect(r.bands[2].taxable).toBe(0);
    expect(r.bands[3].taxable).toBe(0);
    expect(r.bands[4].taxable).toBe(0);
  });
});
