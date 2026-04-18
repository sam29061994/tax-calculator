import type { TaxResult } from '../utils/taxCalculator';
import { formatBracketRange, formatCurrency, formatPercent } from '../utils/formatters';

type Props = {
  result: TaxResult;
};

export function Results({ result }: Props) {
  return (
    <section aria-label="Tax results" className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-600">Total tax</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {formatCurrency(result.total)}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-600">Effective rate</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {formatPercent(result.effectiveRate)}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-sm font-medium text-slate-700">Breakdown by bracket</h3>
        <div className="mt-2 -mx-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-2 py-2 font-medium">Bracket</th>
                <th scope="col" className="px-2 py-2 font-medium">Rate</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">Taxable</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">Tax</th>
              </tr>
            </thead>
            <tbody>
              {result.bands.map((band) => {
                const empty = band.taxable === 0;
                return (
                  <tr
                    key={band.min}
                    className={`border-b border-slate-100 last:border-0 ${empty ? 'text-slate-400' : 'text-slate-800'}`}
                  >
                    <td className="whitespace-nowrap px-2 py-2">{formatBracketRange(band)}</td>
                    <td className="px-2 py-2">{formatPercent(band.rate)}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{formatCurrency(band.taxable)}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{formatCurrency(band.tax)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
