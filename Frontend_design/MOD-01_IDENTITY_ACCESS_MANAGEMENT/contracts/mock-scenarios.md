# Mock Scenario Contract — MOD-01

MSW mock phục vụ demo và automated tests. Nó không chứng minh security attributes của cookie, server-side revocation, password hashing hoặc Backend authorization.

## 1. Scenario rules

- Mỗi scenario reset store deterministic trước khi chạy.
- Unhandled request là lỗi trong test; không passthrough ngoài allowlist asset.
- Handler không chứa assertion; test kiểm tra observable UI/request history tại boundary.
- OperationId và body shape lấy từ generated OpenAPI types.
- State store chỉ có account, role binding, membership và simulated session thuộc MOD-01.

## 2. Required happy-path scenarios

| ID | Flow | Initial state | Expected outcome |
|---|---|---|---|
| `auth-standard` | Login → identity → logout | active account | authenticated rồi anonymous |
| `auth-force-password` | Login → forced change → rotated session | must_change_password | authenticated, new CSRF context |
| `account-lifecycle` | list → create → detail → lock/unlock/disable | platform admin | canonical account state updated |
| `account-revoke-sessions` | revoke all sessions | active target sessions | target sessions invalid |
| `global-admin-binding` | list → grant → revoke | recent-auth admin, >1 active admin | active/revoked history |
| `project-membership` | list → create → detail → revoke | opaque valid project ID | active/revoked history |

## 3. Required failure scenarios

| ID | Trigger | Status/outcome | Required UI behavior |
|---|---|---|---|
| `invalid-credentials` | login invalid | 401 | generic message, no enumeration |
| `session-expired` | protected request | 401 | clear private state, login |
| `permission-denied` | admin operation | 403 | forbidden, identity retained |
| `recent-auth-required` | global binding mutation | 403 + safe code | reauthenticate, no auto replay |
| `concealed-not-found` | scoped resource unavailable | 404 | neutral unavailable message |
| `duplicate-binding` | duplicate active create | 409 | refresh/review |
| `last-admin-protected` | revoke final admin | 409 | keep binding, explain conflict |
| `stale-account` | old If-Match | 412 | refetch + manual reapply |
| `validation-fields` | invalid form | 422 | summary + inline field errors |
| `rate-limited` | repeated login/mutation | 429 + optional Retry-After | countdown/manual retry |
| `service-unavailable` | dependency unavailable | 503 + optional Retry-After | safe data retained/manual retry |
| `network-failure` | fetch rejects | network exception | distinct offline/network recovery |
| `contract-malformed` | response missing required field | client validation/gate failure | fail-safe error, no guessed data |

## 4. Stateful behavior

- Create account sets `must_change_password=true`.
- Successful password change rotates simulated session and CSRF token and invalidates other sessions.
- Account status lock/disable invalidates target sessions.
- PATCH account requires current ETag; stale value returns 412.
- Global role revoke rejects final active Platform Administrator.
- Re-grant creates new binding record; revoked history remains.
- Project membership never creates/updates project metadata.
- Duplicate mutation is blocked by UI; repeated idempotency key replays stored result where contract permits.

## 5. Coverage gate

All 18 public operationIds from the OpenAPI contract must be referenced by at least one happy-path or failure scenario. A generated coverage check fails when a new operation is added without a scenario mapping.

