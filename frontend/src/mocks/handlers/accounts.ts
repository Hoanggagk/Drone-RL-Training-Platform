import { HttpResponse } from 'msw';
import { http } from '../http';
import { mockStore } from '../store/identity-access-store';
import { mockProblem } from '../problem';
const guard = () =>
  !mockStore.session
    ? mockProblem(401, 'SESSION_INVALID', 'Phiên không hợp lệ')
    : mockStore.scenario === 'permission-denied'
      ? mockProblem(403, 'FORBIDDEN', 'Không đủ quyền')
      : null;
export const accountHandlers = [
  http.get('/api/v1/admin/accounts', ({ request }) => {
    const denied = guard();
    if (denied) return denied;
    if (mockStore.scenario === 'contract-malformed')
      return HttpResponse.json({ items: [{ id: 42 }], has_more: 'unknown' });
    const url = new URL(request.url);
    const query = (url.searchParams.get('query') ?? '').toLowerCase();
    const status = url.searchParams.get('status');
    const items = mockStore.accounts.filter(
      (a) =>
        (!query ||
          [a.username, a.email, a.display_name].some((v) => v.toLowerCase().includes(query))) &&
        (!status || a.status === status),
    );
    return HttpResponse.json({ items, next_cursor: null, has_more: false });
  }),
  http.post('/api/v1/admin/accounts', async ({ request }) => {
    const denied = guard();
    if (denied) return denied;
    if (mockStore.scenario === 'service-unavailable')
      return mockProblem(503, 'SERVICE_UNAVAILABLE', 'Dịch vụ tạm gián đoạn', {
        'Retry-After': '2',
      });
    const body = (await request.json()) as Record<string, string>;
    if (mockStore.scenario === 'validation-error')
      return HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Dữ liệu không hợp lệ',
          status: 422,
          code: 'VALIDATION_ERROR',
          correlation_id: 'demo-correlation-id',
          errors: [{ field: 'username', code: 'INVALID', message: 'Username không hợp lệ' }],
        },
        { status: 422 },
      );
    const exists = mockStore.accounts.some((a) => a.username === body.username);
    if (exists) return mockProblem(409, 'ACCOUNT_EXISTS', 'Account đã tồn tại');
    const now = new Date().toISOString();
    const a = {
      id: crypto.randomUUID(),
      username: body.username!,
      email: body.email!,
      display_name: body.display_name!,
      status: 'active' as const,
      must_change_password: true,
      last_login_at: null,
      version: 1,
      created_at: now,
      updated_at: now,
    };
    mockStore.accounts.push(a);
    return HttpResponse.json(a, { status: 201, headers: { ETag: '"1"' } });
  }),
  http.get('/api/v1/admin/accounts/:id', ({ params }) => {
    const denied = guard();
    if (denied) return denied;
    const a = mockStore.accounts.find((x) => x.id === params.id);
    return a
      ? HttpResponse.json(a, { headers: { ETag: `"${a.version}"` } })
      : mockProblem(404, 'ACCOUNT_NOT_FOUND', 'Không tìm thấy account');
  }),
  http.patch('/api/v1/admin/accounts/:id', async ({ params, request }) => {
    const denied = guard();
    if (denied) return denied;
    const a = mockStore.accounts.find((x) => x.id === params.id);
    if (!a) return mockProblem(404, 'ACCOUNT_NOT_FOUND', 'Không tìm thấy account');
    if (
      mockStore.scenario === 'stale-account' ||
      request.headers.get('If-Match') !== `"${a.version}"`
    )
      return mockProblem(412, 'STALE_VERSION', 'Dữ liệu đã thay đổi');
    const body = (await request.json()) as {
      display_name?: string;
      status?: 'active' | 'locked' | 'disabled';
    };
    Object.assign(a, body, { version: a.version + 1, updated_at: new Date().toISOString() });
    return HttpResponse.json(a, { headers: { ETag: `"${a.version}"` } });
  }),
  http.delete(
    '/api/v1/admin/accounts/:id/sessions',
    ({ params }) =>
      guard() ??
      (mockStore.accounts.some((x) => x.id === params.id)
        ? new HttpResponse(null, { status: 204 })
        : mockProblem(404, 'ACCOUNT_NOT_FOUND', 'Không tìm thấy account')),
  ),
];
