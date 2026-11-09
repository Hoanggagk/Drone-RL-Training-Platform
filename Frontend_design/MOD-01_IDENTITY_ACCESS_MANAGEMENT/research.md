# Phase 0 Research — Frontend Demo MOD-01

## 1. Application shape và runtime

**Decision**: SPA client-rendered với React 19, TypeScript strict, Vite, Node.js 24 LTS và npm lockfile; pin patch versions khi implementation.

**Rationale**: Demo quản trị nội bộ không cần SEO, SSR, server components hoặc server functions. React hướng dẫn Vite là lựa chọn phù hợp khi build app từ đầu; Vite không type-check nên có gate `tsc --noEmit`. Nguồn: [React Build from Scratch](https://react.dev/learn/build-a-react-app-from-scratch), [Vite Guide](https://vite.dev/guide/), [Node.js Releases](https://nodejs.org/en/about/previous-releases).

**Alternatives considered**: Next.js/React Router Framework mode bị loại vì vượt nhu cầu; Node.js 26 LTS hợp lệ nhưng mới hơn cần thiết; pnpm/Bun chưa có lợi ích đã chứng minh cho một frontend workspace.

## 2. Component library và forms

**Decision**: Ant Design và design tokens; Ant Design Form cho các form nhỏ. Không thêm React Hook Form/Zod trong MVP.

**Rationale**: Kiến trúc dự án đã đề xuất Ant Design và MOD-01 cần form/table/modal/pagination nhất quán. Nguồn: [Ant Design](https://ant.design/docs/react/introduce/).

**Alternatives considered**: UI tự viết tăng chi phí consistency/accessibility; Material UI đổi quyết định kiến trúc không có lý do; form framework riêng chỉ xem xét khi form phức tạp thực sự xuất hiện.

## 3. Routing và state

**Decision**: React Router declarative mode; guards cho anonymous/authenticated/forced-password/admin. TanStack Query quản lý server state; URL search params giữ filter/page; local state giữ dialog/form. Không Redux/Zustand.

**Rationale**: Route guard và deep-link cần router chuẩn. Query cung cấp loading/error/success, cancellation, invalidation và pagination; khi logout/401 phải cancel rồi remove private queries. Nguồn: [React Router](https://reactrouter.com/home), [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview).

**Alternatives considered**: Router tự viết và fetch trong `useEffect` làm tăng edge cases; Redux không có client-domain state đủ phức tạp; optimistic update mặc định bị loại cho quyền/tài khoản.

## 4. OpenAPI client

**Decision**: `openapi-typescript` sinh types từ OpenAPI 3.1; `openapi-fetch` là runtime client mỏng. Client luôn `credentials: "include"`; middleware lấy CSRF token memory-only và gắn `X-CSRF-Token` cho mutation.

**Rationale**: Tránh handwritten API interfaces và SDK runtime nặng; request/path/body/response được suy luận trực tiếp từ schema. Nguồn: [openapi-typescript](https://openapi-ts.dev/node), [openapi-fetch](https://openapi-ts.dev/openapi-fetch/).

**Alternatives considered**: Orval phù hợp nếu sau này cần generated query hooks nhưng hiện tạo nhiều artifact/config hơn; handwritten fetch/types bị loại vì drift.

## 5. Mock strategy

**Decision**: MSW là mock chính cho browser demo và test. Handlers dùng state store reset được và scenario override để tái hiện success, `401/403/404/409/412/422/429/503`, network error, forced password, ETag conflict và revoke.

**Rationale**: MSW intercept ở network boundary và tái dùng giữa browser/test. Nguồn: [MSW Documentation](https://mswjs.io/docs/), [MSW Best Practices](https://mswjs.io/guides/best-practices/).

**Alternatives considered**: Prism hữu ích cho schema smoke nhưng không đủ workflow stateful; JSON fixtures thuần không chứng minh request behavior. Mock cookie không chứng minh `HttpOnly`, `Secure`, `SameSite` hoặc server revocation thật.

## 6. Error architecture

**Decision**: Một typed adapter duy nhất chuyển RFC 9457 Problem thành UI action: `401` clear/relogin; `403` deny hoặc reauth theo code; `404` neutral concealment; `409` refresh/review; `412` refetch/reapply; `422` field summary; `429/503` honor `Retry-After`. 4xx/5xx typed response khác với network exception.

**Rationale**: Ngăn mỗi page diễn giải lỗi khác nhau và giữ yêu cầu không tiết lộ metadata. Nguồn: [RFC 9110](https://datatracker.ietf.org/doc/html/rfc9110), [RFC 6585](https://datatracker.ietf.org/doc/html/rfc6585).

**Alternatives considered**: Toast chung cho mọi lỗi bị loại vì không hỗ trợ recovery; auto-retry mutation và 401 bị loại.

## 7. Accessibility và interaction

**Decision**: WCAG 2.2 AA cho P1–P3; semantic table/form trước ARIA; visible labels, error summary + inline errors, live status, visible focus, no trap, modal focus containment/restoration. Phân biệt initial-empty, filtered-empty, loading và failure.

**Rationale**: Keyboard-only không đủ để chứng minh accessible names, status announcements, contrast và form-error semantics. Nguồn: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WAI Forms](https://www.w3.org/WAI/tutorials/forms/), [WAI Tables](https://www.w3.org/WAI/tutorials/tables/), [Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

**Alternatives considered**: Div-grid/virtualization bị loại cho dữ liệu demo nhỏ; toast-only validation và automated-only accessibility bị loại.

## 8. Testing và contract gates

**Decision**: Vitest + React Testing Library/user-event cho unit/component/integration; MSW cho network; Playwright cho P1–P3; axe automation cộng manual keyboard/screen-reader smoke. Redocly lint OpenAPI, regenerate types deterministically, fail khi generated artifact drift, rồi `tsc --noEmit`.

**Rationale**: Testing Library kiểm tra hành vi người dùng; Playwright kiểm tra browser/focus; automated accessibility chỉ bắt được một phần. Nguồn: [Vitest](https://vitest.dev/guide/), [Testing Library](https://testing-library.com/docs/react-testing-library/intro/), [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing), [Redocly CLI lint](https://redocly.com/docs/cli/commands/lint).

**Alternatives considered**: Jest trùng transform/config với Vite; snapshot-heavy không chứng minh behavior; E2E-only chậm và khó phủ mọi error branch.

## 9. Security boundary

**Decision**: CSRF token chỉ ở memory; password luôn được clear theo sensitive-flow policy; cookie không được JavaScript đọc; logout/401/password rotation xóa identity và private query cache. Safe return location chỉ là route nội bộ allowlist.

**Rationale**: Backend/session là authoritative; client timer, hidden button và mock state không phải security control. Nguồn: [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet), [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet).

**Alternatives considered**: localStorage/sessionStorage cho token/CSRF và client-side authorization bị loại.

