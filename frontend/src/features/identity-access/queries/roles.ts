import { useMutation, useQuery } from '@tanstack/react-query';
import type { components } from '../../../generated/api-schema';
import { api } from '../../../lib/api/client';
import { csrf } from '../../../lib/api/csrf';
import { ensureOk, unwrap } from '../../../lib/api/request';
import { queryClient } from '../../../app/query-client';

type Scope = components['schemas']['RoleScopeType'];
type BindingCreate = components['schemas']['GlobalRoleBindingCreate'];

const mutationHeaders = (idempotencyKey?: string) => ({
  'X-CSRF-Token': csrf.get() ?? '',
  Origin: window.location.origin,
  ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
});

export function useRoleDefinitions(scopeType?: Scope) {
  return useQuery({
    queryKey: ['iam', 'roles', scopeType],
    queryFn: async () =>
      unwrap(await api.GET('/api/v1/iam/roles', { params: { query: { scope_type: scopeType } } })),
  });
}

export function useGlobalRoleBindings(accountId?: string) {
  return useQuery({
    queryKey: ['iam', 'global-bindings', accountId],
    queryFn: async () =>
      unwrap(
        await api.GET('/api/v1/iam/global-role-bindings', {
          params: { query: { account_id: accountId, page_size: 25 } },
        }),
      ),
  });
}

export function useCreateGlobalRoleBinding() {
  return useMutation({
    mutationFn: async (body: BindingCreate) =>
      unwrap(
        await api.POST('/api/v1/iam/global-role-bindings', {
          params: { header: mutationHeaders(crypto.randomUUID()) },
          body,
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['iam', 'global-bindings'] }),
  });
}

export function useRevokeGlobalRoleBinding() {
  return useMutation({
    mutationFn: async (bindingId: string) =>
      ensureOk(
        await api.DELETE('/api/v1/iam/global-role-bindings/{binding_id}', {
          params: { path: { binding_id: bindingId }, header: mutationHeaders() },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['iam', 'global-bindings'] }),
  });
}
