import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorState } from './AsyncStates';
import { adaptProblem } from '../../../lib/api/problem';
describe('ErrorState', () => {
  it.each([401, 403, 404, 409, 412, 422, 429, 503])('renders status %s', (status) => {
    render(<ErrorState problem={adaptProblem({ title: 'Lỗi', correlation_id: 'cid' }, status)} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/cid/)).toBeInTheDocument();
  });
});
