# Đặc tả feature: API cho MOD-01 Identity & Access Management

**Module**: `MOD-01`  
**Trạng thái**: Kế hoạch thiết kế, chờ rà soát  
**Phạm vi**: Chỉ Identity & Access Management

## 1. Mục tiêu

Thiết kế hợp đồng API và hợp đồng nội bộ cho MOD-01 nhằm xác thực actor, quản lý vòng đời phiên/tài khoản, gán role theo project scope và cung cấp quyết định authorization nhất quán cho Backend Modular Monolith.

Thiết kế phải truy vết tới `FR-001`–`FR-004`, `NFR-010`–`NFR-012` và `AC-016`; tuân thủ các rule `IAM-R01`–`IAM-R05` trong đặc tả module.

## 2. Ranh giới bắt buộc

### 2.1. Trong phạm vi

- Đăng nhập, lấy identity hiện tại, đăng xuất và thu hồi phiên.
- Tạo, xem, cập nhật trạng thái tài khoản bởi Platform Administrator.
- Liệt kê role catalog được hệ thống hỗ trợ.
- Gán, xem và thu hồi global role binding hoặc project membership/role binding.
- Hợp đồng nội bộ `authorize(actor, action, resource_context)` cho các module Backend.
- Phát security/audit event đã loại bỏ credential, token và dữ liệu nhạy cảm.
- Chuẩn hóa lỗi authentication, authorization, validation và conflict.

### 2.2. Ngoài phạm vi

- CRUD project, experiment, run, model/checkpoint hoặc artifact.
- API nghiệp vụ training, evaluation, metrics, simulator hoặc export.
- Lưu trữ và truy vấn audit log dài hạn của `MOD-17`.
- Thiết kế bảng/kho dữ liệu dùng chung của `MOD-16` ngoài mô hình logic MOD-01.
- Secret store, simulator credential và cấu hình simulator.
- Custom role/policy editor, multi-tenant IAM, SSO/OIDC federation, MFA và quản lý lớp/nhóm trong lát cắt đầu tiên.
- Quyết định quyền nghiệp vụ thay cho module sở hữu object; module sở hữu object cung cấp project/object context cho MOD-01.

## 3. Giả định lập kế hoạch

- MVP phục vụ nhóm người dùng nhỏ trên local/LAN theo `ASM-003`, `A-01`, `Q-003` và `Q-013` đang mở.
- Có Platform Administrator tối thiểu để bootstrap và thực hiện `FR-002`/`FR-003`; việc đưa đầy đủ UI quản trị vào MVP vẫn cần Product Owner xác nhận theo `Q-014`.
- Một người dùng có thể có nhiều role binding ở các project khác nhau.
- Project là aggregate do `MOD-02` sở hữu. MOD-01 chỉ lưu/nhận `project_id` như opaque scope identifier và không cung cấp project API.
- PostgreSQL là nguồn trạng thái chuẩn; không thêm Redis/Celery cho session hay authorization ở giai đoạn này.

## 4. User stories và tiêu chí chấp nhận

### US-01 — Xác thực và kết thúc phiên

Là người dùng đã được cấp tài khoản, tôi muốn đăng nhập và đăng xuất để sử dụng chức năng được bảo vệ trong đúng danh tính của mình.

**Acceptance scenarios**:

1. Credential hợp lệ và tài khoản active tạo một phiên hợp lệ, trả identity tối thiểu và không trả password hash/token bí mật trong body.
2. Credential sai, tài khoản không tồn tại hoặc tài khoản bị khóa đều bị từ chối bằng thông báo không hỗ trợ account enumeration.
3. Phiên hết hạn hoặc đã thu hồi không truy cập được endpoint bảo vệ.
4. Đăng xuất thu hồi phiên hiện tại và thao tác lặp lại an toàn.

### US-02 — Quản lý tài khoản

Là Platform Administrator, tôi muốn tạo tài khoản và thay đổi trạng thái tài khoản để kiểm soát ai được truy cập nền tảng.

**Acceptance scenarios**:

1. Admin tạo được tài khoản với định danh đăng nhập duy nhất và trạng thái hợp lệ; account phải đổi initial password trước khi dùng chức năng khác ngoài đọc identity/CSRF, đổi password và đăng xuất.
2. Actor không có quyền quản trị không xem danh sách hoặc thay đổi tài khoản.
3. Khóa tài khoản làm mất hiệu lực truy cập theo chính sách thu hồi phiên đã công bố.
4. Cập nhật đồng thời dùng version/precondition để không âm thầm ghi đè thay đổi.

### US-03 — Gán quyền theo project

Là Platform Administrator, tôi muốn gán hoặc thu hồi role của người dùng trong một project để cấp đúng phạm vi công việc.

**Acceptance scenarios**:

