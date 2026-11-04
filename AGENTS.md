# AGENTS.md

Hướng dẫn này áp dụng cho toàn bộ repository `Drone-RL-Training-Platform`.

## 1. Bối cảnh dự án

Đây là nền tảng Web hỗ trợ cấu hình, thực thi, giám sát và đánh giá các thí nghiệm Reinforcement Learning cho drone. Dự án hiện ở giai đoạn phân tích và thiết kế; chưa có mã nguồn triển khai. Không xem một công nghệ, API, schema hoặc cấu trúc thư mục là đã được chốt nếu tài liệu chỉ mô tả nó là đề xuất, TBD hoặc câu hỏi mở.

Phạm vi MVP ưu tiên:

- Một luồng đầu-cuối cho task Hovering hoặc Position Control.
- PPO là thuật toán đầu tiên; SAC và TD3 là phần mở rộng.
- Project AirSim và Gym-PyBullet-Drones được tích hợp qua adapter độc lập, sau technical spike.
- Training và evaluation là hai luồng riêng; evaluation không cập nhật trọng số policy.
- Mỗi run phải truy vết được config snapshot, seed, phiên bản runtime, metrics và artifact.

Ngoài MVP nếu chưa được phê duyệt rõ ràng: multi-agent RL, distributed training, điều khiển drone thật, Sim-to-Real, PX4 SITL/HITL, raw video/sensor dung lượng lớn và automatic hyperparameter tuning quy mô lớn.

## 2. Nguồn sự thật và thứ tự đọc

Trước khi thay đổi phạm vi, kiến trúc hoặc thiết kế module, đọc các tài liệu theo thứ tự:

1. `PROJECT_INITIATION.md` — mục tiêu, phạm vi và rủi ro dự án.
2. `REQUIREMENTS_ANALYSIS.md` — BR/BRL, FR/NFR, use case và acceptance criteria.
3. `SYSTEM_ARCHITECTURE.md` — kiến trúc, ADR, luồng dữ liệu và deployment.
4. `Module_design/MODULE_DESIGN.md` — danh mục và ranh giới module.

Khi tài liệu mâu thuẫn, không tự âm thầm chọn một phương án. Nêu rõ mâu thuẫn, ưu tiên quyết định được phê duyệt mới hơn và cập nhật các tài liệu liên quan để duy trì khả năng truy vết. Giữ nguyên các mã `OBJ-*`, `BR-*`, `BRL-*`, `FR-*`, `NFR-*`, `AC-*`, `ADR-*` và `MOD-*` khi tham chiếu.

## 3. Sử dụng CodeGraph

Repository đã được khởi tạo CodeGraph trong `.codegraph/`. Khi cần tìm hoặc hiểu mã nguồn:

1. Kiểm tra có thư mục `.codegraph/` ở root.
2. Dùng CodeGraph trước khi dùng `rg`, `find` hoặc đọc hàng loạt file:
   - MCP: `codegraph_explore` nếu khả dụng.
   - CLI: `codegraph explore "<symbol hoặc câu hỏi>"`.
3. Dùng `codegraph node`, `callers`, `callees`, `impact` hoặc `context` cho truy vấn chuyên biệt.
4. Chỉ dùng `rg`/đọc file trực tiếp khi CodeGraph không có kết quả, không hỗ trợ loại file hoặc cần kiểm tra nội dung phi mã nguồn.
5. Sau khi thêm hoặc sửa mã nguồn, chạy `codegraph sync .`; dùng `codegraph status .` để kiểm tra chỉ mục.

Hiện CodeGraph không lập chỉ mục Markdown, vì vậy dùng công cụ đọc file trực tiếp cho các tài liệu thiết kế cho đến khi mã nguồn được thêm vào.

## 4. Ràng buộc kiến trúc

- Backend là modular monolith bằng FastAPI; giữ ranh giới module rõ ràng và tránh phụ thuộc vòng.
- Không chạy training/evaluation dài hạn trong HTTP request hoặc process FastAPI. Dispatcher và Worker Supervisor quản lý child process riêng.
- RL Core chỉ làm việc qua Gymnasium Task Environment, không gọi simulator API trực tiếp.
- Task Environment định nghĩa task, observation/action, reward, termination và task metrics.
- Mỗi simulator có adapter riêng. Không giả định AirSim và PyBullet có cùng hệ tọa độ, đơn vị, timestep, dynamics hoặc action/observation space.
- Giữ đúng semantics Gymnasium: phân biệt `terminated` và `truncated`; định nghĩa rõ `reset`, `step` và `close`.
- PostgreSQL là nguồn trạng thái chuẩn cho metadata, config snapshot và run/job state trong MVP. Không thêm Redis/Celery nếu chưa có benchmark hoặc yêu cầu được phê duyệt.
- Model, checkpoint, log, trajectory và export thuộc Artifact Storage; database chỉ giữ metadata, reference, checksum và trạng thái.
- Checkpoint phải theo luồng staging → verify → atomic commit → đánh dấu available.
- Frontend React/TypeScript chỉ xử lý presentation và tương tác API; không đặt logic RL hoặc simulator trong frontend.
- Có thể tách Python environment/lockfile theo simulator để tránh xung đột dependency.

