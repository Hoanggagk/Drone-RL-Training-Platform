import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { csrf } from '../lib/api/csrf';
import { mockStore } from '../mocks/store/identity-access-store';
function sourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    return statSync(path).isDirectory()
      ? sourceFiles(path)
      : /\.(ts|tsx)$/.test(name)
        ? [path]
        : [];
  });
}
describe('sensitive data policy', () => {
  it('does not persist or log memory-only CSRF', () => {
    localStorage.clear();
    sessionStorage.clear();
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    csrf.set('test-only-sensitive-value');
    expect(JSON.stringify({ ...localStorage, ...sessionStorage })).not.toContain(
      'test-only-sensitive-value',
    );
    expect(log).not.toHaveBeenCalled();
    csrf.clear();
  });
  it('keeps secrets out of visible business fixtures', () => {
    expect(
      JSON.stringify({
        accounts: mockStore.accounts,
        memberships: mockStore.memberships,
        bindings: mockStore.bindings,
      }),
    ).not.toMatch(/"(?:password|cookie|csrf_token|secret)"\s*:/i);
  });
  it('contains no source logging or persistent writes for secret material', () => {
    const source = sourceFiles('src')
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n');
    expect(source).not.toMatch(/console\.(log|info|debug)\s*\([^)]*(password|csrf|cookie)/i);
    expect(source).not.toMatch(
      /(?:localStorage|sessionStorage)\.setItem\s*\([^)]*(password|csrf|cookie)/i,
    );
  });
});
