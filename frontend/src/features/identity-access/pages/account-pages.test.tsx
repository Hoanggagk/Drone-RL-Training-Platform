import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ids, mockStore } from '../../../mocks/store/identity-access-store';
import { AccountCreateForm } from '../components/AccountCreateForm';
import { AccountDetailPage } from './AccountDetailPage';
import { AccountsPage } from './AccountsPage';

const renderWithApp = (node: React.ReactNode, path = '/iam/accounts') => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>
    </QueryClientProvider>,
  );
};
beforeEach(() => {
  mockStore.reset();
  mockStore.session = { accountId: ids.admin };
});
afterEach(cleanup);

describe('account pages', () => {
  it('validates all OpenAPI create constraints with visible labels', async () => {
    const submit = vi.fn();
    render(<AccountCreateForm onSubmit={submit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tạo account' }));
    expect(await screen.findByText('Nhập tên đăng nhập')).toBeVisible();
    await userEvent.type(screen.getByLabelText('Tên đăng nhập'), 'UP');
    await userEvent.type(screen.getByLabelText('Email'), 'invalid');
    await userEvent.type(screen.getByLabelText('Tên hiển thị'), 'A');
    await userEvent.type(screen.getByLabelText('Mật khẩu ban đầu'), 'short');
    fireEvent.click(screen.getByRole('button', { name: 'Tạo account' }));
    expect(await screen.findByText(/3–64/)).toBeVisible();
    expect(submit).not.toHaveBeenCalled();
  });
  it('distinguishes initial empty and filtered empty states', async () => {
    mockStore.accounts = [];
    renderWithApp(<AccountsPage />);
    expect(await screen.findByText('Chưa có account')).toBeVisible();
    await userEvent.type(screen.getByLabelText('Tìm account'), 'none');
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByText('Không có account khớp bộ lọc')).toBeVisible();
  });
  it('shows detail and stale recovery without last-write-wins', async () => {
    mockStore.scenario = 'stale-account';
    renderWithApp(
      <Routes>
        <Route path="/iam/accounts/:accountId" element={<AccountDetailPage />} />
      </Routes>,
      `/iam/accounts/${ids.user}`,
    );
    expect(await screen.findByText('Người học mẫu')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(await screen.findByText('Account đã được người khác cập nhật')).toBeVisible();
    expect(mockStore.accounts.find((a) => a.id === ids.user)?.version).toBe(1);
  });
  it('renders loading then successful table', async () => {
    renderWithApp(<AccountsPage />);
    expect(screen.getByRole('status')).toBeVisible();
    await waitFor(() => expect(screen.getByText('admin')).toBeVisible());
  });
});
