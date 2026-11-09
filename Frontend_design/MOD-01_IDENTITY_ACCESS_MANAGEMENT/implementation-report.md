# Implementation report — Frontend demo MOD-01

Ngày hoàn tất kỹ thuật: 2026-11-09.

## Kết quả

Đã tạo workspace `frontend/` cho riêng MOD-01 bằng React 19, TypeScript strict, Vite, Ant Design, TanStack Query, `openapi-fetch`, MSW, Vitest và Playwright. Giao diện có authentication/session, forced/voluntary password change, account lifecycle với ETag, role catalog/global binding, project membership dùng opaque project ID, scenario selector demo-only và các async/error state dùng chung.

Mọi API call dùng generated OpenAPI types, `credentials: "include"`; mutation nhận `X-CSRF-Token` từ memory-only store. Mock không phải authorization/security boundary và không dùng dữ liệu thật.

## Validation đã chạy

| Lệnh | Kết quả |
|---|---|
| `npm ci --cache .npm-cache --no-audit --no-fund` | PASS — 418 packages; có warning ESLint 9.39.5 deprecated |
| `npm run api:lint` | PASS — OpenAPI hợp lệ; 5 warning tài liệu sẵn có |
| `npm run api:generate` | PASS — sinh `src/generated/api-schema.ts` bằng openapi-typescript 7.13.0 |
| `npm run api:check` | PASS — generated client đồng bộ contract |
| `npm run format:check` | PASS |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 15 files, 46 tests |
| `npm run build` | PASS — có warning chunk JS khoảng 1.25 MB, gzip khoảng 402 kB |
| `npm run test:e2e` | PASS — Chromium, 14/14 tests, gồm forced password, session expiry, dialog/error axe và viewport 1024 px |

Vitest có warning không gây fail từ jsdom `getComputedStyle` pseudo-elements và một Ant Design deprecated prop trong component test. Không bỏ qua test failure.

## CodeGraph

Đã chạy lại `codegraph sync .` và `codegraph status .` sau convergence. Index up to date: 65 files, 498 nodes, 1.073 edges. CodeGraph cảnh báo index được tạo bởi engine version cũ; có thể full re-index để nhận cải tiến engine, nhưng không ảnh hưởng trạng thái đồng bộ hiện tại.

## Evidence success criteria

- SC-002: automated forced-password → rotate → session-expiry journey hoàn thành khoảng 1,6 giây, thấp hơn ngưỡng 2 phút.
- SC-003: account create journey hoàn thành khoảng 1,5 giây, thấp hơn ngưỡng 3 phút; stale 412/status editor được component/integration test riêng.
- SC-004: membership navigation/opaque-scope journey khoảng 1 giây; create/revoke được integration test. Manual thao tác nhập liệu vẫn cần người duyệt xác nhận trong demo.
- SC-005: unit test ánh xạ đủ 8 nhóm `401/403/404/409/412/422/429/503`; error scenario và recovery có E2E/axe.
- Contract operation coverage tự đọc OpenAPI và so khớp đủ 18 operation IDs; thêm runtime guard cho response malformed.

## Phạm vi và TBD

- Không sửa `API_design/.../openapi.yaml` và không thêm route/model cho project CRUD, experiment, run, simulator, training hoặc evaluation.
- `RECENT_AUTH_REQUIRED` chỉ là mã mock phục vụ demo; OpenAPI chưa chuẩn hóa mã Problem này.
- Manual screen-reader smoke và two-view ETag review vẫn chờ người duyệt; xem `checklists/accessibility.md`.
- Máy thực thi có Node 20.19.0 trong khi plan đề xuất Node 24 LTS. Redocly cảnh báo Node 20 đã EOL; cần nâng toolchain CI/dev lên Node 22.12+ hoặc 24 LTS.
- Bundle demo chưa code-split; đây là tối ưu sau demo, không mở rộng phạm vi module.
