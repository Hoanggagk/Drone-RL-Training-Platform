import { HttpResponse } from 'msw';
import { http } from '../http';
import { ids, mockStore } from '../store/identity-access-store';
import { mockProblem } from '../problem';
export const membershipHandlers = [
  http.get('/api/v1/iam/project-memberships', ({ request }) => {
    const url = new URL(request.url);
    const project = url.searchParams.get('project_id');
    const account = url.searchParams.get('account_id');
    const status = url.searchParams.get('status');
    const items = mockStore.memberships.filter(
      (item) =>
        (!project || item.project_id === project) &&
        (!account || item.account_id === account) &&
        (!status || item.status === status),
    );
    return HttpResponse.json({ items, next_cursor: null, has_more: false });
  }),
  http.post('/api/v1/iam/project-memberships', async ({ request }) => {
    if (mockStore.scenario === 'service-unavailable')
      return mockProblem(503, 'SERVICE_UNAVAILABLE', 'Dịch vụ tạm gián đoạn');
    const body = (await request.json()) as {
      project_id: string;
      account_id: string;
      role_code: 'researcher' | 'lecturer' | 'learner' | 'algorithm_developer';
    };
    if (
      mockStore.scenario === 'duplicate-membership' ||
      mockStore.memberships.some(
        (m) =>
          m.project_id === body.project_id &&
          m.account_id === body.account_id &&
          m.role_code === body.role_code &&
          m.status === 'active',
      )
    )
      return mockProblem(409, 'MEMBERSHIP_EXISTS', 'Membership đã tồn tại');
    const item = {
      id: crypto.randomUUID(),
      ...body,
      status: 'active' as const,
      created_by: ids.admin,
      created_at: new Date().toISOString(),
      revoked_by: null,
      revoked_at: null,
      version: 1,
    };
    mockStore.memberships.push(item);
    return HttpResponse.json(item, { status: 201 });
  }),
  http.get('/api/v1/iam/project-memberships/:id', ({ params }) => {
    const m = mockStore.memberships.find((x) => x.id === params.id);
    return m
      ? HttpResponse.json(m)
      : mockProblem(404, 'MEMBERSHIP_NOT_FOUND', 'Không tìm thấy membership');
  }),
  http.delete('/api/v1/iam/project-memberships/:id', ({ params }) => {
    const m = mockStore.memberships.find((x) => x.id === params.id);
    if (!m) return mockProblem(404, 'MEMBERSHIP_NOT_FOUND', 'Không tìm thấy membership');
    m.status = 'revoked';
    m.revoked_by = ids.admin;
    m.revoked_at = new Date().toISOString();
    m.version++;
    return new HttpResponse(null, { status: 204 });
  }),
];
