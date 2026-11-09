# Tasks: Frontend Demo MOD-01 Identity & Access Management

**Input**: Design documents from `Frontend_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: Bắt buộc vì spec yêu cầu contract coverage, keyboard/accessibility và error-state validation.

**Organization**: Tasks được nhóm theo user story để từng lát cắt có thể triển khai và kiểm thử độc lập.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Có thể chạy song song vì khác file và không phụ thuộc task chưa hoàn tất.
- **[Story]**: Ánh xạ tới user story trong `spec.md`.
- Mọi task đều có đường dẫn file cụ thể.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Khởi tạo frontend workspace và quality toolchain, chưa viết feature behavior.

- [X] T001 Khởi tạo Vite React TypeScript workspace trong `frontend/package.json`, `frontend/package-lock.json`, `frontend/index.html`, `frontend/src/main.tsx` và pin Node.js 24 LTS trong `frontend/.nvmrc`
- [X] T002 Cấu hình TypeScript strict cùng `noUncheckedIndexedAccess` trong `frontend/tsconfig.json`, `frontend/tsconfig.app.json` và `frontend/tsconfig.node.json`
- [X] T003 [P] Cấu hình Vite và biến môi trường allowlisted cho API base URL/demo mode trong `frontend/vite.config.ts`, `frontend/src/vite-env.d.ts` và `frontend/.env.example`
- [X] T004 [P] Cấu hình ESLint và formatter checks trong `frontend/eslint.config.js`, `frontend/.prettierrc.json` và scripts tương ứng trong `frontend/package.json`
- [X] T005 [P] Cấu hình Vitest, jsdom và shared test setup trong `frontend/vitest.config.ts` và `frontend/src/test/setup.ts`
- [X] T006 [P] Cấu hình Playwright projects cho Chromium, viewport 1024 px và axe dependency trong `frontend/playwright.config.ts`
- [X] T007 Tạo feature-only directory structure theo plan trong `frontend/src/app/`, `frontend/src/generated/`, `frontend/src/lib/api/`, `frontend/src/features/identity-access/`, `frontend/src/mocks/` và `frontend/tests/e2e/`
- [X] T008 [P] Thêm scripts planned `api:lint`, `api:generate`, `api:check`, `format:check`, `lint`, `typecheck`, `test`, `build`, `test:e2e` vào `frontend/package.json`
- [X] T009 [P] Ghi rõ demo-only security boundary và không chứa dữ liệu thật trong `frontend/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contract client, state/error infrastructure, router/providers và deterministic mock nền tảng cho mọi story.

**⚠️ CRITICAL**: Không bắt đầu user story trước khi phase này hoàn tất.

- [X] T010 Lint `API_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/contracts/openapi.yaml` và sinh deterministic types vào `frontend/src/generated/api-schema.ts` bằng config/scripts trong `frontend/package.json`
- [X] T011 Tạo generated-client drift checker trong `frontend/scripts/check-generated-client.mjs` để `api:check` fail khi OpenAPI và `frontend/src/generated/api-schema.ts` lệch nhau
- [X] T012 [P] Viết unit tests cho status mapping `401/403/404/409/412/422/429/503`, `Retry-After` và network exception trong `frontend/src/lib/api/problem.test.ts`
- [X] T013 Implement typed RFC 9457 adapter với categories `reauth/forbidden/unavailable/conflict/stale/validation/throttled/network/unknown` trong `frontend/src/lib/api/problem.ts`
- [X] T014 [P] Implement memory-only CSRF store không log/persist token trong `frontend/src/lib/api/csrf.ts`
- [X] T015 Implement `openapi-fetch` client với `credentials: "include"`, CSRF mutation middleware, base URL config và 401 callback trong `frontend/src/lib/api/client.ts`
- [X] T016 [P] Tạo TanStack Query client defaults không auto-retry mutation/401 và helper cancel-remove private cache trong `frontend/src/app/query-client.ts`
- [X] T017 [P] Tạo `AuthViewState` finite-state types với `unknown/anonymous/authenticated/forced_password_change`, safe internal return-path allowlist và transitions trong `frontend/src/features/identity-access/model/auth-state.ts`
- [X] T018 [P] Tạo MSW deterministic in-memory store chỉ gồm account, role binding, membership và simulated session trong `frontend/src/mocks/store/identity-access-store.ts`
- [X] T019 Tạo MSW browser/server entrypoints và fail-on-unhandled-request policy trong `frontend/src/mocks/browser.ts`, `frontend/src/mocks/server.ts` và `frontend/src/mocks/handlers/index.ts`
- [X] T020 Tạo App providers và router shell chỉ có route MOD-01 theo `contracts/ui-routes.md` trong `frontend/src/app/providers.tsx`, `frontend/src/app/router.tsx` và `frontend/src/app/App.tsx`

