const currencyFmt = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const wholeDollarFmt = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
});

const percentFmt = new Intl.NumberFormat('en-CA', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  return currencyFmt.format(amount);
}

export function formatPercent(rate: number): string {
  return percentFmt.format(rate);
}

export function formatBracketRange(bracket: { min: number; max?: number }): string {
  const lo = wholeDollarFmt.format(bracket.min);
  if (bracket.max === undefined) return `${lo}+`;
  return `${lo} – ${wholeDollarFmt.format(bracket.max)}`;
}
