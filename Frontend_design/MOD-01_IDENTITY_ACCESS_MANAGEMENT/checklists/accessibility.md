# Accessibility evidence — MOD-01 frontend demo

Ngày kiểm tra: 2026-11-09. Baseline: Chromium 158 (Playwright), viewport 1024 × 768, giao diện tiếng Việt.

## Automated evidence

- [x] Login hoàn thành bằng keyboard.
- [x] Logout keyboard-reachable và hoàn thành bằng Enter.
- [x] Navigation Accounts → Roles → Memberships bằng keyboard/link semantics.
- [x] Required action không bị clip ở viewport 1024 px.
- [x] Axe không có finding trên login, change password, accounts, roles và memberships.
- [x] Form control có visible label; table dùng header semantics; dialog/form có accessible name.
- [x] Error state dùng live `alert`, correlation ID và retry action khi phù hợp.

Evidence: `npm run test:e2e` — 14/14 passed, gồm forced-password/session-expiry, dialog/error axe, focus return, `auth.spec.ts`, `access.spec.ts`, `accounts.spec.ts`, `responsive.spec.ts`, `accessibility.spec.ts`.

## Manual checks

- [x] Focus indicator và thứ tự Tab được quan sát bằng Playwright keyboard journey trên Chromium.
- [x] Focus không mắc kẹt ở navigation hoặc form trong các journey đã chạy.
- [ ] Screen-reader smoke bằng NVDA/JAWS/VoiceOver trên máy thật chưa được thực hiện trong môi trường CLI này.
- [ ] Manual two-view ETag exercise và modal focus-return cần người duyệt xác nhận trong buổi demo.

Không đánh dấu hai mục cuối là đã duyệt. Automated axe/keyboard không thay thế kiểm tra screen reader thủ công.
