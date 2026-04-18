import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading } from './Loading';

describe('Loading', () => {
  test('exposes a status role with visible label', () => {
    render(<Loading />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent(/loading tax brackets/i);
  });
});
