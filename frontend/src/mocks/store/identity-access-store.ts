import type { components } from '../../generated/api-schema';
type Account = components['schemas']['Account'];
type Membership = components['schemas']['ProjectMembership'];
type Binding = components['schemas']['GlobalRoleBinding'];
const now = '2026-01-01T00:00:00Z';
export const ids = {
  admin: '00000000-0000-4000-8000-000000000001',
  user: '00000000-0000-4000-8000-000000000002',
  project: '10000000-0000-4000-8000-000000000001',
};
const seedAccounts: Account[] = [
  {
    id: ids.admin,
    username: 'admin',
    email: 'admin@example.test',
    display_name: 'Quản trị viên',
    status: 'active',
    must_change_password: false,
    last_login_at: now,
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: ids.user,
    username: 'learner',
    email: 'learner@example.test',
    display_name: 'Người học mẫu',
    status: 'active',
    must_change_password: true,
    last_login_at: null,
    version: 1,
    created_at: now,
    updated_at: now,
  },
];
export type Scenario =
  | 'auth-standard'
  | 'auth-force-password'
  | 'invalid-credentials'
  | 'session-expired'
  | 'permission-denied'
  | 'validation-error'
  | 'stale-account'
  | 'recent-auth-required'
  | 'last-admin-conflict'
  | 'duplicate-membership'
  | 'service-unavailable'
  | 'network-failure'
  | 'empty-accounts'
  | 'contract-malformed';
export const mockStore = {
  accounts: [] as Account[],
  memberships: [] as Membership[],
  bindings: [] as Binding[],
  session: null as null | { accountId: string },
  csrf: 'csrf-demo-token-0000000000000000000000000001',
  scenario: 'auth-standard' as Scenario,
  reset(scenario: Scenario = 'auth-standard') {
    this.accounts = structuredClone(seedAccounts);
    this.memberships = [];
    this.bindings = [
      {
        id: '20000000-0000-4000-8000-000000000001',
        account_id: ids.admin,
        role_code: 'platform_admin',
        status: 'active',
        created_by: ids.admin,
        created_at: now,
        revoked_by: null,
        revoked_at: null,
      },
    ];
    this.session = null;
    this.scenario = scenario;
    if (scenario === 'empty-accounts') this.accounts = [];
  },
};
mockStore.reset();
