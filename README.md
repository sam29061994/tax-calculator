# Tax calculator

Canadian income tax calculator. React + Vite + TypeScript SPA. Fetches marginal tax brackets from a local Docker API and returns total tax, effective rate, and a per-bracket breakdown. Supported years: 2019 to 2023.

## Prerequisites

- Node 20+
- pnpm (npm or yarn also work)
- Docker (the API runs as a local container)

## Running

Start the API:

```bash
docker pull ptsdocker16/interview-test-server
docker run --init -p 5001:5001 -it ptsdocker16/interview-test-server
```

Then the app:

```bash
pnpm install
pnpm dev
```

Dev server prints the URL. Pick a year, enter a salary, hit Calculate.

## Testing

```bash
pnpm test                              # Vitest full suite
pnpm test:watch                        # watch mode
pnpm test src/App.test.tsx             # one file
pnpm test -t "effective rate"          # one test name
pnpm build                             # type-check + production build
pnpm lint
```

No tests hit the real API. App-level tests use MSW. Client and hook tests stub `fetch` directly.

## Project layout

```
src/
  api/          fetchTaxBrackets, ApiError
  hooks/        useTaxBrackets (React Query wrapper)
  utils/        calculateTax, Intl-based formatters
  components/   TaxForm, Results, ErrorState, Loading
  test/msw/     handlers and server for integration tests
  App.tsx
```

## Notes

Pure math lives in `utils/`, HTTP in `api/`, React Query in `hooks/`. Each layer tests on its own.

`fetchTaxBrackets` throws a typed `ApiError` with `status` and `code`, where `code` is `'http' | 'network' | 'validation'`. Status alone isn't enough to decide how to recover: a 200 with a malformed body, a 404, and a network failure all need different handling. The retry policy reads off `code`:

- retry `network` and 5xx up to 3 times with exponential backoff, capped at 10s
- don't retry 4xx (client problem)
- don't retry `validation` (body shape won't change on retry)

`shouldRetry(failureCount, error)` is exported so it's unit-testable without React Query.

`parseBrackets` hand-validates the response. No `zod` — it's one small shape.

`calculateTax(salary, brackets)` returns `{ total, effectiveRate, bands[] }`. Each band carries its own `taxable` and `tax` so the UI doesn't re-derive anything. Negative salary clamps to 0. Sorts a copy so bracket order doesn't matter.

The year dropdown is gated to 2019 to 2023. The mock API 404s on unsupported years and throws random 500s on supported ones, so gating at the form means any 500 we see is worth retrying.

## Assumptions

- Canadian brackets. Formatting uses `en-CA` and `CAD`.
- Top bracket has no `max`. Treated as Infinity.
- Zero-taxable bands still render, dimmed, so the full structure for the year is visible.
- Errors go to `console.warn` / `console.error`. In a real app these would pipe into something like Sentry.

## What I'd add with more time

- Run axe-core in the component tests (via vitest-axe). Labels, `aria-invalid`, `aria-describedby`, `role="status"` and `role="alert"` are in, but nothing is measured.
- Logger interface instead of raw `console`.
- A horizontal bar showing how salary splits across bands. Skipped for time.
- Debounced live calculation instead of an explicit submit.
