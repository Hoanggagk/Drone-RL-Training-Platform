import { describe, expect, it } from 'vitest';
import { api } from '../../../lib/api/client';
import { mockStore } from '../../../mocks/store/identity-access-store';
describe('auth API', () => {
  it('creates session, issues CSRF and revokes session', async () => {
    mockStore.reset('auth-standard');
    const login = await api.POST('/api/v1/auth/sessions', {
      body: { login: 'admin', password: 'demo-password' },
      params: { header: { Origin: 'http://localhost' } },
    });
    expect(login.response.status).toBe(201);
    const token = await api.GET('/api/v1/auth/csrf-token');
    expect(token.data?.csrf_token.length).toBeGreaterThanOrEqual(32);
    const logout = await api.DELETE('/api/v1/auth/sessions/current', {
      params: {
        header: { Origin: 'http://localhost', 'X-CSRF-Token': token.data?.csrf_token ?? '' },
      },
    });
    expect(logout.response.status).toBe(204);
  });
});
