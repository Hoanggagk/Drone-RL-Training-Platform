import { describe, expect, it } from 'vitest';
const allowedRoutes = [
  '/login',
  '/iam/change-password',
  '/iam/accounts',
  '/iam/roles',
  '/iam/memberships',
];
describe('MOD-01 boundary', () => {
  it('contains identity/access routes only', () =>
    expect(
      allowedRoutes.some((route) =>
        /project|experiment|run|simulator|training|evaluation/.test(route),
      ),
    ).toBe(false));
});
