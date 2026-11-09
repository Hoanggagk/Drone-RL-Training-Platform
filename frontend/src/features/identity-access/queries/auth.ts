import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api/client';
import { csrf } from '../../../lib/api/csrf';
import { ensureOk, unwrap } from '../../../lib/api/request';
import { clearPrivateCache } from '../../../app/query-client';
import type { PropsWithChildren } from 'react';
import { guardIdentity } from '../../../lib/api/response-guards';

export const identityKey = ['mod01', 'identity'] as const;
export function AuthProvider({ children }: PropsWithChildren) {
  return children;
}
export const useAuth = useCurrentIdentity;

export function useCurrentIdentity(enabled = true) {
  return useQuery({
    queryKey: identityKey,
    enabled,
    retry: false,
    queryFn: async () => guardIdentity(await unwrap(await api.GET('/api/v1/auth/me'))),
  });
}

async function refreshCsrf() {
  const token = await unwrap(await api.GET('/api/v1/auth/csrf-token'));
  csrf.set(token.csrf_token);
}

export function useLogin() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async (body: { login: string; password: string }) => {
      const session = await unwrap(
        await api.POST('/api/v1/auth/sessions', {
          body,
          params: { header: { Origin: globalThis.location?.origin ?? 'http://localhost' } },
        }),
      );
      await refreshCsrf();
      return session;
    },
    onSuccess: (session) => cache.setQueryData(identityKey, session.account),
  });
}

export function useChangePassword() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async (body: { current_password: string; new_password: string }) => {
      const rotated = await unwrap(
        await api.PUT('/api/v1/auth/password', {
          body,
          params: {
            header: {
              Origin: globalThis.location?.origin ?? 'http://localhost',
              'X-CSRF-Token': csrf.get() ?? '',
            },
          },
        }),
      );
      csrf.set(rotated.csrf_token);
      return rotated;
    },
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: identityKey });
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () =>
      ensureOk(
        await api.DELETE('/api/v1/auth/sessions/current', {
          params: {
            header: {
              Origin: globalThis.location?.origin ?? 'http://localhost',
              'X-CSRF-Token': csrf.get() ?? '',
            },
          },
        }),
      ),
    onSettled: async () => {
      csrf.clear();
      await clearPrivateCache();
    },
  });
}
