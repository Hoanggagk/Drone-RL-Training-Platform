import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '../../../generated/api-schema';
import { api } from '../../../lib/api/client';
import { csrf } from '../../../lib/api/csrf';
import { ensureOk, unwrap } from '../../../lib/api/request';
import { problemFromResponse } from '../../../lib/api/problem';
import { guardAccountPage } from '../../../lib/api/response-guards';

export type Account = components['schemas']['Account'];
export type AccountCreate = components['schemas']['AccountCreate'];
export type AccountPatch = components['schemas']['AccountPatch'];
export type AccountStatus = components['schemas']['AccountStatus'];
export type AccountFilters = {
  query?: string;
  status?: AccountStatus;
  cursor?: string;
  pageSize?: number;
};
export type AccountDetail = { account: Account; etag: string };

const mutationHeaders = () => ({
  'X-CSRF-Token': csrf.get() ?? '',
  Origin: window.location.origin,
});

export function useAccounts(filters: AccountFilters) {
  return useQuery({
    queryKey: ['accounts', filters],
    queryFn: async () =>
      guardAccountPage(
        await unwrap(
          await api.GET('/api/v1/admin/accounts', {
            params: {
              query: {
                query: filters.query || undefined,
                status: filters.status,
                cursor: filters.cursor,
                page_size: filters.pageSize ?? 25,
              },
            },
          }),
        ),
      ),
  });
}

export function useAccount(accountId: string | undefined) {
  return useQuery({
    queryKey: ['account', accountId],
    enabled: Boolean(accountId),
    queryFn: async (): Promise<AccountDetail> => {
      const result = await api.GET('/api/v1/admin/accounts/{account_id}', {
        params: { path: { account_id: accountId! } },
      });
      if (!result.response.ok || !result.data) throw await problemFromResponse(result.response);
      return {
        account: result.data,
        etag: result.response.headers.get('ETag') ?? `"${result.data.version}"`,
      };
    },
  });
}

export function useCreateAccount() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: AccountCreate) =>
      unwrap(
        await api.POST('/api/v1/admin/accounts', {
          params: { header: { ...mutationHeaders(), 'Idempotency-Key': crypto.randomUUID() } },
          body,
        }),
      ),
    onSuccess: () => client.invalidateQueries({ queryKey: ['accounts'] }),
  });
}

export function useUpdateAccount(accountId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ patch, etag }: { patch: AccountPatch; etag: string }) =>
      unwrap(
        await api.PATCH('/api/v1/admin/accounts/{account_id}', {
          params: {
            path: { account_id: accountId },
            header: { ...mutationHeaders(), 'If-Match': etag },
          },
          body: patch,
          headers: { 'Content-Type': 'application/merge-patch+json' },
        }),
      ),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['account', accountId] });
      await client.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useRevokeAccountSessions(accountId: string) {
  return useMutation({
    mutationFn: async () =>
      ensureOk(
        await api.DELETE('/api/v1/admin/accounts/{account_id}/sessions', {
          params: { path: { account_id: accountId }, header: mutationHeaders() },
        }),
      ),
  });
}
