# Implementation Plan: API cho MOD-01 Identity & Access Management

**Branch**: `api-mod-01-identity-access-management` | **Date**: 2026-11-09 | **Spec**: [spec.md](spec.md)

**Input**: `API_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/spec.md`, kế thừa `FR-001`–`FR-004`, `NFR-010`–`NFR-012`, `AC-016` và đặc tả `MOD-01`.

## Summary

Thiết kế REST API cho authentication/session, account administration, role catalog, global Platform Administrator binding và project-scoped membership; đồng thời thiết kế contract nội bộ cho authorization và phát audit event. Phương án MVP dùng opaque server-side session qua cookie bảo mật, PostgreSQL làm nguồn trạng thái chuẩn, authorization chạy nội bộ trong FastAPI modular monolith và deny-by-default.

Phạm vi được khóa ở MOD-01. `project_id` chỉ là scope reference do MOD-02 sở hữu; tài liệu này không tạo endpoint hoặc schema nghiệp vụ cho project, experiment, run, model, audit store hay artifact.

## Technical Context

**Language/Version**: Python 3.12 là baseline đề xuất; phiên bản patch được khóa trong lockfile khi bắt đầu implementation.

**Primary Dependencies**: FastAPI, Pydantic 2, SQLAlchemy 2, Alembic, Psycopg 3; thư viện Argon2id được chọn và benchmark ở máy đích. Không thêm Redis, Celery, JWT hoặc external IdP trong lát cắt này.

**Storage**: PostgreSQL cho account, role catalog, membership và server-side session verifier. Audit event được phát sang boundary của MOD-17; MOD-01 không sở hữu audit store dài hạn.

**Testing**: pytest; HTTP/ASGI contract tests; policy matrix/unit tests; PostgreSQL integration tests; OpenAPI validation; security tests cho cross-project access, ID enumeration, CSRF, session expiry/revocation và concurrent update.

**Target Platform**: Backend FastAPI triển khai local/LAN trên máy chủ Linux/container phù hợp kiến trúc; browser client React/TypeScript gọi cùng origin hoặc origin allowlist cố định.

**Project Type**: Web service trong Backend Modular Monolith.

**Performance Goals**: Authorization nội bộ không tạo network hop và có mục tiêu kiểm chứng p95 ≤ 10 ms với policy/cache cục bộ; API đọc thông thường p95 ≤ 200 ms; login p95 ≤ 500 ms trên phần cứng đích. Đây là budget để benchmark, chưa phải NFR đã phê duyệt.

**Constraints**: Deny-by-default; không lộ object ngoài quyền; cookie/session secret không xuất hiện trong body/log/audit; HTTPS bắt buộc ngoài môi trường dev cô lập; API browser-first dùng cookie nên mutation dùng CSRF + Origin protection; account/membership mutation chống lost update; PostgreSQL là nguồn trạng thái chuẩn.

**Scale/Scope**: Nhóm người dùng nhỏ local/LAN; một Backend deployment; role catalog cố định; không multi-tenant, SSO/OIDC, MFA, custom policy editor hoặc group/class management.

## Constitution Check

*GATE trước Phase 0 và được kiểm tra lại sau Phase 1.*

File `.specify/memory/constitution.md` hiện vẫn là template chưa điền và chưa ratify, nên không tạo ra nguyên tắc chuẩn tắc có thể kiểm tra. Kế hoạch áp dụng các gate có hiệu lực từ `AGENTS.md` và tài liệu nguồn của dự án:

| Gate | Kết quả trước nghiên cứu | Bằng chứng |
|---|---|---|
| Chỉ thiết kế MOD-01, không lấn sang module khác | PASS | Scope/out-of-scope trong spec và contract chỉ tham chiếu opaque `project_id`. |
| Backend giữ modular monolith, không thêm service/network hop | PASS | Authorization là Python application contract nội bộ. |
| PostgreSQL là nguồn trạng thái chuẩn; không tự thêm Redis/Celery | PASS | Session verifier và IAM metadata dùng PostgreSQL. |
| Validate boundary, deny-by-default, không lộ secret | PASS | Error model, CSRF, redaction và policy rules là tiêu chí bắt buộc. |
| Thay đổi có kế hoạch test phù hợp | PASS | Unit, contract, integration và security scenarios được nêu trong quickstart. |
| Nội dung chưa phê duyệt được ghi là đề xuất/TBD | PASS | Deployment, Admin-in-MVP và benchmark không được tuyên bố là baseline đã duyệt. |

