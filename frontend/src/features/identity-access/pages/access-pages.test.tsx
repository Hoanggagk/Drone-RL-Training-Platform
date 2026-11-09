import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ids, mockStore } from '../../../mocks/store/identity-access-store';
import { MembershipsPage } from './MembershipsPage';
import { RolesPage } from './RolesPage';
const renderPage = (node: React.ReactNode) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        })
      }
    >
      <MemoryRouter>{node}</MemoryRouter>
    </QueryClientProvider>,
  );
beforeEach(() => {
  mockStore.reset();
  mockStore.session = { accountId: ids.admin };
});
describe('access pages', () => {
  it('shows read-only catalog and binding history', async () => {
    renderPage(<RolesPage />);
    expect(screen.getByRole('heading', { name: /Role và quyền/ })).toBeVisible();
    expect((await screen.findAllByText('platform_admin')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Global role bindings')).toBeVisible();
  });
  it('labels opaque project scope and validates membership form', async () => {
    const user = userEvent.setup();
    renderPage(<MembershipsPage />);
    expect(screen.getByText(/mã phạm vi opaque/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Gán membership' }));
    expect(await screen.findByText('Nhập Project ID')).toBeVisible();
    expect(screen.getByText('Nhập Account ID')).toBeVisible();
  });
  it('renders revoked history', async () => {
    mockStore.memberships.push({
      id: '40000000-0000-4000-8000-000000000001',
      project_id: ids.project,
      account_id: ids.user,
      role_code: 'learner',
      status: 'revoked',
      created_by: ids.admin,
      created_at: '2026-01-01T00:00:00Z',
      revoked_by: ids.admin,
      revoked_at: '2026-01-01T01:00:00Z',
      version: 2,
    });
    renderPage(<MembershipsPage />);
    expect(await screen.findByText('revoked')).toBeVisible();
  });
});
