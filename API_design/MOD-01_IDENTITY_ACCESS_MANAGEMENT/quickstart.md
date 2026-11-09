# Quickstart xác minh thiết kế API MOD-01

Tài liệu này là validation guide cho contract, không phải hướng dẫn triển khai. Repository chưa có source code/toolchain nên các lệnh runtime là tiêu chí cần bổ sung khi implementation bắt đầu; không bịa lệnh build/test ở giai đoạn thiết kế.

## 1. Prerequisites

- Đọc [spec.md](spec.md), [data-model.md](data-model.md), [REST contract](contracts/openapi.yaml) và [internal authorization contract](contracts/internal-authorization.md).
- Có OpenAPI 3.1 validator hỗ trợ JSON Schema 2020-12 trong toolchain được dự án chọn.
- Khi có implementation: PostgreSQL test instance cô lập, HTTPS/test proxy cho cookie security, hai account thường, một Platform Admin và hai opaque project ID thuộc test fixture của MOD-02 adapter.

## 2. Static contract validation

1. Parse `contracts/openapi.yaml` bằng OpenAPI 3.1 validator.
2. Kiểm tra mọi operation có `operationId` duy nhất, response lỗi dùng `application/problem+json`, và mutation được bảo vệ có header CSRF.
3. Kiểm tra chỉ có các nhóm endpoint Authentication, Accounts, Roles và Memberships.
4. Tìm và fail nếu example chứa password thật, cookie, token hoặc hash.

**Expected**: contract hợp lệ; không có endpoint project/experiment/run/model/audit query/simulator/training/evaluation.

## 3. Scenario A — Login, identity, logout

1. `POST /api/v1/auth/sessions` với credential hợp lệ.
2. Xác nhận `201`, cookie `Secure; HttpOnly; SameSite=Strict; Path=/`, response `Cache-Control: no-store` và không có session secret trong JSON.
3. `GET /api/v1/auth/me` bằng cookie vừa nhận; xác nhận đúng account/role summary tối thiểu.
4. Lấy CSRF token theo contract, sau đó `DELETE /api/v1/auth/sessions/current`.
5. Gọi lại `/auth/me` bằng cookie cũ.

**Expected**: bước 5 trả `401`; logout là state-idempotent nhưng request lặp với session đã revoke vẫn trả `401`.

## 4. Scenario B — Chống account enumeration và brute force

1. Gửi login với username tồn tại/password sai và username không tồn tại.
2. So sánh status, problem `code` và message public.
3. Gửi vượt ngưỡng policy trong test environment.

**Expected**: hai trường hợp đầu không tiết lộ account tồn tại; vượt ngưỡng trả `429` và `Retry-After`; log/event không chứa password.

## 5. Scenario C — Account administration và concurrency

1. Actor thường gọi list/create/patch account.
2. Admin tạo account hợp lệ; đăng nhập account mới và xác nhận chỉ identity/CSRF/đổi password/logout được phép đến khi đổi password.
3. Hai client đọc cùng account/ETag; client A patch status với `If-Match`, client B dùng ETag cũ.
4. Admin khóa account và kiểm tra session active của account đó.

**Expected**: actor thường bị `403`; create trả `201`; initial password buộc đổi; đổi password rotate session/CSRF và thu hồi session khác; client B nhận `412`; session của account bị khóa không còn hợp lệ.

## 6. Scenario D — Project membership không lấn boundary

1. Admin tạo membership cho account ở project A bằng opaque `project_id`.
2. Tạo lại cùng semantic binding với cùng `Idempotency-Key`.
3. Thử project ID không tồn tại qua fake scope resolver.
4. Thu hồi membership.

**Expected**: không có project metadata được tạo/lưu trong MOD-01; retry không tạo duplicate; invalid scope không lưu binding; revoke phát event đã redact.

## 7. Scenario E — Global Platform Administrator binding

1. Admin có recent authentication gán `platform_admin` cho một account active.
2. Actor không recent-authenticated thử gán/thu hồi global binding.
3. Thử thu hồi binding của Platform Administrator active cuối cùng.

**Expected**: bước 1 thành công và phát audit event; bước 2 bị yêu cầu reauthentication; bước 3 bị conflict và hệ thống vẫn còn ít nhất một active Platform Administrator.

## 8. Scenario F — Authorization chéo project (`AC-016`)

1. Account có role tại project A, không có binding tại project B.
2. Module stub gọi internal `authorize` cho cùng action/object type ở A và B.
3. Gọi một object-scoped HTTP route của module stub bằng ID thuộc B.

**Expected**: A allow theo policy; B deny; public response không tiết lộ object B và dùng `404` khi concealment policy áp dụng.

## 9. Scenario G — CSRF và session expiry

1. Gửi authenticated mutation thiếu/sai `X-CSRF-Token`.
2. Gửi từ origin không nằm trong allowlist.
3. Dịch clock/test fixture qua idle và absolute expiry.

**Expected**: mutation không xảy ra; session expired trả `401`; không fail-open.

## 10. Scenario H — Audit boundary failure

1. Làm audit publisher/outbox dependency lỗi khi thay đổi membership.
2. Quan sát response và database transaction.

**Expected**: không báo thành công giả; mutation rollback hoặc được giữ trong outbox transaction theo implementation đã chọn; không mất dấu thay đổi quyền.

## 11. Definition of done cho implementation tương lai

- Formatter, linter, type checker và test suite thực tế đều pass.
- OpenAPI generated từ code không drift so với contract đã duyệt.
- Unit/contract/integration/security tests bao phủ scenario A–H.
- Không có secret trong log, fixture, artifact hoặc repository.
- `codegraph sync .` và `codegraph status .` được chạy sau khi có/sửa source code; hiện tại chỉ có Markdown/YAML nên chưa cần sync index.