**Governance gap**: Constitution cần được điền/ratify ở một công việc riêng; kế hoạch này không tự sửa constitution hoặc mở rộng phạm vi MOD-01.

## Project Structure

### Documentation (this feature)

```text
API_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── openapi.yaml
    └── internal-authorization.md
```

### Source Code (đề xuất khi implementation)

```text
backend/
├── src/
│   ├── modules/
│   │   └── identity_access/
│   │       ├── api/
│   │       ├── application/
│   │       ├── domain/
│   │       └── infrastructure/
│   └── shared/
│       └── api/
└── tests/
    ├── contract/identity_access/
    ├── integration/identity_access/
    └── unit/identity_access/
```

**Structure Decision**: Chưa có source code/toolchain trong repository. Cấu trúc trên là đích implementation tối thiểu cho package MOD-01 trong modular monolith, không tạo package cho module khác. Shared API chỉ chứa primitive xuyên biên như correlation ID/problem details; domain rule vẫn nằm trong MOD-01.

## Phase 0 — Research

Hoàn thành tại [research.md](research.md). Các lựa chọn đã được giải quyết cho kế hoạch: opaque server-side cookie session, Argon2id, CSRF token + same-origin checks, fixed role catalog/project binding, RFC 9457 problem details, optimistic concurrency và OpenAPI 3.1.0 tương thích FastAPI.

## Phase 1 — Design & Contracts

- Mô hình logic và state transition: [data-model.md](data-model.md).
- REST contract công khai: [contracts/openapi.yaml](contracts/openapi.yaml).
- Contract nội bộ authorization/audit boundary: [contracts/internal-authorization.md](contracts/internal-authorization.md).
- Kịch bản xác minh: [quickstart.md](quickstart.md).

## Constitution Check — Post-design

| Gate | Kết quả sau thiết kế | Bằng chứng |
|---|---|---|
| Không thiết kế endpoint module khác | PASS | OpenAPI chỉ có tag `Authentication`, `Accounts`, `Roles`, `Memberships`. |
| Object ownership không bị chuyển sang MOD-01 | PASS | `ProjectScopeRef` chỉ chứa `project_id`; tồn tại/sở hữu project được xác minh qua port do MOD-02 cung cấp khi implementation. |
| Audit boundary đúng trách nhiệm | PASS | Contract chỉ phát `AccessAuditEvent`; lưu/retention/query thuộc MOD-17. |
| Security và error semantics có thể kiểm thử | PASS | RFC 9457 schema, 401/403/404 policy, CSRF header, ETag/If-Match và scenario negative được đặc tả. |
| Không thêm hạ tầng ngoài kiến trúc | PASS | Không JWT, Redis, broker, external IdP hoặc microservice. |

## Complexity Tracking

Không có vi phạm gate cần biện minh.

## Requirements Traceability

| Requirement | Contract/operation | Validation chính |
|---|---|---|
| `FR-001` | `createAuthSession`, `getCurrentIdentity`, `revokeCurrentSession`, `changeCurrentPassword` | Quickstart A, B, F |
| `FR-002` | Role catalog; global-role bindings; project memberships; internal `authorize` | Quickstart D, E; policy matrix |
| `FR-003` | Account list/create/get/update/revoke sessions | Quickstart C |
| `FR-004` | Internal authorization contract; deny/404 mapping | Quickstart F |
| `NFR-010` | Project-scoped binding và server-side object context | Cross-project tests |
| `NFR-011` | Secret-free schemas, redaction, opaque session verifier | Static contract + log/event scan |
| `NFR-012` | `AccessAuditEvent` và reliable publisher/outbox boundary | Quickstart H |
| `AC-016` | Deny-by-default, object concealment, no metadata disclosure | Quickstart F |

