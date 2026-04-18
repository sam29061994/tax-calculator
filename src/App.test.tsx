import type { ReactNode } from 'react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse, delay } from 'msw';
import App from './App';
import { server } from './test/msw/server';
import { TAX_URL, brackets2022 } from './test/msw/handlers';

function renderApp() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(<App />, { wrapper: Wrapper });
}

describe('App', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('calculates tax for 2022 / $100,000 and renders the full breakdown', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/annual salary/i), '100000');
    await user.selectOptions(screen.getByLabelText(/tax year/i), '2022');
    await user.click(screen.getByRole('button', { name: /calculate/i }));

    expect(await screen.findByText('$17,739.17')).toBeInTheDocument();
    expect(screen.getByText('17.74%')).toBeInTheDocument();

    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows).toHaveLength(1 + brackets2022.length);
  });

  test('blocks submission on invalid input and never renders results', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByText(/enter your salary/i)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /tax results/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('shows a loading indicator while the API is in flight', async () => {
    server.use(
      http.get(TAX_URL, async () => {
        await delay(50);
        return HttpResponse.json({ tax_brackets: brackets2022 });
      }),
    );

    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/annual salary/i), '50000');
    await user.selectOptions(screen.getByLabelText(/tax year/i), '2022');
    await user.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
    await screen.findByRole('region', { name: /tax results/i });
    expect(screen.getByText('Total tax').nextElementSibling).toHaveTextContent('$7,500.00');
  });

  test('shows an error on API failure and recovers after the user retries', async () => {
    server.use(
      http.get(TAX_URL, () => HttpResponse.json({ errors: [] }, { status: 404 })),
    );

    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/annual salary/i), '50000');
    await user.selectOptions(screen.getByLabelText(/tax year/i), '2022');
    await user.click(screen.getByRole('button', { name: /calculate/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't load/i);

    server.use(
      http.get(TAX_URL, () => HttpResponse.json({ tax_brackets: brackets2022 })),
    );

    await user.click(screen.getByRole('button', { name: /try again/i }));

    await screen.findByRole('region', { name: /tax results/i });
    expect(screen.getByText('Total tax').nextElementSibling).toHaveTextContent('$7,500.00');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
