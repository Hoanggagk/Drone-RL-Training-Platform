# Feature Specification: Frontend Demo cho MOD-01 Identity & Access Management

**Feature Branch**: `frontend-mod01-demo`

**Created**: 2026-11-09

**Status**: Draft

**Input**: Thiết kế frontend demo riêng cho MOD-01 dựa trên hợp đồng API đã duyệt; dừng trước implementation.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Truy cập và quản lý phiên cá nhân (Priority: P1)

Là người dùng nền tảng, tôi muốn đăng nhập, nhận biết trạng thái tài khoản, hoàn tất đổi mật khẩu bắt buộc và đăng xuất để có thể truy cập an toàn vào khu vực được cấp quyền.

**Why this priority**: Đây là cửa vào bắt buộc cho mọi chức năng MOD-01 và là lát cắt demo nhỏ nhất có giá trị độc lập.

**Independent Test**: Có thể kiểm thử bằng một tài khoản active và một tài khoản buộc đổi mật khẩu, hoàn tất luồng đăng nhập → xem danh tính → đổi mật khẩu khi bắt buộc → đăng xuất mà không cần chức năng quản trị.

**Acceptance Scenarios**:

1. **Given** người dùng chưa xác thực, **When** nhập thông tin hợp lệ, **Then** giao diện chuyển tới trạng thái đã đăng nhập và hiển thị danh tính tối thiểu.
2. **Given** tài khoản có yêu cầu đổi mật khẩu, **When** đăng nhập thành công, **Then** người dùng chỉ có thể xem danh tính, đổi mật khẩu hoặc đăng xuất cho tới khi hoàn tất đổi mật khẩu.
3. **Given** thông tin đăng nhập sai hoặc tài khoản không khả dụng, **When** gửi yêu cầu, **Then** giao diện hiển thị thông báo chung không tiết lộ tài khoản có tồn tại.
4. **Given** phiên đã hết hạn hoặc bị thu hồi, **When** người dùng tiếp tục thao tác, **Then** giao diện yêu cầu đăng nhập lại và không giữ trạng thái đăng nhập giả.
5. **Given** người dùng đã đăng nhập, **When** đăng xuất, **Then** dữ liệu nhạy cảm trên giao diện được xóa và khu vực bảo vệ không còn truy cập được.

---

### User Story 2 - Quản lý vòng đời tài khoản (Priority: P2)

Là Platform Administrator, tôi muốn xem, tìm kiếm, tạo và thay đổi trạng thái tài khoản để quản lý người được phép sử dụng nền tảng.

**Why this priority**: Đây là năng lực quản trị cốt lõi của FR-003 nhưng chỉ có ý nghĩa sau khi luồng xác thực hoạt động.

**Independent Test**: Có thể kiểm thử bằng một Platform Administrator và dữ liệu tài khoản mẫu, bao gồm tạo tài khoản, tìm kiếm, xem chi tiết, khóa/mở/disable và thu hồi phiên.

**Acceptance Scenarios**:

1. **Given** Platform Administrator đã đăng nhập, **When** mở danh sách tài khoản, **Then** giao diện hiển thị trang dữ liệu có phân trang, bộ lọc trạng thái và tìm kiếm rõ ràng.
2. **Given** dữ liệu tạo tài khoản hợp lệ, **When** Administrator xác nhận, **Then** tài khoản mới xuất hiện với trạng thái và yêu cầu đổi mật khẩu ban đầu đúng contract.
3. **Given** một tài khoản đã thay đổi bởi phiên khác, **When** Administrator gửi cập nhật trên phiên bản cũ, **Then** giao diện báo xung đột và hướng dẫn tải lại thay vì ghi đè âm thầm.
4. **Given** Administrator khóa hoặc disable tài khoản, **When** thao tác thành công, **Then** trạng thái mới được phản ánh và có thể thu hồi các phiên của tài khoản đó.
5. **Given** người dùng không có quyền quản trị, **When** truy cập khu vực tài khoản, **Then** giao diện từ chối và không hiển thị dữ liệu quản trị.

