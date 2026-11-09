import { describe, expect, it } from 'vitest';
import { safeReturnPath, stateForIdentity } from './auth-state';
const identity = {
  id: 'x',
  username: 'u',
  display_name: 'U',
  must_change_password: false,
  global_roles: [] as never[],
};
describe('auth state', () => {
  it('enforces forced password state', () =>
    expect(stateForIdentity({ ...identity, must_change_password: true }).kind).toBe(
      'forced_password_change',
    ));
  it('allows only internal IAM return paths', () => {
    expect(safeReturnPath('/iam/roles')).toBe('/iam/roles');
    expect(safeReturnPath('//evil.test')).toBe('/iam/accounts');
    expect(safeReturnPath('/projects')).toBe('/iam/accounts');
  });
});
