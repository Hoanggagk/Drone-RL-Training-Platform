import { HttpResponse } from 'msw';
import { http } from '../http';
import { ids, mockStore } from '../store/identity-access-store';
import { mockProblem } from '../problem';
const roles = [
  {
    code: 'platform_admin',
    name: 'Platform Administrator',
    scope_type: 'global',
    description: 'Quản trị IAM',
    permissions: ['iam:admin'],
    catalog_version: '1',
  },
  {
    code: 'researcher',
    name: 'Researcher',
    scope_type: 'project',
    description: 'Nghiên cứu trong project',
    permissions: ['project:read'],
    catalog_version: '1',
  },
  {
    code: 'learner',
    name: 'Learner',
    scope_type: 'project',
    description: 'Học viên',
    permissions: ['project:read'],
    catalog_version: '1',
  },
];
export const roleHandlers = [
  http.get('/api/v1/iam/roles', () =>
    mockStore.session
      ? HttpResponse.json(roles)
      : mockProblem(401, 'SESSION_INVALID', 'Phiên không hợp lệ'),
  ),
  http.get('/api/v1/iam/global-role-bindings', () =>
    HttpResponse.json({ items: mockStore.bindings, next_cursor: null, has_more: false }),
  ),
  http.post('/api/v1/iam/global-role-bindings', async ({ request }) => {
    if (mockStore.scenario === 'recent-auth-required')
      return mockProblem(403, 'RECENT_AUTH_REQUIRED', 'Cần xác thực gần đây');
    const body = (await request.json()) as { account_id: string };
    const binding = {
      id: crypto.randomUUID(),
      account_id: body.account_id,
      role_code: 'platform_admin' as const,
      status: 'active' as const,
      created_by: ids.admin,
      created_at: new Date().toISOString(),
      revoked_by: null,
      revoked_at: null,
    };
    mockStore.bindings.push(binding);
    return HttpResponse.json(binding, { status: 201 });
  }),
  http.delete('/api/v1/iam/global-role-bindings/:id', ({ params }) => {
    if (
      mockStore.scenario === 'last-admin-conflict' ||
      mockStore.bindings.filter((b) => b.status === 'active').length <= 1
    )
      return mockProblem(409, 'LAST_ADMIN', 'Không thể thu hồi quản trị viên cuối cùng');
    const b = mockStore.bindings.find((x) => x.id === params.id);
    if (!b) return mockProblem(404, 'BINDING_NOT_FOUND', 'Không tìm thấy binding');
    b.status = 'revoked';
    b.revoked_by = ids.admin;
    b.revoked_at = new Date().toISOString();
    return new HttpResponse(null, { status: 204 });
  }),
];
