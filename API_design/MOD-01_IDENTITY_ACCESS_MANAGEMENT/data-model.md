# Data Model logic — MOD-01

Tài liệu này mô tả entity logic phục vụ API; không phải database migration. Chỉ entity do MOD-01 sở hữu được định nghĩa. `project_id` là opaque reference tới MOD-02.

## 1. UserAccount

| Field | Kiểu logic | Bắt buộc | Quy tắc |
|---|---|---:|---|
| `id` | UUID | Có | Immutable, server-generated. |
| `username` | string | Có | Chuẩn hóa/case policy cố định; unique; 3–64 ký tự. |
| `email` | string | Có | Email normalized; unique theo policy. |
| `display_name` | string | Có | 1–120 ký tự; không dùng cho authorization. |
| `password_hash` | secret string | Có | Argon2id encoded hash; không bao giờ ra API/event/log. |
| `must_change_password` | boolean | Có | `true` với account vừa provision; chỉ về `false` sau khi đổi password thành công. |
| `status` | enum | Có | `active`, `locked`, `disabled`. |
| `failed_login_count` | integer | Có | Không âm; dữ liệu security nội bộ. |
| `locked_until` | timestamp? | Không | Dùng nếu policy khóa tạm thời. |
| `password_changed_at` | timestamp | Có | UTC. |
| `last_login_at` | timestamp? | Không | UTC; không dùng làm bằng chứng audit duy nhất. |
| `version` | integer | Có | Tăng khi mutation, dùng ETag/If-Match. |
| `created_at`, `updated_at` | timestamp | Có | UTC, server-managed. |

### State transitions

```text
active  -> locked   (policy/admin)
locked  -> active   (admin/policy expiry)
active  -> disabled (admin)
locked  -> disabled (admin)
disabled -> active  (admin, nếu policy cho phép)
```

Không hard delete trong MVP. Mọi transition phát audit event. Khi chuyển sang `locked` hoặc `disabled`, toàn bộ session active của account bị thu hồi trong cùng unit of work hoặc qua outbox đáng tin cậy.

## 2. RoleDefinition

| Field | Kiểu logic | Bắt buộc | Quy tắc |
|---|---|---:|---|
| `code` | string enum | Có | Immutable, unique, nằm trong role catalog versioned. |
| `name` | string | Có | Nhãn hiển thị. |
| `scope_type` | enum | Có | `global` hoặc `project`. |
| `description` | string | Có | Không chứa policy secret. |
| `permissions` | set<string> | Có | Chỉ permission thuộc MOD-01 được công bố ở contract này; permission module khác do module đó đăng ký. |
| `catalog_version` | string | Có | Version phục vụ migration/regression test. |

Catalog baseline đề xuất:

- `platform_admin` (`global`): quản lý account, role catalog view, membership và session revocation; không tự động có scientific object access.
- `researcher`, `lecturer`, `learner`, `algorithm_developer` (`project`): binding theo project; action cụ thể do policy catalog kết hợp với module sở hữu object.

Không có API tạo/sửa/xóa role trong MVP.

## 3. GlobalRoleBinding

| Field | Kiểu logic | Bắt buộc | Quy tắc |
|---|---|---:|---|
| `id` | UUID | Có | Server-generated. |
| `account_id` | UUID | Có | Tham chiếu UserAccount. |
| `role_code` | string | Có | Chỉ role có `scope_type=global`. |
| `status` | enum | Có | `active`, `revoked`. |
| `created_by` | UUID | Có | Actor account. |
| `created_at` | timestamp | Có | UTC. |
| `revoked_by`, `revoked_at` | UUID?, timestamp? | Không | Có khi revoked. |
| `version` | integer | Có | Phục vụ concurrency/audit trace. |

Unique active `(account_id, role_code)`. Bootstrap admin đầu tiên là quy trình deployment có kiểm soát. Các binding tiếp theo được quản lý qua API, yêu cầu recent authentication và không được thu hồi Platform Administrator active cuối cùng.

## 4. ProjectMembership

