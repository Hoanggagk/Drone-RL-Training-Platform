import { describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './LoginPage';
describe('LoginPage', () => {
  it('has visible labels and blocks incomplete submit', async () => {
    renderPage();
    expect(screen.getByLabelText('Tên đăng nhập hoặc email')).toBeVisible();
    expect(screen.getByLabelText('Mật khẩu')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(await screen.findByText('Nhập tên đăng nhập hoặc email')).toBeVisible();
    cleanup();
    await new Promise((resolve) => setTimeout(resolve, 120));
  });
});
function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
