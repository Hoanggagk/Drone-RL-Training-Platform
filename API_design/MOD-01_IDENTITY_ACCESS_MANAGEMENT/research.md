# Phase 0 Research — API MOD-01

## 1. Cơ chế phiên cho Web MVP

**Decision**: Dùng opaque server-side session. Browser nhận cookie `__Host-drone_rl_session`; PostgreSQL chỉ lưu lookup ID và hash của secret verifier, không lưu raw verifier. Cookie có `Secure`, `HttpOnly`, `Path=/`, không có `Domain`, và `SameSite=Strict` mặc định cho triển khai same-origin.

**Rationale**: Phù hợp local/LAN, một modular monolith và yêu cầu thu hồi ngay khi logout/khóa tài khoản/thu hồi quyền. OWASP khuyến nghị session ID ngẫu nhiên, không mang nghĩa; state nằm phía server; cookie dùng `Secure`, `HttpOnly`, `SameSite`, và có thể lưu one-way verifier để giảm tác động read-only disclosure của session store. Nguồn: [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet).

**Alternatives considered**:

- JWT access/refresh token: từ chối cho MVP vì tăng logic rotation/denylist và có độ trễ giữa token claim với trạng thái role/session đã thu hồi.
- External OIDC provider: giữ làm extension point; chưa có yêu cầu SSO/IdP và sẽ mở rộng vận hành ngoài MOD-01 MVP.
- HTTP Basic: không dùng làm session ứng dụng browser.

Sau khi đổi password, server thu hồi các session khác và rotate session identifier/verifier cùng CSRF secret của session hiện tại.

## 2. Password storage và login defense

**Decision**: Hash password bằng Argon2id với salt riêng; parameter được benchmark trên máy đích và không thấp hơn baseline OWASP tại thời điểm implementation. Contract dùng password length 12–128 như baseline đề xuất cho MVP; Product Owner/Security review có thể siết policy trước implementation nhưng không được hạ protection của storage. Login response dùng thông báo chung, kiểm tra constant-time phù hợp và throttling theo account/IP với `429` + `Retry-After` khi vượt chính sách. Sau reverse proxy, chỉ tin `Forwarded`/`X-Forwarded-For` từ proxy nằm trong allowlist; nếu không dùng peer address.

**Rationale**: OWASP ưu tiên Argon2id và yêu cầu password không lưu plaintext hay reversible encryption. Nguồn: [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet).

**Alternatives considered**:

- bcrypt/PBKDF2: chỉ dùng khi có ràng buộc runtime/FIPS được phê duyệt.
- Tự hash SHA-256: loại bỏ vì không phù hợp password storage.

## 3. CSRF và browser boundary

**Decision**: Đây là browser-first API cho React frontend. Cookie session đi kèm synchronizer CSRF token. Login kiểm tra `Origin`/`Referer` allowlist; mọi mutation đã xác thực yêu cầu `X-CSRF-Token`. `SameSite` là defense-in-depth, không thay CSRF token. CORS tắt nếu same-origin; nếu tách origin thì dùng allowlist cụ thể và cho phép credentials, không dùng wildcard. Client tự động ngoài browser phải gửi Origin hợp lệ hoặc dùng một authentication profile khác được thiết kế/phê duyệt sau.

**Rationale**: Browser tự gửi cookie nên cần chống request giả mạo. OWASP lưu ý `SameSite` không thay thế CSRF token. Nguồn: [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) và [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet).

**Alternatives considered**:

- Chỉ dựa vào `SameSite`: loại bỏ.
- Đưa session token vào localStorage: loại bỏ để giảm khả năng bị JavaScript đọc khi có XSS.

## 4. Mô hình quyền

**Decision**: Fixed role catalog, role binding theo project scope, deny-by-default. `platform_admin` là global role chỉ cấp năng lực quản trị IAM; không suy diễn quyền sửa nội dung khoa học. Role nghiệp vụ được bind theo `project_id`. Module sở hữu object cung cấp `resource_type`, `resource_id`, `project_id` và `action` cho authorization port.

