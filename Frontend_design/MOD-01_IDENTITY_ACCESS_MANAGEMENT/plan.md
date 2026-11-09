# Implementation Plan: Frontend Demo MOD-01 Identity & Access Management

**Branch**: `MOD-01_IDENTITY_ACCESS_MANAGEMENT` | **Date**: 2026-11-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification tại `Frontend_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/spec.md` và API contract tại `API_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/contracts/openapi.yaml`.

## Summary

Xây dựng một SPA demo desktop-first cho riêng MOD-01, dùng React + TypeScript và Ant Design. TypeScript API types được sinh từ OpenAPI, runtime client dùng một lớp fetch mỏng với cookie credentials và CSRF middleware. MSW mô phỏng 18 operations cùng workflow stateful để demo không phụ thuộc Backend thật. TanStack Query quản lý server state; routing bắt buộc phân biệt anonymous, authenticated, forced-password-change và Platform Administrator.

Kế hoạch không tạo UI hoặc client logic cho project, experiment, run, simulator, training, evaluation hay module khác. `project_id` chỉ là opaque text/UUID được nhập hoặc chọn từ fixture demo.

## Technical Context

**Language/Version**: TypeScript strict mode; React 19; Node.js 24 LTS baseline đề xuất. Patch versions được pin trong `package-lock.json` khi implementation bắt đầu.

**Primary Dependencies**: Vite; React Router declarative mode; Ant Design; TanStack Query; `openapi-typescript` + `openapi-fetch`; MSW. Không thêm Redux/Zustand, Next.js, React Hook Form hoặc Zod trong MVP demo.

**Storage**: Không có persistent application storage. Identity, CSRF token và query state chỉ ở memory. Không lưu password, session cookie hoặc CSRF token vào local/session storage. URL search params giữ filter/pagination không nhạy cảm.

**Testing**: Vitest; React Testing Library + user-event; MSW; Playwright cho P1–P3; axe automation cộng kiểm tra keyboard/focus thủ công; Redocly CLI lint OpenAPI; generated-type drift gate; `tsc --noEmit`.

**Target Platform**: Browser evergreen trên desktop/tablet ngang, chiều rộng từ 1024 px; giao diện tiếng Việt; same-origin là deployment profile mặc định.

**Project Type**: Client-rendered web SPA trong thư mục `frontend/`.

**Performance Goals**: Route chính hiển thị feedback loading trong 100 ms sau thao tác; mutation không gửi trùng; production bundle budget và LCP chỉ là mục tiêu benchmark sau khi có implementation, không phải yêu cầu đã duyệt.

**Constraints**: Chỉ MOD-01; OpenAPI là nguồn sự thật; generated types không sửa tay; `credentials: "include"`; mutation gửi `X-CSRF-Token` và `Origin` theo browser; 401 xóa private cache; mock không được tuyên bố là bằng chứng bảo mật thật; WCAG 2.2 AA cho P1–P3.

**Scale/Scope**: Nhóm người dùng nhỏ; dữ liệu demo tối đa hàng trăm account/binding, page size theo contract tối đa 100; không virtualized grid, SSR, PWA, mobile-phone layout hoặc design system toàn nền tảng.

## Constitution Check

*GATE: kiểm tra trước Phase 0 và lặp lại sau Phase 1.*

`.specify/memory/constitution.md` hiện là template chưa ratify, không có nguyên tắc chuẩn tắc có thể đánh giá. Các gate áp dụng lấy từ `AGENTS.md` và tài liệu kiến trúc dự án.

| Gate | Kết quả trước research | Bằng chứng |
|---|---|---|
| Frontend chỉ presentation/API interaction, không chứa logic authorization thật | PASS | Route/visibility chỉ phục vụ UX; Backend vẫn là security boundary. |
| Không thiết kế sang module khác | PASS | Chỉ feature package `identity-access`; project chỉ là opaque scope ID. |
| Contract-first, validate boundary | PASS | Types sinh từ OpenAPI; response/error đi qua adapter typed. |
| Không ghi secret/log fixture thật | PASS | Memory-only CSRF; cookie HttpOnly không đọc; fixture dùng dữ liệu giả. |
| Mọi thay đổi source tương lai có test phù hợp | PASS | Unit/component/integration/E2E/accessibility gates được lập kế hoạch. |
| Chưa có toolchain thì không tuyên bố lệnh đã chạy | PASS | Quickstart đánh dấu các lệnh là planned until implementation. |

**Governance gap**: Constitution cần được ratify ở công việc riêng; feature này không sửa constitution.

## Project Structure

### Documentation (this feature)

```text
Frontend_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── tasks.md
├── checklists/
│   └── requirements.md
└── contracts/
    ├── ui-routes.md
    └── mock-scenarios.md
```

### Source Code (repository root, tạo ở implementation)

```text
frontend/
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts
├── scripts/
│   └── check-generated-client.mjs
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── providers.tsx
│   │   ├── router.tsx
│   │   └── guards/
│   ├── generated/
│   │   └── api-schema.ts
│   ├── lib/
│   │   └── api/
│   │       ├── client.ts
│   │       ├── csrf.ts
│   │       └── problem.ts
│   ├── features/
│   │   └── identity-access/
│   │       ├── api/
│   │       ├── components/
│   │       ├── model/
│   │       ├── pages/
│   │       └── queries/
│   ├── mocks/
│   │   ├── browser.ts
│   │   ├── handlers/
│   │   ├── scenarios/
│   │   └── store/
│   ├── test/
│   └── main.tsx
└── tests/
    └── e2e/
```

**Structure Decision**: Một SPA độc lập trong `frontend/`, tổ chức feature-based. Generated schema nằm ngoài feature nhưng chỉ phản ánh OpenAPI MOD-01 hiện tại. Không tạo route, page, mock handler hoặc model cho module khác.

## Phase 0 — Research

Các quyết định đã hợp nhất trong [research.md](research.md): SPA/Vite, Ant Design, TanStack Query, OpenAPI types + thin client, MSW stateful mock, React Router declarative guards, Vitest/RTL/Playwright/axe và contract drift gate. Không còn `NEEDS CLARIFICATION`.

## Phase 1 — Design & Contracts

- View/state model: [data-model.md](data-model.md).
- Route/guard/UI contract: [contracts/ui-routes.md](contracts/ui-routes.md).
- Mock scenario contract: [contracts/mock-scenarios.md](contracts/mock-scenarios.md).
- Planned validation guide: [quickstart.md](quickstart.md).

## Constitution Check — Post-design

| Gate | Kết quả sau design | Bằng chứng |
|---|---|---|
| Chỉ MOD-01 | PASS | Route contract chỉ có auth, accounts, roles, bindings, memberships. |
| Không coi mock/client guard là security boundary | PASS | Mock contract và quickstart ghi rõ giới hạn; backend authorization vẫn authoritative. |
| OpenAPI không bị frontend sao chép/sửa ngầm | PASS | Types generated, drift check và không có handwritten request/response interfaces. |
| Secret không vào browser storage/log | PASS | Data model cấm persistent secret state; test coverage có redaction. |
| Error và accessibility có thể kiểm thử | PASS | Tám status code, keyboard, focus, live region và 1024 px đều có scenario. |

## Complexity Tracking

Không có vi phạm gate cần biện minh. Các thư viện được chọn đều giải quyết một trách nhiệm riêng; Redux, SSR framework, form framework bổ sung và schema runtime thứ hai bị loại khỏi MVP.

