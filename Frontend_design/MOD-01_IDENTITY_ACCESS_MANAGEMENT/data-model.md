# Frontend State Model — MOD-01 Demo

Đây là view/state model của frontend, không phải database schema. Request/response types MUST được sinh từ `API_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/contracts/openapi.yaml`; không định nghĩa lại bằng interface viết tay.

## 1. AuthViewState

| Field | Kiểu logic | Quy tắc |
|---|---|---|
| `status` | `unknown / anonymous / authenticated / forced_password_change` | `unknown` trong bootstrap; không render protected content trước khi resolve. |
| `identity` | generated `CurrentIdentity` hoặc null | Xóa khi logout/401/session revoke. |
| `csrfToken` | string hoặc null | Memory-only; rotate sau password change; không log/persist. |
| `safeReturnPath` | route nội bộ hoặc null | Chỉ allowlist route MOD-01; không nhận external URL. |
| `sessionMessage` | message key hoặc null | Không chứa secret/problem detail nhạy cảm. |

### Transitions

```text
unknown -> anonymous                  (bootstrap 401)
unknown -> authenticated              (identity active)
unknown -> forced_password_change     (must_change_password=true)
anonymous -> authenticated            (login)
anonymous -> forced_password_change   (login + must_change_password)
forced_password_change -> authenticated (password changed + session/CSRF rotated)
authenticated -> anonymous            (logout/401/revocation)
forced_password_change -> anonymous   (logout/401)
```

Invariant: `forced_password_change` chỉ cho phép route identity/CSRF, change-password và logout.

## 2. QueryPageState<T>

| Field | Kiểu logic | Quy tắc |
|---|---|---|
| `items` | `T[]` | Dữ liệu generated type; không mutate trực tiếp. |
| `cursor` | string hoặc null | Opaque; không parse phía client. |
| `nextCursor` | string hoặc null | Từ response. |
| `hasMore` | boolean | Điều khiển pagination. |
| `filters` | allowlisted filter object | Đồng bộ URL khi không nhạy cảm. |
| `phase` | `initial_loading / refreshing / success / initial_empty / filtered_empty / error` | Các trạng thái phải hiển thị khác nhau. |

Áp dụng cho Account, GlobalRoleBinding và ProjectMembership. Page size từ 1–100, mặc định 25 theo OpenAPI.

## 3. AccountEditorState

| Field | Kiểu logic | Quy tắc |
|---|---|---|
| `mode` | `create / update_status` | Không có hard delete. |
| `values` | input generated type | Password không được giữ sau submit failure nhạy cảm hoặc unmount. |
| `etag` | string hoặc null | Bắt buộc khi update; gửi `If-Match`. |
| `submitPhase` | `idle / submitting / success / error` | `submitting` khóa duplicate mutation. |
| `fieldErrors` | map field → message | Từ 422; unknown field vào error summary. |
| `globalProblem` | ProblemPresentation hoặc null | Không render raw stack/policy metadata. |

## 4. AccessBindingEditorState

| Field | Kiểu logic | Quy tắc |
|---|---|---|
| `kind` | `global / project` | Global chỉ `platform_admin`; project chỉ catalog project roles. |
| `accountId` | UUID | Required. |
| `projectId` | UUID hoặc null | Required chỉ với project binding; opaque reference. |
| `roleCode` | role code | Không cho custom role. |
| `idempotencyKey` | opaque string | Tạo cho mutation/retry, không hiển thị/log. |
| `submitPhase` | finite state | Ngăn duplicate submit. |

Revoke là state transition `active -> revoked`; UI không xóa row lịch sử. Global revoke cuối cùng phải hiển thị conflict và giữ dữ liệu canonical.

## 5. ProblemPresentation

| Field | Kiểu logic | Quy tắc |
|---|---|---|
| `category` | `reauth / forbidden / unavailable / conflict / stale / validation / throttled / network / unknown` | Map tập trung từ status + safe code. |
| `titleKey`, `messageKey` | translation/message key | Tiếng Việt; không đưa raw detail nhạy cảm. |
| `fieldErrors` | list | Chỉ field allowlisted. |
| `correlationId` | string hoặc null | Có thể hiển thị dưới nhãn hỗ trợ. |
| `retryAfterSeconds` | integer hoặc null | Chỉ dùng nếu hợp lệ; không âm. |
| `recoveryAction` | `login / reauthenticate / refetch / retry / review / none` | Không auto-retry mutation. |

### Status mapping

| Status | Category | Recovery |
|---|---|---|
| 401 | reauth | clear private state → login |
| 403 | forbidden hoặc reauth theo safe problem code | no retry / reauthenticate |
| 404 | unavailable | neutral back/refetch |
| 409 | conflict | refetch + review |
| 412 | stale | fetch canonical + reapply manually |
| 422 | validation | focus error summary/field |
| 429 | throttled | honor Retry-After, manual retry |
| 503 | unavailable | honor Retry-After, manual retry |

## 6. DemoScenario

| Field | Kiểu logic | Quy tắc |
|---|---|---|
| `id` | stable string | Không chứa production data. |
| `label` | Vietnamese string | Hiển thị cho người duyệt demo nếu scenario panel được bật ở dev/demo mode. |
| `seed` | fixture key | Reset deterministic. |
| `overrides` | operation → outcome | Chỉ operationId MOD-01. |
| `expectedRoute` | MOD-01 route | Không external redirect. |
| `expectedState` | assertion summary | Dùng quickstart/test. |

## 7. Sensitive-data invariants

1. Không có application state nào giữ session cookie hoặc password sau khi flow kết thúc.
2. CSRF token chỉ ở memory và bị thay thế khi rotate; không đưa vào query devtools logger.
3. Query cache riêng tư bị cancel và remove khi logout/401/password/session transition yêu cầu.
4. Generated API type là nguồn dữ liệu transport duy nhất; view model chỉ bổ sung presentation state.
5. Mock fixtures không chứa credential/PII thật và phải reset giữa test/scenario.

