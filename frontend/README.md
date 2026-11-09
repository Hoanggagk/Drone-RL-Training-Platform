# Frontend demo MOD-01

Giao diện React/TypeScript này chỉ trình diễn **Identity & Access Management (MOD-01)**. Mock API, tài khoản mẫu, quyền và bộ chọn kịch bản không phải cơ chế bảo mật thật; không dùng với dữ liệu thật hoặc production. Backend vẫn phải là thẩm quyền authorization.

## Chạy local

Máy đã xác minh với Node.js `20.19.0` và npm `10.8.2`:

```powershell
npm ci
npm run api:check
npm run dev -- --mode demo
```

Mở `http://localhost:5173/login`, đăng nhập bằng tên bất kỳ và password bất kỳ khác `wrong`. Chọn scenario trong panel demo để reset state. Mock chạy trong browser và reset khi reload; password, cookie và CSRF token không được ghi vào persistent storage.

## Contract và quality gates

Client TypeScript được sinh từ `../API_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/contracts/openapi.yaml`:

```powershell
npm run api:lint
npm run api:generate
npm run api:check
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Chỉ chạy `api:generate` sau khi thay đổi contract được phê duyệt. `api:check` sinh lại vào file tạm và fail nếu client committed bị drift. Tất cả request dùng `credentials: "include"`; mutation nhận `X-CSRF-Token` từ memory-only store.

## Kịch bản demo

Catalog gồm: đăng nhập chuẩn, buộc đổi password, sai credentials, session hết hạn, không đủ quyền, validation 422, ETag stale 412, recent-auth required, last-admin conflict, membership trùng, service unavailable, network failure và danh sách account rỗng.

Recent-auth dùng mã mock `RECENT_AUTH_REQUIRED` để trình diễn UX. OpenAPI hiện chưa chuẩn hóa mã Problem này, vì vậy đây vẫn là TBD contract và không được xem là quyết định backend đã duyệt.

## Giới hạn

- State mock nằm trong memory của tab, không mô phỏng bảo mật hay persistence thật.
- Không có route/model cho project CRUD, experiment, run, simulator, training hoặc evaluation; `project_id` chỉ là opaque scope reference.
- Bundle demo chưa code-split và Vite cảnh báo chunk JavaScript lớn hơn 500 kB.
