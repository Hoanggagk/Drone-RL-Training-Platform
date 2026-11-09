import type { components } from '../../../generated/api-schema';
export type Identity = components['schemas']['CurrentIdentity'];
export type AuthViewState =
  | { kind: 'unknown' }
  | { kind: 'anonymous' }
  | { kind: 'authenticated'; identity: Identity }
  | { kind: 'forced_password_change'; identity: Identity };
export const stateForIdentity = (identity: Identity): AuthViewState =>
  identity.must_change_password
    ? { kind: 'forced_password_change', identity }
    : { kind: 'authenticated', identity };
export function safeReturnPath(value: string | null) {
  return value?.startsWith('/iam/') && !value.startsWith('//') ? value : '/iam/accounts';
}