---

### User Story 3 - Quản lý role và quyền truy cập (Priority: P3)

Là Platform Administrator, tôi muốn xem role catalog, quản lý Platform Administrator binding và project membership để cấp hoặc thu hồi quyền đúng phạm vi.

**Why this priority**: Hoàn thiện FR-002 và FR-004 sau khi account management đã sẵn sàng; phụ thuộc account và project scope đã tồn tại.

**Independent Test**: Có thể kiểm thử với các opaque project ID mẫu và account mẫu, không cần giao diện quản lý project; demo được xem role, gán/thu hồi global role và project membership.

**Acceptance Scenarios**:

1. **Given** Administrator mở role catalog, **When** dữ liệu tải thành công, **Then** giao diện phân biệt rõ role global và role theo project mà không cho sửa catalog.
2. **Given** Administrator vừa xác thực gần đây, **When** gán hoặc thu hồi Platform Administrator binding, **Then** kết quả được phản ánh rõ và không cho thu hồi Administrator active cuối cùng.
3. **Given** Administrator chọn account, project ID và project role hợp lệ, **When** tạo membership, **Then** binding mới xuất hiện mà không tạo hoặc sửa project.
4. **Given** membership active, **When** thu hồi, **Then** giao diện thể hiện trạng thái revoked và không xóa lịch sử khỏi góc nhìn người dùng.
5. **Given** binding trùng, scope không hợp lệ hoặc yêu cầu xác thực lại, **When** thao tác, **Then** giao diện giải thích hành động tiếp theo mà không lộ dữ liệu ngoài quyền.

---

### User Story 4 - Trình diễn đầy đủ trạng thái giao diện (Priority: P4)

Là người duyệt demo, tôi muốn quan sát các trạng thái loading, empty, success và lỗi tiêu biểu để đánh giá luồng UX trước khi kết nối backend thật.

**Why this priority**: Giúp duyệt UX và contract behavior sớm nhưng không chặn ba luồng nghiệp vụ chính.

**Independent Test**: Có thể chọn từng kịch bản dữ liệu và lỗi đã chuẩn bị, sau đó xác nhận màn hình không có trạng thái chết và luôn có hành động tiếp theo phù hợp.

**Acceptance Scenarios**:

1. **Given** dữ liệu đang tải, **When** người dùng chờ, **Then** giao diện hiển thị trạng thái tiến trình và ngăn gửi lặp thao tác mutation.
2. **Given** danh sách không có dữ liệu, **When** tải hoàn tất, **Then** giao diện hiển thị empty state phân biệt với lỗi tải.
3. **Given** service trả lỗi `401`, `403`, `404`, `409`, `412`, `422`, `429` hoặc `503`, **When** giao diện nhận lỗi, **Then** hiển thị thông điệp và hành động phục hồi phù hợp với từng nhóm lỗi.
4. **Given** người dùng thử lại sau lỗi có thể phục hồi, **When** yêu cầu thành công, **Then** thông báo lỗi cũ được xóa và dữ liệu đúng được hiển thị.

### Edge Cases

- Người dùng gửi form nhiều lần trong lúc request trước chưa hoàn tất.
- Phiên hết hạn giữa lúc người dùng đang điền form hoặc đang xem một danh sách phân trang.
- CSRF token không hợp lệ hoặc đã rotate sau đổi mật khẩu.
- Response thiếu trường bắt buộc hoặc không khớp contract; giao diện phải fail-safe và không hiển thị dữ liệu đoán.
- Trang hiện tại trở nên rỗng sau khi filter, revoke hoặc thay đổi trạng thái.
- `Retry-After` có hoặc không có trong lỗi rate-limit/service-unavailable.
- Account/membership đã thay đổi hoặc biến mất trước khi mutation hoàn tất.
- Người dùng mở URL quản trị trực tiếp nhưng không có quyền.
- Nội dung dài, tên người dùng dài và thông báo lỗi không làm vỡ bố cục.
- Chỉ sử dụng bàn phím vẫn hoàn thành được các luồng P1–P3.

