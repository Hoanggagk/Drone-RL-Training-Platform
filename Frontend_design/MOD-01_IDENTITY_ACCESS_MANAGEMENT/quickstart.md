# Quickstart Validation Guide — Frontend Demo MOD-01

Repository hiện chưa có `frontend/package.json` hoặc source code. Vì vậy các lệnh dưới đây là **planned commands** mà implementation phải tạo; chúng chưa được chạy và không được báo là đã pass ở giai đoạn design.

## 1. Inputs

- `Frontend_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/spec.md`
- `Frontend_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/contracts/`
- `API_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/contracts/openapi.yaml`

## 2. Planned setup and quality commands

Sau khi implementation tạo toolchain và scripts tương ứng:

```text
cd frontend
npm ci
npm run api:lint
npm run api:generate
npm run api:check
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Ý nghĩa bắt buộc:

- `api:lint`: lint OpenAPI nguồn, không sửa file nguồn.
- `api:generate`: sinh `src/generated/api-schema.ts` deterministically.
- `api:check`: fail nếu generated artifact drift.
- `test`: unit/component/integration với MSW reset giữa test.
- `test:e2e`: P1–P3, keyboard, 1024 px và axe scan.

## 3. Manual demo validation

### Scenario A — Authentication

1. Chọn `auth-standard`, login, kiểm tra identity, logout.
2. Chọn `auth-force-password`, xác nhận route guard chỉ cho đổi password/logout.
3. Đổi password, xác nhận session/CSRF context rotate rồi vào `/iam`.
4. Kích hoạt `session-expired`, xác nhận private content biến mất và redirect login.

### Scenario B — Account lifecycle

1. Login bằng Platform Administrator.
2. List/filter/page accounts; phân biệt loading, initial-empty và filtered-empty.
3. Tạo account, kiểm tra `must_change_password=true`.
4. Mở hai view cùng account, cập nhật một view rồi dùng ETag cũ ở view còn lại.
5. Xác nhận 412 không ghi đè, refetch và yêu cầu reapply.

### Scenario C — Roles and memberships

1. Xem role catalog read-only.
2. Grant/revoke global binding; kiểm tra recent-auth và last-admin conflict.
3. Tạo/revoke project membership bằng opaque project ID.
4. Xác nhận không có màn hình hoặc dữ liệu nội dung project.

### Scenario D — Error recovery

Chạy lần lượt `401`, `403`, `404`, `409`, `412`, `422`, `429`, `503` và network failure. Mỗi trạng thái phải có thông điệp tiếng Việt an toàn, correlation ID khi có và recovery action đúng `mock-scenarios.md`.

### Scenario E — Accessibility

1. Hoàn thành P1–P3 chỉ bằng keyboard.
2. Kiểm tra focus sau validation, modal close và route transition.
3. Screen-reader smoke: status announcement, error summary, table headers, dialog name.
4. Kiểm tra 1024 px không clip required action.

## 4. Expected evidence

- Generated-operation coverage: 18/18.
- Required error coverage: 8/8 status groups.
- P1–P3 keyboard journeys pass; không critical/serious axe finding trên các page chính.
- Không có password/cookie/CSRF token trong fixture snapshot, log hoặc persistent browser storage.
- Không có route/page/client model của module ngoài MOD-01.

