export type Bracket = {
  min: number;
  max?: number;
  rate: number;
};

export type Band = {
  min: number;
  max?: number;
  rate: number;
  taxable: number;
  tax: number;
};

export type TaxResult = {
  total: number;
  effectiveRate: number;
  bands: Band[];
};

export function calculateTax(salary: number, brackets: Bracket[]): TaxResult {
  const income = Math.max(0, salary);
  const sorted = [...brackets].sort((a, b) => a.min - b.min);

  const bands: Band[] = sorted.map((b) => {
    const ceiling = b.max ?? Infinity;
    const taxable = Math.max(0, Math.min(income, ceiling) - b.min);
    return {
      min: b.min,
      max: b.max,
      rate: b.rate,
      taxable,
      tax: taxable * b.rate,
    };
  });

  const total = bands.reduce((sum, b) => sum + b.tax, 0);
  const effectiveRate = income > 0 ? total / income : 0;

  return { total, effectiveRate, bands };
}
