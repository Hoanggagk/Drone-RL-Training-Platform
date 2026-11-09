import { authHandlers } from './auth';
import { accountHandlers } from './accounts';
import { roleHandlers } from './roles';
import { membershipHandlers } from './memberships';
export const handlers = [
  ...authHandlers,
  ...accountHandlers,
  ...roleHandlers,
  ...membershipHandlers,
];