## Requirements *(mandatory)*

### Functional Requirements

- **FE-FR-001**: Giao diện MUST hỗ trợ toàn bộ luồng tạo phiên, xem danh tính, lấy thông tin bảo vệ mutation, đổi mật khẩu và thu hồi phiên đã có trong contract MOD-01.
- **FE-FR-002**: Giao diện MUST ép người dùng có `must_change_password=true` vào luồng hạn chế cho tới khi đổi mật khẩu thành công.
- **FE-FR-003**: Giao diện MUST xóa trạng thái xác thực cục bộ và đưa người dùng về đăng nhập khi phiên hết hạn, bị thu hồi hoặc không còn hợp lệ.
- **FE-FR-004**: Giao diện MUST cung cấp danh sách, tìm kiếm, lọc, phân trang, tạo, xem và cập nhật trạng thái account đúng các operation được contract công bố.
- **FE-FR-005**: Giao diện MUST dùng precondition/version hiện hành khi cập nhật account và MUST không ghi đè âm thầm khi dữ liệu đã thay đổi.
- **FE-FR-006**: Giao diện MUST hỗ trợ thu hồi toàn bộ session của account theo quyền quản trị.
- **FE-FR-007**: Giao diện MUST hiển thị role catalog ở chế độ chỉ đọc và phân biệt role global với role project.
- **FE-FR-008**: Giao diện MUST hỗ trợ liệt kê, gán và thu hồi global `platform_admin` binding, bao gồm trạng thái cần xác thực lại và bảo vệ Administrator cuối cùng.
- **FE-FR-009**: Giao diện MUST hỗ trợ liệt kê, lọc, tạo, xem và thu hồi project membership bằng opaque `project_id`; MUST không cung cấp chức năng tạo, sửa hoặc xem nội dung project.
- **FE-FR-010**: Giao diện MUST kiểm soát khả năng nhìn thấy và kích hoạt thao tác quản trị theo identity context, nhưng MUST không xem kiểm soát phía client là cơ chế authorization thực sự.
- **FE-FR-011**: Mọi mutation MUST ngăn gửi lặp trong lúc đang xử lý và MUST sử dụng thông tin bảo vệ request theo contract.
- **FE-FR-012**: Giao diện MUST ánh xạ nhất quán các lỗi `401`, `403`, `404`, `409`, `412`, `422`, `429`, `503` thành thông báo không nhạy cảm và hành động phục hồi phù hợp.
- **FE-FR-013**: Mỗi danh sách và màn hình chi tiết MUST có trạng thái loading, empty, success và error phân biệt được.
- **FE-FR-014**: Demo MUST cho phép tái hiện có chủ đích các kịch bản thành công và lỗi cần nghiệm thu mà không phụ thuộc backend thật.
- **FE-FR-015**: Giao diện MUST không hiển thị, ghi nhớ lâu dài hoặc đưa vào thông báo lỗi password, session cookie, CSRF token hay secret khác.
- **FE-FR-016**: Các luồng P1–P3 MUST sử dụng được chỉ bằng bàn phím, có focus rõ, label có thể nhận biết và thông báo trạng thái có thể được công nghệ hỗ trợ đọc màn hình nhận biết.
- **FE-FR-017**: Demo MUST dùng thuật ngữ MOD-01 nhất quán: Account, Platform Administrator, Role, Global Role Binding, Project Membership và Session.
- **FE-FR-018**: Giao diện MUST hiển thị tiếng Việt rõ ràng; thuật ngữ kỹ thuật tiếng Anh được giữ khi giúp tránh nhập nhằng.

### Key Entities