| Field | Kiểu logic | Bắt buộc | Quy tắc |
|---|---|---:|---|
| `id` | UUID | Có | Server-generated. |
| `project_id` | UUID | Có | Opaque scope reference do MOD-02 sở hữu. |
| `account_id` | UUID | Có | Account phải không `disabled`. |
| `role_code` | string | Có | Role có `scope_type=project`. |
| `status` | enum | Có | `active`, `revoked`. |
| `created_by` | UUID | Có | Actor thực hiện. |
| `created_at` | timestamp | Có | UTC. |
| `revoked_by`, `revoked_at` | UUID?, timestamp? | Không | Cùng null hoặc cùng có giá trị. |
| `version` | integer | Có | Concurrency/audit trace. |

Unique active binding `(project_id, account_id, role_code)`. MOD-01 không lưu tên, mô tả hay nội dung project.

### State transitions

```text
active -> revoked
```

Re-grant luôn tạo record mới; record `revoked` là lịch sử bất biến. Duplicate active binding trả conflict hoặc replay kết quả theo `Idempotency-Key`.

## 5. AuthSession

| Field | Kiểu logic | Bắt buộc | Quy tắc |
|---|---|---:|---|
| `id` | UUID/random lookup ID | Có | Không đủ để authenticate nếu thiếu verifier. |
| `account_id` | UUID | Có | Account owner. |
| `verifier_hash` | bytes/string | Có | SHA-256 của random verifier; raw verifier chỉ ở cookie. |
| `csrf_secret_hash` | bytes/string | Có | Không log/raw persistence. |
| `status` | enum | Có | `active`, `revoked`, `expired`. |
| `created_at`, `authenticated_at`, `last_seen_at` | timestamp | Có | UTC; `authenticated_at` dùng cho recent-auth policy. |
| `idle_expires_at`, `absolute_expires_at` | timestamp | Có | Server-authoritative. |
| `revoked_at`, `revoke_reason` | timestamp?, enum? | Không | Có khi revoked. |
| `user_agent_hash` | string? | Không | Chỉ telemetry/risk signal, không làm sole authenticator. |

### State transitions

```text
active -> revoked  (logout/admin/account state change)
active -> expired  (idle hoặc absolute timeout)
```

Không transition ngược. Rotation tạo session/secret mới.

## 6. AuthorizationDecision (value object, không persistence bắt buộc)

| Field | Kiểu logic | Quy tắc |
|---|---|---|
| `decision` | `allow`/`deny` | Deny khi thiếu context/policy. |
| `reason_code` | enum ổn định | Không tiết lộ object metadata. |
| `policy_version` | string | Truy vết decision. |
| `correlation_id` | string | Liên kết request/event. |

## 7. AccessAuditEvent (event boundary)

| Field | Kiểu logic | Quy tắc |
|---|---|---|
| `event_id` | UUID | Unique để deduplicate. |
| `occurred_at` | timestamp | UTC. |
| `actor_id` | UUID/system | Không chứa credential. |
| `action` | string | Allowlisted. |
| `target_type`, `target_id` | string | Chỉ identifier cần thiết. |
| `project_id` | UUID? | Scope nếu có. |
| `outcome` | enum | `success`, `deny`, `failure`. |
| `reason_code` | string? | Không chứa stack trace/secret. |
| `correlation_id` | string | Bắt buộc. |
| `metadata` | object | Allowlist; cấm password, cookie, token, hash bí mật. |

MOD-17 sở hữu persistence, query, retention và access control của audit log.

## 8. Quan hệ

```text
UserAccount 1 --- * AuthSession
UserAccount 1 --- * GlobalRoleBinding * --- 1 RoleDefinition(global)
UserAccount 1 --- * ProjectMembership * --- 1 RoleDefinition(project)
ProjectMembership * --- 1 ProjectScopeRef(project_id only)
```

## 9. Invariants

1. Account `disabled` không có session active.
2. Session active chỉ hợp lệ khi account active và cả idle/absolute expiry chưa qua.
3. Project membership không cấp global permission.
4. `platform_admin` không suy diễn project scientific permission.
5. Authorization thiếu actor/action/project context bắt buộc deny.
6. Secret/hash không xuất hiện trong API representation hoặc audit event.
7. Mutation version không khớp `If-Match` bị từ chối, không last-write-wins.
8. Khi `must_change_password=true`, authorization chỉ allow identity/CSRF, đổi password và logout.
9. Hệ thống luôn còn ít nhất một account active giữ `platform_admin` binding active.

