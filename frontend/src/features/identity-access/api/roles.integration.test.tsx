import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '../../../lib/api/client';
import { csrf } from '../../../lib/api/csrf';
import { ids, mockStore } from '../../../mocks/store/identity-access-store';

const headers = {
  'X-CSRF-Token': 'csrf-demo-token-0000000000000000000000000001',
  Origin: 'http://localhost',
  'Idempotency-Key': '30000000-0000-4000-8000-000000000001',
};
beforeEach(() => {
  mockStore.reset();
  mockStore.session = { accountId: ids.admin };
  csrf.set(headers['X-CSRF-Token']);
});

describe('role/global binding contract', () => {
  it('lists role definitions and bindings', async () => {
    const roles = await api.GET('/api/v1/iam/roles');
    const bindings = await api.GET('/api/v1/iam/global-role-bindings');
    expect(roles.response.status).toBe(200);
    expect(roles.data?.some((r) => r.code === 'platform_admin')).toBe(true);
    expect(bindings.data?.items).toHaveLength(1);
  });
  it('creates a global administrator binding', async () => {
    const result = await api.POST('/api/v1/iam/global-role-bindings', {
      params: { header: headers },
      body: { account_id: ids.user, role_code: 'platform_admin' },
    });
    expect(result.response.status).toBe(201);
    expect(result.data?.account_id).toBe(ids.user);
  });
  it('presents recent-auth and last-admin conflicts', async () => {
    mockStore.scenario = 'recent-auth-required';
    const recent = await api.POST('/api/v1/iam/global-role-bindings', {
      params: { header: headers },
      body: { account_id: ids.user, role_code: 'platform_admin' },
    });
    expect(recent.response.status).toBe(403);
    mockStore.scenario = 'last-admin-conflict';
    const last = await api.DELETE('/api/v1/iam/global-role-bindings/{binding_id}', {
      params: { path: { binding_id: mockStore.bindings[0]!.id }, header: headers },
    });
    expect(last.response.status).toBe(409);
  });
});