**Checkpoint**: OpenAPI types, API client, error adapter, query cache, auth state và mock runtime sẵn sàng.

---

## Phase 3: User Story 1 — Truy cập và quản lý phiên cá nhân (Priority: P1) 🎯 MVP

**Goal**: Login, identity bootstrap, forced password change, rotated session/CSRF và logout hoạt động độc lập.

**Independent Test**: Chạy `auth-standard`, `auth-force-password`, invalid credentials và session-expired; hoàn thành login → forced change → logout chỉ bằng keyboard.

### Tests for User Story 1

- [X] T021 [P] [US1] Viết auth state/guard unit tests cho mọi transition và invariant forced-password trong `frontend/src/features/identity-access/model/auth-state.test.ts`
- [X] T022 [P] [US1] Viết Login và Change Password component tests gồm visible labels, duplicate-submit prevention, generic 401, focus/error summary và secret clearing trong `frontend/src/features/identity-access/pages/auth-pages.test.tsx`
- [X] T023 [P] [US1] Viết MSW integration tests cho `createAuthSession`, `getCurrentIdentity`, `issueCsrfToken`, `changeCurrentPassword`, `revokeCurrentSession`, session/CSRF rotation và private-cache clearing trong `frontend/src/features/identity-access/api/auth.integration.test.tsx`
- [X] T024 [P] [US1] Viết Playwright keyboard journey login → forced password → logout và session-expiry redirect trong `frontend/tests/e2e/auth.spec.ts`

### Implementation for User Story 1

- [X] T025 [US1] Implement stateful auth MSW handlers và scenarios `auth-standard`, `auth-force-password`, `invalid-credentials`, `session-expired` trong `frontend/src/mocks/handlers/auth.ts` và `frontend/src/mocks/scenarios/auth.ts`
- [X] T026 [US1] Implement identity, CSRF, login, password-change và logout query/mutation hooks trong `frontend/src/features/identity-access/queries/auth.ts`
- [X] T027 [P] [US1] Implement accessible Login page bằng tiếng Việt trong `frontend/src/features/identity-access/pages/LoginPage.tsx`
- [X] T028 [P] [US1] Implement forced/voluntary Change Password page, clear password fields và nhận rotated CSRF trước navigation trong `frontend/src/features/identity-access/pages/ChangePasswordPage.tsx`
- [X] T029 [US1] Implement anonymous/authenticated/forced-password/admin guard precedence và safe return path trong `frontend/src/app/guards/AuthGuards.tsx`
- [X] T030 [US1] Implement authenticated MOD-01 shell với identity summary và keyboard-reachable logout trong `frontend/src/features/identity-access/components/IdentityAccessLayout.tsx`

**Checkpoint**: US1 chạy độc lập và là MVP demo được.

---

## Phase 4: User Story 2 — Quản lý vòng đời tài khoản (Priority: P2)

**Goal**: Platform Administrator list/search/filter/page, create, view, update status bằng ETag và revoke sessions.

**Independent Test**: Dùng fixture account mẫu để tạo account, stale-update 412, lock/disable và revoke sessions mà không cần role/membership UI.

### Tests for User Story 2