**Rationale**: Đáp ứng `FR-002`, `FR-004`, `IAM-R01`–`IAM-R03` mà chưa đưa custom policy editor hoặc multi-tenant IAM vào MVP. Mọi request phải kiểm tra object/function authorization; không tin identifier do client gửi. Nguồn: [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

**Alternatives considered**:

- Global RBAC thuần túy: loại bỏ vì không đủ chặn truy cập chéo project.
- ABAC/policy DSL tổng quát: hoãn vì chưa có use case và làm tăng complexity.
- Thiết kế quyền chi tiết cho project/run/model trong MOD-01: loại bỏ vì action/object semantics thuộc module sở hữu.

## 5. HTTP error và chống disclosure

**Decision**: Dùng `application/problem+json` theo RFC 9457, thêm `code`, `correlation_id` và `errors` cho validation. Dùng `401` cho thiếu/phiên không hợp lệ, `403` cho endpoint quản trị mà actor đã xác thực nhưng thiếu capability. Với object scoped có nguy cơ tiết lộ tồn tại, module sở hữu có thể trả `404` sau khi authorization deny theo policy thống nhất.

**Rationale**: RFC 9457 chuẩn hóa machine-readable errors nhưng cảnh báo không đưa implementation details. RFC 9110 cho phép trả `404` để không tiết lộ target resource bị cấm. Nguồn: [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html), [RFC 9110](https://datatracker.ietf.org/doc/html/rfc9110).

**Alternatives considered**:

- Error envelope tự chế: loại bỏ.
- Luôn trả `403` cho object-scoped deny: loại bỏ vì xung đột `AC-016` trong trường hợp identifier enumeration.

## 6. Concurrency và mutation semantics

**Decision**: Account dùng weak ETag từ `version`; `PATCH` yêu cầu `If-Match`. Membership uniqueness do database constraint bảo vệ; create có `Idempotency-Key` tùy chọn và duplicate semantic trả `409`. Delete membership và logout là idempotent theo trạng thái quan sát được.

**Rationale**: Đáp ứng yêu cầu chống lost update và request retry mà không thêm distributed lock/broker.

**Alternatives considered**:

- Last-write-wins: loại bỏ vì có thể khôi phục nhầm trạng thái/quyền cũ.
- Pessimistic lock kéo dài qua HTTP: loại bỏ vì giữ transaction không phù hợp.

## 7. OpenAPI version và API versioning

**Decision**: Contract dùng OpenAPI `3.1.0` và base path `/api/v1`. Đây là mức FastAPI tạo ra và hỗ trợ trực tiếp; không dùng OAS 3.2.x trước khi toolchain được xác minh. Breaking changes tạo API major mới; additive schema changes vẫn phải qua contract test.

**Rationale**: OpenAPI đã có 3.2.x nhưng compatibility của framework/generator quan trọng hơn chọn revision mới nhất. FastAPI ghi rõ sinh OpenAPI 3.1.0. Nguồn: [FastAPI OpenAPI documentation](https://fastapi.tiangolo.com/how-to/extending-openapi/), [OpenAPI Specification](https://spec.openapis.org/oas/).

**Alternatives considered**:

- OpenAPI 3.2.1: hoãn đến khi FastAPI, validator và client generator của dự án hỗ trợ.
- Không version URL: loại bỏ vì contract public cho frontend cần đường nâng major rõ.

## 8. Account provisioning và chức năng hoãn

**Decision**: MVP cho Admin tạo account với initial password qua TLS và cờ `must_change_password=true`. Session hạn chế chỉ cho đổi password, đọc identity/CSRF và logout cho đến khi đổi password thành công; sau đó rotate session + CSRF token. Không thiết kế email invitation, forgot-password, MFA, SSO hoặc account hard-delete. Admin có thể khóa/disable account và thu hồi toàn bộ session.

**Rationale**: Giữ đúng `FR-003` mức Could và nhóm người dùng nhỏ local/LAN, đồng thời tránh kéo email/identity provider vào phạm vi.

**Alternatives considered**:

- Email invite/recovery hoàn chỉnh: hoãn vì cần mail delivery, token lifecycle và product policy mới.
- Hard delete account: loại bỏ ở MVP để giữ lineage/audit reference; dùng trạng thái `disabled`.

## 9. Các quyết định sản phẩm còn chờ duyệt nhưng không chặn contract

- `Q-003`: contract giả định same-origin local/LAN; triển khai cloud/hybrid phải review cookie/CORS/TLS.
- `Q-013`: scale là nhóm nhỏ; không có group/class management.
- `Q-014`: Platform Administrator tối thiểu được giả định để contract quản trị có thể thiết kế; Product Owner quyết định endpoint nào bật trong MVP.
- Idle timeout, absolute timeout, password policy và rate-limit threshold là configuration policy; giá trị production phải phê duyệt sau threat model/benchmark.

