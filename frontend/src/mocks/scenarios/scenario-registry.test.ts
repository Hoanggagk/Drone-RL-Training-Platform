import { describe, expect, it } from 'vitest';
import { activateScenario, scenarioCatalog } from '.';
import { mockStore } from '../store/identity-access-store';
describe('scenario registry', () => {
  it('has unique deterministic scenarios', () => {
    expect(new Set(scenarioCatalog.map((x) => x.id)).size).toBe(scenarioCatalog.length);
    activateScenario('auth-standard');
    const first = structuredClone(mockStore.accounts);
    activateScenario('auth-standard');
    expect(mockStore.accounts).toEqual(first);
  });
});
