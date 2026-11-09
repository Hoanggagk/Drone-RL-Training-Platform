import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '../../../lib/api/client';
import { ids, mockStore } from '../../../mocks/store/identity-access-store';
const headers = {
  'X-CSRF-Token': 'csrf-demo-token-0000000000000000000000000001',
  Origin: 'http://localhost',
  'Idempotency-Key': '30000000-0000-4000-8000-000000000001',
};
beforeEach(() => {
  mockStore.reset();
  mockStore.session = { accountId: ids.admin };
});
describe('project membership contract', () => {
  it('creates, lists, gets and revokes by opaque identifiers', async () => {
    const created = await api.POST('/api/v1/iam/project-memberships', {
      params: { header: headers },
      body: { project_id: ids.project, account_id: ids.user, role_code: 'learner' },
    });
    expect(created.response.status).toBe(201);
    const id = created.data!.id;
    const listed = await api.GET('/api/v1/iam/project-memberships', {
      params: { query: { project_id: ids.project, page_size: 25 } },
    });
    expect(listed.data?.items[0]?.project_id).toBe(ids.project);
    const detail = await api.GET('/api/v1/iam/project-memberships/{membership_id}', {
      params: { path: { membership_id: id } },
    });
    expect(detail.data?.id).toBe(id);
    const revoked = await api.DELETE('/api/v1/iam/project-memberships/{membership_id}', {
      params: { path: { membership_id: id }, header: headers },
    });
    expect(revoked.response.status).toBe(204);
    expect(mockStore.memberships[0]?.status).toBe('revoked');
  });
  it('returns 409 for duplicate membership', async () => {
    const body = { project_id: ids.project, account_id: ids.user, role_code: 'learner' as const };
    await api.POST('/api/v1/iam/project-memberships', { params: { header: headers }, body });
    mockStore.scenario = 'duplicate-membership';
    const duplicate = await api.POST('/api/v1/iam/project-memberships', {
      params: { header: headers },
      body,
    });
    expect(duplicate.response.status).toBe(409);
  });
});
