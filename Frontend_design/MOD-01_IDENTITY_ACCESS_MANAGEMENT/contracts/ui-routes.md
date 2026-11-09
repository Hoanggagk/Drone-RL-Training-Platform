# UI Route & Guard Contract — MOD-01

## 1. Route map

| Route | Audience | Required state | Primary operations |
|---|---|---|---|
| `/login` | Anonymous | `anonymous` | `createAuthSession` |
| `/change-password` | Authenticated | `forced_password_change` hoặc voluntary change | `issueCsrfToken`, `changeCurrentPassword`, `revokeCurrentSession` |
| `/iam` | Authenticated | `authenticated` | `getCurrentIdentity` |
| `/iam/accounts` | Platform Administrator | `authenticated + platform_admin` | `listAccounts`, `createAccount` |
| `/iam/accounts/:accountId` | Platform Administrator | `authenticated + platform_admin` | `getAccount`, `updateAccount`, `revokeAccountSessions` |
| `/iam/roles` | Platform Administrator | `authenticated + platform_admin` | `listRoleDefinitions`, `listGlobalRoleBindings`, `createGlobalRoleBinding`, `revokeGlobalRoleBinding` |
| `/iam/memberships` | Platform Administrator | `authenticated + platform_admin` | `listProjectMemberships`, `createProjectMembership`, `getProjectMembership`, `revokeProjectMembership` |
| `/forbidden` | Authenticated | any authenticated | none |
| `/not-found` | Any | any | none |

Không có route cho project, experiment, run, simulator, training, evaluation hoặc audit log.

## 2. Guard precedence

1. Bootstrap identity khi auth state `unknown`; không render protected children.
2. Nếu anonymous, chỉ allow `/login`; protected route lưu safe internal return path rồi redirect login.
3. Nếu `must_change_password=true`, chỉ allow `/change-password`, identity/CSRF bootstrap và logout; route khác redirect change-password.
4. Nếu authenticated nhưng thiếu `platform_admin`, admin routes chuyển `/forbidden`.
5. Client guard chỉ cải thiện UX; mọi request vẫn gửi tới Backend/mocked contract và Backend là authorization authority.

## 3. Navigation contract

- Logout luôn keyboard-reachable trên authenticated layout.
- Không hiển thị link module khác trong feature demo.
- Deep-link được giữ sau login chỉ khi route nằm trong allowlist trên.
- Sau 401: cancel/remove private queries, clear identity/CSRF, redirect `/login`, hiển thị thông báo phiên hết hạn/thu hồi.
- Sau password change: nhận rotated session + CSRF context trước khi chuyển `/iam`.
- Recent-auth-required: chuyển login/reauth flow với safe intended action; không tự replay mutation nhạy cảm.

## 4. Form and table interaction contract

- Mọi form control có visible label; required state thể hiện bằng text và semantics.
- 422 hiển thị error summary liên kết tới field và inline error; focus summary/field đầu tiên.
- Password bị clear sau sensitive failure phù hợp; non-secret input được giữ khi an toàn.
- Table dùng semantic headers/caption, row action có accessible name duy nhất.
- Loading, initial-empty, filtered-empty, refreshing, failure là trạng thái khác nhau.
- Confirmation dialog nêu object/action, focus ban đầu ở safe action, hỗ trợ Escape, giữ focus trong modal và trả focus về trigger.

## 5. Responsive and accessibility contract

- Baseline width: 1024 px trở lên; không có required action bị clip.
- P1–P3 hoàn thành keyboard-only, không focus trap.
- Status/success/error async được announce bằng status/live region nhưng không tự cướp focus trừ validation/blocking dialog.
- Automated accessibility scan không thay thế manual keyboard và screen-reader smoke test.

