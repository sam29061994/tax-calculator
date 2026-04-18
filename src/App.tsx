import { useMemo, useState } from 'react';
import { TaxForm } from './components/TaxForm';
import { Results } from './components/Results';
import { ErrorState } from './components/ErrorState';
import { Loading } from './components/Loading';
import { useTaxBrackets } from './hooks/useTaxBrackets';
import { calculateTax } from './utils/taxCalculator';

type Submission = { salary: number; year: number };

function App() {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const query = useTaxBrackets(submission?.year ?? null);

  const result = useMemo(() => {
    if (!submission || !query.data) return null;
    return calculateTax(submission.salary, query.data);
  }, [submission, query.data]);

  return (
    <main className="min-h-screen bg-slate-50 py-10 md:py-16">
      <div className="mx-auto max-w-2xl px-4">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Tax calculator
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter an annual salary and a Canadian tax year.
          </p>
        </header>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <TaxForm onSubmit={(salary, year) => setSubmission({ salary, year })} />
        </div>

        {submission && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {query.isPending && <Loading />}
            {query.isError && <ErrorState onRetry={() => query.refetch()} />}
            {result && <Results result={result} />}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
