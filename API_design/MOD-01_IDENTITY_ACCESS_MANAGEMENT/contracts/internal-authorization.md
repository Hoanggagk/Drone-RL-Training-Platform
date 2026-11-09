# Internal Contract — MOD-01 Authorization & Audit Boundary

Contract này chạy trong Backend Modular Monolith. Đây không phải REST endpoint và không được expose ra Frontend.

## 1. Authorization port

```text
authorize(request: AuthorizationRequest) -> AuthorizationDecision
```

### AuthorizationRequest

| Field | Kiểu | Bắt buộc | Owner |
|---|---|---:|---|
| `actor.account_id` | UUID | Có | MOD-01 identity context |
| `actor.session_id` | UUID | Có với browser request | MOD-01 session |
| `action` | string | Có | Module sở hữu action đăng ký; MOD-01 thực thi policy |
| `resource.type` | string | Có | Module sở hữu object |
| `resource.id` | UUID/string | Tùy action | Module sở hữu object |
| `resource.project_id` | UUID | Có với project-scoped action | MOD-02/module sở hữu object cung cấp |
| `correlation_id` | string | Có | Request boundary |

Không nhận role/permission từ Frontend làm nguồn tin. Identity context được dựng từ session đã xác minh; project context phải đến từ server-side lookup của module sở hữu object, không tin `project_id` do client tự khai nếu object đã có parent.

### AuthorizationDecision

```json
{
  "decision": "deny",
  "reason_code": "NO_ACTIVE_BINDING",
  "policy_version": "iam-policy-v1",
  "correlation_id": "01J..."
}
```

Reason code allowlist:

- `ALLOW_POLICY_MATCH`
- `UNAUTHENTICATED`
- `ACCOUNT_NOT_ACTIVE`
- `SESSION_NOT_ACTIVE`
- `MISSING_CONTEXT`
- `UNKNOWN_ACTION`
- `NO_ACTIVE_BINDING`
- `POLICY_DENY`

Reason code dành cho log/telemetry nội bộ. Public problem detail phải map sang thông báo chung, không chuyển nguyên dữ liệu policy/object ra client.

## 2. Quy tắc đánh giá

1. Validate request shape; thiếu context → deny.
2. Xác minh account/session active.
3. Nếu `must_change_password=true`, chỉ allow identity/CSRF, đổi password và logout.
4. Resolve global role bindings và project membership từ repository MOD-01.
5. Đánh giá policy version hiện hành cho `action + resource.type + scope`.
6. Trả decision; không mutation object nghiệp vụ.
7. Phát event theo policy (mọi deny quan trọng, mọi thay đổi quyền; allow có thể sampling trừ action nhạy cảm).

Authorization không gọi REST của chính hệ thống và không gọi simulator/worker/artifact store.

## 3. Action ownership

- MOD-01 sở hữu action: `iam.account.create`, `iam.account.read`, `iam.account.update_status`, `iam.session.revoke`, `iam.role.read`, `iam.global_role.read`, `iam.global_role.assign`, `iam.global_role.revoke`, `iam.membership.read`, `iam.membership.assign`, `iam.membership.revoke`.
- Module khác sở hữu tên và semantics action của chính nó, đăng ký qua compile-time/versioned catalog.
- Tài liệu này không định nghĩa permission matrix cho project/experiment/run/model.

## 4. Project scope resolver port

```text
project_scope_exists(project_id: UUID) -> bool
```

Port được implement bằng adapter tới boundary nội bộ của MOD-02 khi gán membership. MOD-01 không đọc/sửa nội dung project và không expose project endpoint. Dependency failure không được báo binding thành công giả.

## 5. Audit event publisher port

```text
publish(event: AccessAuditEvent) -> PublicationResult
```

- Event schema theo `data-model.md`.
- MOD-17 sở hữu storage/retention/query.
- Với thay đổi quyền/tài khoản, delivery phải đáng tin cậy qua transaction/outbox boundary; nếu không thể bảo đảm ghi nhận theo policy, mutation rollback hoặc trả dependency failure.
- Event cấm password, cookie, session verifier, CSRF token, password hash, stack trace và simulator secret.

## 6. Error mapping tại HTTP boundary

| Internal outcome | HTTP mapping đề xuất |
|---|---|
| `UNAUTHENTICATED`, inactive/expired session | `401` + generic problem detail |
| Admin function denied | `403` |
| Object-scoped deny có nguy cơ enumeration | `404` do module sở hữu object quyết định |
| Missing/invalid context do client input | `422` |
| Policy repository/dependency unavailable | `503`; không fail-open |

## 7. Contract tests bắt buộc

- Missing actor/action/scope luôn deny.
- Disabled account và revoked session luôn deny.
- Binding project A không cho phép project B.
- Global Platform Admin chỉ có action IAM đã định nghĩa, không tự động allow scientific action.
- Cùng input + policy version cho kết quả deterministic.
- Dependency unavailable không fail-open.
- Public error không chứa reason/policy/object metadata nhạy cảm.

