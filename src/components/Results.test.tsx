import { describe, test, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Results } from './Results';
import { calculateTax, type Bracket } from '../utils/taxCalculator';

const brackets2022: Bracket[] = [
  { min: 0, max: 50197, rate: 0.15 },
  { min: 50197, max: 100392, rate: 0.205 },
  { min: 100392, max: 155625, rate: 0.26 },
  { min: 155625, max: 221708, rate: 0.29 },
  { min: 221708, rate: 0.33 },
];

describe('Results', () => {
  test('renders total and effective rate for a 50k salary', () => {
    render(<Results result={calculateTax(50000, brackets2022)} />);

    expect(screen.getByText('Total tax').nextSibling).toHaveTextContent('$7,500.00');
    expect(screen.getByText('Effective rate').nextSibling).toHaveTextContent('15.00%');
  });

  test('renders one row per band with range, rate, taxable, and tax', () => {
    render(<Results result={calculateTax(100000, brackets2022)} />);

    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows).toHaveLength(6);

    const firstBand = within(rows[1]).getAllByRole('cell').map((c) => c.textContent);
    expect(firstBand).toEqual([
      '$0 – $50,197',
      '15.00%',
      '$50,197.00',
      '$7,529.55',
    ]);
  });

  test('shows the top open-ended bracket as min+', () => {
    render(<Results result={calculateTax(500000, brackets2022)} />);
    expect(screen.getByText('$221,708+')).toBeInTheDocument();
  });

  test('renders zero-taxable bands but dims them', () => {
    const { container } = render(<Results result={calculateTax(10000, brackets2022)} />);

    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows).toHaveLength(6);

    const dimmed = container.querySelectorAll('tr.text-slate-400');
    expect(dimmed.length).toBe(4);
  });
});