- [X] T031 [P] [US2] Viết account API integration tests cho `listAccounts`, `createAccount`, `getAccount`, `updateAccount`, `revokeAccountSessions`, page size `1–100` mặc định `25` và ETag/If-Match trong `frontend/src/features/identity-access/api/accounts.integration.test.tsx`
- [X] T032 [P] [US2] Viết Account list/form/detail component tests cho `initial_loading/refreshing/success/initial_empty/filtered_empty/error`, 422 summary và 412 recovery trong `frontend/src/features/identity-access/pages/account-pages.test.tsx`
- [X] T033 [P] [US2] Viết Playwright account lifecycle, stale update, revoke sessions và non-admin forbidden tests trong `frontend/tests/e2e/accounts.spec.ts`

### Implementation for User Story 2

- [X] T034 [US2] Implement stateful account handlers/scenarios gồm lifecycle, 422, stale-account 412 và permission denied trong `frontend/src/mocks/handlers/accounts.ts` và `frontend/src/mocks/scenarios/accounts.ts`
- [X] T035 [US2] Implement typed account list/detail/create/update/revoke query hooks với confirmed write + invalidation trong `frontend/src/features/identity-access/queries/accounts.ts`
- [X] T036 [P] [US2] Implement semantic Account table, search, status filter, cursor pagination và distinct empty states trong `frontend/src/features/identity-access/pages/AccountsPage.tsx`
- [X] T037 [P] [US2] Implement Account create form với username `3–64`, display name `1–120`, password `12–128`, visible labels và 422 mapping trong `frontend/src/features/identity-access/components/AccountCreateForm.tsx`
- [X] T038 [US2] Implement Account detail/status editor gửi current ETag, xử lý 412 bằng refetch + manual reapply và không last-write-wins trong `frontend/src/features/identity-access/pages/AccountDetailPage.tsx`
- [X] T039 [US2] Implement accessible confirmation và feedback cho account status/session revocation trong `frontend/src/features/identity-access/components/AccountActions.tsx`

**Checkpoint**: US2 độc lập trên nền auth/admin guard và không phụ thuộc role/membership pages.

---

## Phase 5: User Story 3 — Quản lý role và quyền truy cập (Priority: P3)

**Goal**: Role catalog read-only, global Platform Administrator binding và project membership lifecycle.

**Independent Test**: Dùng opaque project ID/account fixture để grant/revoke bindings, recent-auth, last-admin conflict và revoked history mà không có project UI.

### Tests for User Story 3

- [X] T040 [P] [US3] Viết roles/global bindings integration tests cho `listRoleDefinitions`, `listGlobalRoleBindings`, `createGlobalRoleBinding`, `revokeGlobalRoleBinding`, recent-auth và last-admin 409 trong `frontend/src/features/identity-access/api/roles.integration.test.tsx`
- [X] T041 [P] [US3] Viết project membership integration tests cho `listProjectMemberships`, `createProjectMembership`, `getProjectMembership`, `revokeProjectMembership`, duplicate 409 và opaque project ID trong `frontend/src/features/identity-access/api/memberships.integration.test.tsx`
- [X] T042 [P] [US3] Viết role/membership tables, forms, dialogs, revoked-history và error recovery component tests trong `frontend/src/features/identity-access/pages/access-pages.test.tsx`
- [X] T043 [P] [US3] Viết Playwright global admin binding và project membership keyboard journeys trong `frontend/tests/e2e/access.spec.ts`

### Implementation for User Story 3

- [X] T044 [US3] Implement role/global-binding handlers và deterministic scenarios cho grant/revoke/recent-auth/last-admin trong `frontend/src/mocks/handlers/roles.ts` và `frontend/src/mocks/scenarios/roles.ts`
- [X] T045 [US3] Implement membership handlers và scenarios cho active/revoked history, duplicate, invalid scope và unavailable service trong `frontend/src/mocks/handlers/memberships.ts` và `frontend/src/mocks/scenarios/memberships.ts`
- [X] T046 [P] [US3] Implement typed role/global-binding hooks trong `frontend/src/features/identity-access/queries/roles.ts`
- [X] T047 [P] [US3] Implement typed project-membership hooks với idempotency key không log trong `frontend/src/features/identity-access/queries/memberships.ts`
- [X] T048 [US3] Implement read-only role catalog và global binding table/actions, recent-auth flow và last-admin conflict UI trong `frontend/src/features/identity-access/pages/RolesPage.tsx`
- [X] T049 [US3] Implement project membership table/form/detail/revoke dùng opaque project ID và không expose project CRUD trong `frontend/src/features/identity-access/pages/MembershipsPage.tsx`

