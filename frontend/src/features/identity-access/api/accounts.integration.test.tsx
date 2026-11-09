import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ids, mockStore } from '../../../mocks/store/identity-access-store';
import {
  useAccount,
  useAccounts,
  useCreateAccount,
  useRevokeAccountSessions,
  useUpdateAccount,
} from '../queries/accounts';

function harness() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
beforeEach(() => {
  mockStore.reset();
  mockStore.session = { accountId: ids.admin };
});
afterEach(cleanup);

describe('account contract hooks', () => {
  it('lists with default page size and creates an account', async () => {
    const wrapper = harness();
    const list = renderHook(() => useAccounts({}), { wrapper });
    await waitFor(() => expect(list.result.current.status).not.toBe('pending'));
    expect(list.result.current.error).toBeNull();
    expect(list.result.current.data?.items.length).toBe(2);
    const create = renderHook(() => useCreateAccount(), { wrapper });
    await act(async () => {
      await create.result.current.mutateAsync({
        username: 'new.user',
        email: 'new@example.test',
        display_name: 'Account mới',
        initial_password: 'password-demo-123',
      });
    });
    expect(mockStore.accounts.some((a) => a.username === 'new.user')).toBe(true);
  });
  it('uses current ETag and rejects stale updates', async () => {
    const wrapper = harness();
    const detail = renderHook(() => useAccount(ids.user), { wrapper });
    await waitFor(() => expect(detail.result.current.isSuccess).toBe(true));
    expect(detail.result.current.data?.etag).toBe('"1"');
    const update = renderHook(() => useUpdateAccount(ids.user), { wrapper });
    await act(async () => {
      await update.result.current.mutateAsync({ patch: { status: 'locked' }, etag: '"1"' });
    });
    expect(mockStore.accounts.find((a) => a.id === ids.user)?.status).toBe('locked');
    await expect(
      update.result.current.mutateAsync({ patch: { status: 'active' }, etag: '"1"' }),
    ).rejects.toMatchObject({ status: 412, category: 'stale' });
  });
  it('revokes sessions idempotently', async () => {
    const wrapper = harness();
    const revoke = renderHook(() => useRevokeAccountSessions(ids.user), { wrapper });
    await act(async () => {
      await revoke.result.current.mutateAsync();
      await revoke.result.current.mutateAsync();
    });
    expect(revoke.result.current.isError).toBe(false);
  });
});
