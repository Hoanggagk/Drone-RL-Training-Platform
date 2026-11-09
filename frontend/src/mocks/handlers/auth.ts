import { delay, HttpResponse } from 'msw';
import { http } from '../http';
import { mockStore, ids } from '../store/identity-access-store';
import { mockProblem } from '../problem';
export const authHandlers = [
  http.post('/api/v1/auth/sessions', async ({ request }) => {
    await delay(80);
    const body = (await request.json()) as { login?: string; password?: string };
    if (mockStore.scenario === 'network-failure') return HttpResponse.error();
    if (mockStore.scenario === 'invalid-credentials' || body.password === 'wrong')
      return mockProblem(401, 'INVALID_CREDENTIALS', 'Thông tin đăng nhập không hợp lệ');
    const account = mockStore.accounts.find(
      (a) => a.id === (mockStore.scenario === 'auth-force-password' ? ids.user : ids.admin),
    )!;
    mockStore.session = { accountId: account.id };
    return HttpResponse.json(
      {
        account: {
          id: account.id,
          username: account.username,
          display_name: account.display_name,
          must_change_password: account.must_change_password,
          global_roles: account.id === ids.admin ? ['platform_admin'] : [],
        },
        expires_at: '2026-01-02T00:00:00Z',
      },
      { status: 201 },
    );
  }),
  http.get('/api/v1/auth/me', () => {
    if (!mockStore.session || mockStore.scenario === 'session-expired')
      return mockProblem(401, 'SESSION_INVALID', 'Phiên không hợp lệ');
    const a = mockStore.accounts.find((x) => x.id === mockStore.session!.accountId)!;
    return HttpResponse.json({
      id: a.id,
      username: a.username,
      display_name: a.display_name,
      must_change_password: a.must_change_password,
      global_roles: a.id === ids.admin ? ['platform_admin'] : [],
    });
  }),
  http.get('/api/v1/auth/csrf-token', () =>
    mockStore.session
      ? HttpResponse.json({ csrf_token: mockStore.csrf })
      : mockProblem(401, 'SESSION_INVALID', 'Phiên không hợp lệ'),
  ),
  http.put('/api/v1/auth/password', () => {
    if (!mockStore.session) return mockProblem(401, 'SESSION_INVALID', 'Phiên không hợp lệ');
    const a = mockStore.accounts.find((x) => x.id === mockStore.session!.accountId)!;
    a.must_change_password = false;
    mockStore.csrf = 'csrf-rotated-demo-token-000000000000000001';
    return HttpResponse.json({ csrf_token: mockStore.csrf, expires_at: '2026-01-02T00:00:00Z' });
  }),
  http.delete('/api/v1/auth/sessions/current', () => {
    mockStore.session = null;
    return new HttpResponse(null, { status: 204 });
  }),
];