**Checkpoint**: P1–P3 hoàn chỉnh; không có route hoặc model module khác.

---

## Phase 6: User Story 4 — Trình diễn đầy đủ trạng thái giao diện (Priority: P4)

**Goal**: Người duyệt chọn được deterministic scenarios và quan sát loading/empty/success/error/retry behavior.

**Independent Test**: Chạy từng scenario bắt buộc và xác nhận không có dead-end, stale error hoặc unhandled request.

### Tests for User Story 4

- [X] T050 [P] [US4] Viết scenario registry tests bảo đảm mọi scenario reset deterministic và không dùng operation ngoài MOD-01 trong `frontend/src/mocks/scenarios/scenario-registry.test.ts`
- [X] T051 [P] [US4] Viết generated-operation coverage test bảo đảm 18/18 operationIds có scenario mapping trong `frontend/src/mocks/scenarios/operation-coverage.test.ts`
- [X] T052 [P] [US4] Viết error-state integration tests cho tám status groups, Retry-After có/không có, network failure và successful retry cleanup trong `frontend/src/features/identity-access/components/error-states.test.tsx`

### Implementation for User Story 4

- [X] T053 [US4] Tạo typed scenario registry tổng hợp auth/account/role/membership outcomes trong `frontend/src/mocks/scenarios/index.ts`
- [X] T054 [US4] Implement demo-only scenario selector bị loại khỏi production build trong `frontend/src/features/identity-access/components/DemoScenarioPanel.tsx`
- [X] T055 [US4] Implement shared loading, initial-empty, filtered-empty, error, retry-after countdown và correlation-ID presentation trong `frontend/src/features/identity-access/components/AsyncStates.tsx`

**Checkpoint**: P4 trình diễn độc lập toàn bộ contract/error behavior.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, contract integrity, security audit và documentation trên toàn feature.

- [X] T056 [P] Viết axe scans cho login, change password, accounts, roles, memberships, dialogs và error states trong `frontend/tests/e2e/accessibility.spec.ts`
- [X] T057 [P] Viết responsive 1024 px assertions không clip required actions trong `frontend/tests/e2e/responsive.spec.ts`
- [ ] T058 Thực hiện manual keyboard/focus/screen-reader checklist và ghi evidence trong `Frontend_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/checklists/accessibility.md`
- [X] T059 [P] Thêm automated scan cấm password/cookie/CSRF token trong fixtures, logs và persistent storage tests tại `frontend/src/test/sensitive-data.test.ts`
- [X] T060 Kiểm tra source tree không có route/page/model cho module ngoài MOD-01 và ghi scope test trong `frontend/src/test/module-boundary.test.ts`
- [X] T061 [P] Hoàn thiện Vietnamese copy/error message catalog nhất quán thuật ngữ trong `frontend/src/features/identity-access/model/messages.ts`
- [X] T062 Cập nhật lệnh chạy, mock limitations, generated-client workflow và scenario catalog trong `frontend/README.md`
- [X] T063 Chạy và ghi kết quả toàn bộ planned commands của `Frontend_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/quickstart.md` vào completion report, không bỏ qua failure
- [X] T064 Sau khi source code được tạo/sửa, chạy `codegraph sync .` và `codegraph status .`, rồi ghi trạng thái index trong `Frontend_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/implementation-report.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: Không phụ thuộc.
- **Phase 2 Foundational**: Phụ thuộc Phase 1; BLOCK mọi user story.
- **US1 (Phase 3)**: Phụ thuộc Phase 2; MVP đầu tiên.
- **US2 (Phase 4)**: Phụ thuộc Phase 2 và admin guard từ US1; account pages vẫn kiểm thử độc lập với role/membership.
- **US3 (Phase 5)**: Phụ thuộc Phase 2 và admin guard; dùng account IDs nhưng không phụ thuộc Account UI hoàn chỉnh.
- **US4 (Phase 6)**: Phụ thuộc scenario handlers của US1–US3 để tổng hợp đầy đủ.
- **Polish (Phase 7)**: Phụ thuộc các story được chọn cho release.

### User Story Dependency Graph

```text
Setup → Foundation → US1 (MVP)
                   ├─→ US2
                   └─→ US3
