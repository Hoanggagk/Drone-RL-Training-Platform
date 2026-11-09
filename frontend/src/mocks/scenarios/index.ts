import { mockStore, type Scenario } from '../store/identity-access-store';
export const scenarioCatalog: ReadonlyArray<{ id: Scenario; label: string }> = [
  { id: 'auth-standard', label: 'Đăng nhập chuẩn' },
  { id: 'auth-force-password', label: 'Buộc đổi mật khẩu' },
  { id: 'invalid-credentials', label: 'Sai thông tin đăng nhập' },
  { id: 'session-expired', label: 'Phiên hết hạn' },
  { id: 'permission-denied', label: 'Không đủ quyền' },
  { id: 'validation-error', label: 'Lỗi dữ liệu' },
  { id: 'stale-account', label: 'ETag cũ' },
  { id: 'recent-auth-required', label: 'Cần xác thực gần đây' },
  { id: 'last-admin-conflict', label: 'Quản trị viên cuối cùng' },
  { id: 'duplicate-membership', label: 'Membership trùng' },
  { id: 'service-unavailable', label: 'Dịch vụ gián đoạn' },
  { id: 'network-failure', label: 'Lỗi mạng' },
  { id: 'empty-accounts', label: 'Danh sách rỗng' },
  { id: 'contract-malformed', label: 'Response sai contract' },
];
export const scenarioOperationIds = [
  'createAuthSession',
  'getCurrentIdentity',
  'issueCsrfToken',
  'changeCurrentPassword',
  'revokeCurrentSession',
  'listAccounts',
  'createAccount',
  'getAccount',
  'updateAccount',
  'revokeAccountSessions',
  'listRoleDefinitions',
  'listGlobalRoleBindings',
  'createGlobalRoleBinding',
  'revokeGlobalRoleBinding',
  'listProjectMemberships',
  'createProjectMembership',
  'getProjectMembership',
  'revokeProjectMembership',
] as const;
export function activateScenario(id: Scenario) {
  const previousSession = mockStore.session;
  mockStore.reset(id);
  if (
    previousSession &&
    !['auth-standard', 'auth-force-password', 'invalid-credentials', 'session-expired'].includes(id)
  )
    mockStore.session = previousSession;
  window.dispatchEvent(new Event('mod01-scenario-change'));
}