## 5. Quy tắc triển khai

- Ưu tiên lát cắt MVP nhỏ nhất có thể kiểm chứng đầu-cuối; không triển khai trước các extension point chưa cần thiết.
- Không hard-code logic PPO rải rác trong UI hoặc backend; đăng ký algorithm qua registry/config contract.
- Không hard-code simulator vào task hoặc RL Core; sử dụng adapter contract và registry.
- Mọi run dùng config snapshot bất biến. Không để thay đổi experiment sau đó làm đổi ý nghĩa của run cũ.
- Lưu seed, phiên bản Python/library/simulator, algorithm version và thông tin runtime cần thiết cho tái lập.
- Worker ghi metrics theo batch/chu kỳ; UI đọc dữ liệu đã lưu, không truy vấn simulator trong mỗi lần refresh.
- Không ghi secret, token hoặc credential vào log, artifact, fixture hay repository.
- Không cho thực thi Python tùy ý do người dùng cung cấp trong MVP. Tính năng custom code chỉ được thêm sau khi có thiết kế sandbox và resource limits.
- Validate dữ liệu tại boundary; lỗi phải chỉ rõ tầng phát sinh: API, dispatcher, worker, task, adapter, simulator hoặc storage.
- Giữ thay đổi tập trung; không refactor module không liên quan nếu không cần cho yêu cầu hiện tại.

## 6. Kiểm thử và tiêu chí hoàn thành

Mỗi thay đổi mã nguồn phải có kiểm thử tương ứng ở mức phù hợp:

- Unit test cho business rule, validation, state transition và mapping thuần.
- Contract test cho algorithm, task và simulator adapter registry.
- Adapter integration test cho `reset/step/close`, shape/dtype/range, hệ tọa độ, đơn vị, timestep, `terminated/truncated` và cleanup.
- Worker test cho atomic claim, heartbeat, stop, timeout, crash reconciliation và không để process mồ côi.
- Artifact test cho partial write, checksum, atomic commit và metadata lineage.
- Evaluation test phải chứng minh policy weights không thay đổi.
- End-to-end test phải bao phủ cấu hình → queued run → training → metrics/checkpoint → evaluation → export trong phạm vi MVP.

Trước khi hoàn tất một thay đổi:

1. Chạy formatter, linter, type checker và test suite của thành phần đã sửa theo cấu hình thực tế trong repository.
2. Không bịa lệnh build/test khi dự án chưa có toolchain; ghi rõ phần nào chưa thể chạy.
3. Chạy `codegraph sync .` sau thay đổi mã nguồn.
4. Kiểm tra tài liệu và mã định danh yêu cầu liên quan đã được cập nhật.
5. Tóm tắt file đã đổi, kiểm thử đã chạy, kết quả và rủi ro/TBD còn lại.

## 7. Quy tắc tài liệu

- Viết tài liệu dự án bằng tiếng Việt rõ ràng; giữ thuật ngữ kỹ thuật tiếng Anh khi giúp tránh nhập nhằng.
- File phải dùng UTF-8 và không làm hỏng dấu tiếng Việt.
- Phân biệt rõ: quyết định đã duyệt, đề xuất, giả định, TBD và nội dung ngoài phạm vi.
- Thay đổi kiến trúc đáng kể phải bổ sung/cập nhật ADR và trace tới FR/NFR/AC liên quan.
- Mermaid diagram phải đồng bộ với mô tả và ranh giới module, không chỉ mang tính minh họa.
- Không tuyên bố một simulator, algorithm hoặc task “được hỗ trợ” nếu chưa có contract/integration test tương ứng.

## 8. An toàn với simulator và tiến trình

- Mặc định một run sở hữu độc quyền một simulator runtime/world cho đến khi technical spike chứng minh chia sẻ an toàn.
- Mọi đường dừng phải ưu tiên cooperative cancellation, sau đó timeout và supervisor cleanup.
- Luôn đóng connection/process/file handle trong cả luồng thành công và lỗi.
- Không thực hiện thao tác với drone thật hoặc phần cứng bay nếu yêu cầu chỉ thuộc phạm vi simulator.
- Các thay đổi ảnh hưởng điều khiển, hệ tọa độ, unit conversion, timing hoặc reward cần test định lượng và review riêng.