- **Current Identity**: Danh tính đã xác thực, trạng thái bắt buộc đổi mật khẩu và global role cần để điều hướng giao diện.
- **Account View**: Thông tin account được phép hiển thị, trạng thái, version và thời điểm liên quan; không chứa credential hoặc hash.
- **Role Definition View**: Role catalog chỉ đọc, gồm code, phạm vi global/project và mô tả.
- **Global Role Binding View**: Quan hệ giữa account và role `platform_admin`, gồm trạng thái active/revoked.
- **Project Membership View**: Quan hệ giữa account, opaque project ID và project role, gồm trạng thái active/revoked.
- **Problem View**: Lỗi chuẩn hóa gồm loại, mã, trạng thái, correlation ID và lỗi trường khi có.
- **Demo Scenario**: Kịch bản dữ liệu/phản hồi có tên, điều kiện bắt đầu và kết quả mong đợi dùng để duyệt UX.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% operation công khai của MOD-01 trong contract ngày 2026-11-09 được ánh xạ tới ít nhất một màn hình hoặc hành động demo có thể quan sát.
- **SC-002**: Người dùng thử nghiệm hoàn thành luồng đăng nhập → đổi mật khẩu bắt buộc → đăng xuất trong không quá 2 phút mà không cần hướng dẫn ngoài giao diện.
- **SC-003**: Platform Administrator hoàn thành tạo account và thay đổi trạng thái account trong không quá 3 phút ở lần thử đầu tiên.
- **SC-004**: Platform Administrator hoàn thành gán và thu hồi một project membership trong không quá 3 phút mà không nhầm project membership với quản lý project.
- **SC-005**: 100% nhóm lỗi `401`, `403`, `404`, `409`, `412`, `422`, `429`, `503` có trạng thái demo và hành động tiếp theo được kiểm chứng.
- **SC-006**: 100% luồng P1–P3 hoàn thành được chỉ bằng bàn phím, không có focus trap và không có control bắt buộc thiếu tên nhận biết.
- **SC-007**: Không có password, cookie, CSRF token hoặc secret xuất hiện trong màn hình, lịch sử tương tác demo, thông báo lỗi hay dữ liệu mẫu có thể xem được.
- **SC-008**: Khi kiểm tra ở màn hình desktop phổ biến và chiều rộng tối thiểu 1024 px, không có nội dung nghiệp vụ bắt buộc bị che khuất hoặc không thể thao tác.
- **SC-009**: Mỗi user story P1–P4 có thể được trình diễn và nghiệm thu độc lập bằng kịch bản đã định nghĩa.

## Assumptions

- Đây là demo browser-first cho nhóm người dùng nhỏ local/LAN; không phải sản phẩm production hoàn chỉnh.
- Giao diện ưu tiên desktop và tablet ngang, hỗ trợ từ chiều rộng 1024 px; mobile phone nằm ngoài phạm vi demo đầu tiên.
- Ngôn ngữ giao diện là tiếng Việt; chưa xây dựng hệ thống đa ngôn ngữ.
- Hợp đồng `API_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/contracts/openapi.yaml` là nguồn sự thật cho request, response và error shape.
- Dữ liệu demo là giả lập, không dùng credential hoặc dữ liệu cá nhân thật.
- Role catalog không được sửa trong frontend; project chỉ được tham chiếu bằng ID có sẵn.
- Backend vẫn là nơi thực thi authentication và authorization thật; trạng thái demo không phải bằng chứng bảo mật.

## Scope Boundaries

### In Scope

- Authentication/session, forced password change, account administration, role catalog, global role binding và project membership của MOD-01.
- Loading, empty, success, error, retry, conflict và session-expired states.
- Kịch bản demo độc lập với backend thật.

### Out of Scope

- CRUD hoặc nội dung của project, experiment, run, model/checkpoint, simulator, training, evaluation, metrics, export và audit-log viewer.
- Backend authentication/authorization, database, email invitation, forgot-password, MFA, SSO/OIDC và custom role/policy editor.
- Mobile-phone layout, multi-tenant UI, class/group management và design system toàn nền tảng.