US1 + US2 + US3 ─────→ US4 → Polish
```

### Parallel Opportunities

- T003–T006, T008–T009 có thể song song sau T001.
- T012, T014, T016–T018 có thể song song sau T010/T011 theo file riêng.
- Tests `[P]` trong từng story có thể viết song song trước implementation tương ứng.
- US2 và US3 có thể triển khai song song sau khi auth/admin guard của US1 ổn định.
- Accessibility, responsive và sensitive-data tests T056–T059 có thể song song sau story pages.

## Parallel Example: User Story 2

```text
Task T031: Account API integration tests
Task T032: Account page/component tests
Task T033: Account lifecycle E2E tests

Sau khi handlers/query hooks sẵn sàng:
Task T036: Accounts page
Task T037: Account create form
```

## Parallel Example: User Story 3

```text
Task T040: Role/global binding integration tests
Task T041: Membership integration tests
Task T042: Access page component tests
Task T043: Access E2E tests

Sau mock handlers:
Task T046: Role hooks
Task T047: Membership hooks
```

## Implementation Strategy

### MVP First

1. Hoàn thành Phase 1–2.
2. Hoàn thành US1 T021–T030.
3. Dừng và kiểm thử login, forced password, session expiry, logout, keyboard flow.
4. Demo MVP trước khi mở rộng quản trị.

### Incremental Delivery

1. US1: Authentication/session.
2. US2: Account lifecycle.
3. US3: Roles/memberships.
4. US4: Scenario showcase.
5. Polish: accessibility/security/contract gates.

## Format Validation

- Tất cả 64 task dùng checkbox `- [ ]` và ID tuần tự `T001`–`T064`.
- Task thuộc user story có label `[US1]`–`[US4]`.
- `[P]` chỉ dùng khi file khác và không có dependency trực tiếp chưa hoàn tất.
- Mọi task chỉ tới file path cụ thể.

## Phase 8: Convergence tasks (2026-11-09)

Các task dưới đây được append bởi `speckit-converge` sau khi đối chiếu source với `spec.md`; không thay đổi OpenAPI hay mở rộng khỏi MOD-01.

- [X] T065 [P] [US4] Thêm runtime guards cho response quan trọng và scenario `contract-malformed` để fail-safe, không render dữ liệu đoán; kiểm thử tại `frontend/src/lib/api/response-guards.ts`, `frontend/src/lib/api/response-guards.test.ts` và `frontend/src/mocks/handlers/accounts.ts`
- [X] T066 [US1] Cho phép chọn scenario auth trước login và mở rộng Playwright cho forced-password, rotated CSRF, session-expired redirect cùng secret clearing tại `frontend/src/features/identity-access/pages/LoginPage.tsx` và `frontend/tests/e2e/auth.spec.ts`
- [X] T067 [US3] Bổ sung filter theo project/account/status, cursor pagination, xem chi tiết membership và các trạng thái loading/empty/error mà vẫn chỉ dùng opaque project ID tại `frontend/src/features/identity-access/pages/MembershipsPage.tsx` và `frontend/src/features/identity-access/pages/MembershipDetailPage.tsx`
- [X] T068 [P] [US4] Làm operation coverage tự đọc 18 `operationId` từ OpenAPI và tăng sensitive-data scan trên fixture/source/storage thay vì danh sách tĩnh tại `frontend/src/mocks/scenarios/operation-coverage.test.ts` và `frontend/src/test/sensitive-data.test.ts`
- [X] T069 [P] [US4] Mở rộng axe/keyboard E2E cho account dialog, confirmation dialog và error state; xác nhận focus return/không focus trap tại `frontend/tests/e2e/accessibility.spec.ts`
- [X] T070 [US4] Ghi evidence đo thời gian SC-002/SC-003/SC-004 và coverage SC-005 bằng automated journeys hoặc checklist có kết quả thực tế tại `Frontend_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/implementation-report.md`

