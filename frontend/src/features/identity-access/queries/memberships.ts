import { useMutation, useQuery } from '@tanstack/react-query';
import type { components } from '../../../generated/api-schema';
import { queryClient } from '../../../app/query-client';
import { api } from '../../../lib/api/client';
import { csrf } from '../../../lib/api/csrf';
import { ensureOk, unwrap } from '../../../lib/api/request';

export type MembershipFilters = {
  projectId?: string;
  accountId?: string;
  status?: components['schemas']['MembershipStatus'];
  cursor?: string;
  pageSize?: number;
};
type MembershipCreate = components['schemas']['MembershipCreate'];
const headers = (idempotencyKey?: string) => ({
  'X-CSRF-Token': csrf.get() ?? '',
  Origin: window.location.origin,
  ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
});

export function useProjectMemberships(filters: MembershipFilters = {}) {
  return useQuery({
    queryKey: ['iam', 'memberships', filters],
    queryFn: async () =>
      unwrap(
        await api.GET('/api/v1/iam/project-memberships', {
          params: {
            query: {
              project_id: filters.projectId,
              account_id: filters.accountId,
              status: filters.status,
              cursor: filters.cursor,
              page_size: filters.pageSize ?? 25,
            },
          },
        }),
      ),
  });
}
export function useProjectMembership(id?: string) {
  return useQuery({
    queryKey: ['iam', 'membership', id],
    enabled: Boolean(id),
    queryFn: async () =>
      unwrap(
        await api.GET('/api/v1/iam/project-memberships/{membership_id}', {
          params: { path: { membership_id: id! } },
        }),
      ),
  });
}
export function useCreateProjectMembership() {
  return useMutation({
    mutationFn: async (body: MembershipCreate) =>
      unwrap(
        await api.POST('/api/v1/iam/project-memberships', {
          params: { header: headers(crypto.randomUUID()) },
          body,
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['iam', 'memberships'] }),
  });
}
export function useRevokeProjectMembership() {
  return useMutation({
    mutationFn: async (id: string) =>
      ensureOk(
        await api.DELETE('/api/v1/iam/project-memberships/{membership_id}', {
          params: { path: { membership_id: id }, header: headers() },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['iam', 'memberships'] }),
  });
}