1. Binding chỉ được tạo khi account, role và project scope hợp lệ.
2. Cùng một binding logic không bị tạo trùng; request lặp cho kết quả ổn định hoặc conflict chuẩn hóa.
3. Thu hồi binding có hiệu lực với quyết định authorization tiếp theo theo chính sách đã công bố.
4. Admin không mặc nhiên có quyền sửa nội dung khoa học của project nếu không có binding nghiệp vụ tương ứng.

### US-04 — Kiểm tra quyền tập trung

Là module nghiệp vụ trong Backend, tôi muốn yêu cầu MOD-01 kiểm tra `actor + action + resource context` để mọi thao tác được bảo vệ nhất quán.

**Acceptance scenarios**:

1. Thiếu actor, action, project scope hoặc policy cần thiết luôn cho kết quả deny (`IAM-R01`).
2. Object con chỉ được phép khi actor có action phù hợp trong project cha (`IAM-R02`).
3. Quyết định deny không tiết lộ object có tồn tại hay metadata ngoài quyền (`AC-016`).
4. Mọi thay đổi quyền và security event bắt buộc phát event không chứa credential/session secret.

## 5. Yêu cầu chức năng

| ID | Yêu cầu |
|---|---|
| API-IAM-001 | Cung cấp endpoint tạo và thu hồi phiên, cùng endpoint đọc identity hiện tại. |
| API-IAM-002 | Cung cấp endpoint quản trị để tạo, liệt kê, xem và thay đổi trạng thái tài khoản; không thiết kế hard delete trong lát cắt đầu tiên. |
| API-IAM-003 | Cung cấp role catalog chỉ đọc và endpoint quản lý project membership/role binding. |
| API-IAM-003A | Cung cấp endpoint quản lý global `platform_admin` binding; cấm thu hồi Platform Administrator active cuối cùng và yêu cầu recent authentication. |
| API-IAM-004 | Mọi endpoint quản trị yêu cầu authorization tại Backend; Frontend ẩn/hiện control không thay thế kiểm tra quyền. |
| API-IAM-005 | Hợp đồng nội bộ authorization nhận actor, action, resource type/id và project scope; trả allow/deny cùng reason code ổn định, không nhạy cảm. |
| API-IAM-006 | Account, role binding và session có trạng thái/vòng đời rõ ràng; transition không hợp lệ bị từ chối. |
| API-IAM-007 | Các mutation hỗ trợ chống lost update và có correlation/request ID để truy vết. |
| API-IAM-008 | Thay đổi account, membership, login/logout/revocation và deny quan trọng phát audit event theo `IAM-R05`; MOD-01 không lưu audit log dài hạn. |
| API-IAM-009 | Danh sách có pagination giới hạn, filter allowlist và sort ổn định. |
| API-IAM-010 | Error envelope nhất quán cho authentication, authorization, validation, conflict, rate limit và dependency failure. |

## 6. Yêu cầu chất lượng và bảo mật

| ID | Yêu cầu |
|---|---|
| API-IAM-NFR-001 | Deny by default và least privilege; test chéo project/object. |
| API-IAM-NFR-002 | Password chỉ lưu dưới dạng password hash thích hợp; session identifier/token không lưu hoặc ghi log dạng rõ. |
| API-IAM-NFR-003 | Browser session dùng cookie `HttpOnly`, `Secure` trong môi trường HTTPS và `SameSite` phù hợp; mutation có bảo vệ CSRF. |
| API-IAM-NFR-004 | Login có throttling/rate limit và phản hồi tránh account enumeration; ngưỡng cụ thể là cấu hình vận hành. |
| API-IAM-NFR-005 | Response và audit event được allowlist/redact; không lộ credential, password hash, session secret hoặc simulator secret (`NFR-011`). |
| API-IAM-NFR-006 | Authorization chạy trong process modular monolith, không tạo network hop mới; mục tiêu latency định lượng chốt sau benchmark. |
| API-IAM-NFR-007 | OpenAPI mô tả security scheme, error response và ví dụ nhưng không chứa secret thật. |
| API-IAM-NFR-008 | Contract, unit, integration và security tests bao phủ `FR-001`–`FR-004`, `NFR-010`–`NFR-012`, `AC-016`. |

## 7. Đầu ra của giai đoạn kế hoạch

- `plan.md`: technical context, gate và cấu trúc triển khai đề xuất.
- `research.md`: quyết định kỹ thuật và các phương án đã cân nhắc.
- `data-model.md`: mô hình logic chỉ cho entity MOD-01.
- `contracts/openapi.yaml`: REST contract công khai của MOD-01.
- `contracts/internal-authorization.md`: hợp đồng nội bộ authorization và audit event boundary.
- `quickstart.md`: kịch bản xác minh contract, không chứa implementation code.

