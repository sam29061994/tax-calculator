import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaxForm } from './TaxForm';

describe('TaxForm', () => {
  test('renders salary input, year select, and submit button', () => {
    render(<TaxForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/annual salary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tax year/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calculate/i })).toBeInTheDocument();
  });

  test('year dropdown only offers supported years', () => {
    render(<TaxForm onSubmit={vi.fn()} />);
    const options = screen.getAllByRole('option').map((o) => o.textContent);
    expect(options).toEqual(['Select a year', '2022', '2021', '2020', '2019']);
  });

  test('submits parsed numeric values on valid input', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TaxForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/annual salary/i), '100000');
    await user.selectOptions(screen.getByLabelText(/tax year/i), '2022');
    await user.click(screen.getByRole('button', { name: /calculate/i }));

    expect(onSubmit).toHaveBeenCalledWith(100000, 2022);
  });

  test('shows errors on empty submit and suppresses the callback', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TaxForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /calculate/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/enter your salary/i)).toBeInTheDocument();
    expect(screen.getByText(/pick a year/i)).toBeInTheDocument();
  });

  test('rejects negative salary', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TaxForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/annual salary/i), '-500');
    await user.selectOptions(screen.getByLabelText(/tax year/i), '2022');
    await user.click(screen.getByRole('button', { name: /calculate/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/cannot be negative/i)).toBeInTheDocument();
  });

  test('accepts $0 as a valid salary', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TaxForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/annual salary/i), '0');
    await user.selectOptions(screen.getByLabelText(/tax year/i), '2022');
    await user.click(screen.getByRole('button', { name: /calculate/i }));

    expect(onSubmit).toHaveBeenCalledWith(0, 2022);
  });

  test('clears a field error when the user edits that field', async () => {
    const user = userEvent.setup();
    render(<TaxForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /calculate/i }));
    expect(screen.getByText(/enter your salary/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/annual salary/i), '1');
    expect(screen.queryByText(/enter your salary/i)).not.toBeInTheDocument();
  });

  test('marks invalid fields with aria-invalid', async () => {
    const user = userEvent.setup();
    render(<TaxForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByLabelText(/annual salary/i)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/tax year/i)).toHaveAttribute('aria-invalid', 'true');
  });
});
