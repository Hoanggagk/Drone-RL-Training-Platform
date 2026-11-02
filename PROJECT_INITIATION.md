# TÀI LIỆU KHỞI TẠO DỰ ÁN

## Drone RL Training Platform

| Thuộc tính | Nội dung |
|---|---|
| Tên dự án | Drone RL Training Platform |
| Loại dự án | Phát triển nền tảng phần mềm Web hỗ trợ nghiên cứu và huấn luyện drone bằng Reinforcement Learning (RL) |
| Phiên bản tài liệu | 1.0 – Bản khởi tạo |
| Ngày lập | 02/11/2026 |
| Trạng thái | Dự thảo khởi tạo – cần xác nhận các giả định và tiêu chí nghiệm thu |
| Đối tượng sử dụng chính | Nhà nghiên cứu, giảng viên, học viên và người phát triển hệ thống điều khiển drone |

> **Lưu ý về phạm vi:** Tài liệu này xác định lý do, mục tiêu, phạm vi ban đầu và tính khả thi của dự án. Đây chưa phải tài liệu đặc tả yêu cầu chi tiết (SRS), thiết kế kiến trúc chi tiết hay thiết kế cơ sở dữ liệu/API.

---

# 1. Tổng quan dự án

## 1.1. Giới thiệu

Drone RL Training Platform là nền tảng Web được đề xuất nhằm hỗ trợ người dùng thiết lập, tổ chức, thực thi, giám sát và đánh giá các thí nghiệm huấn luyện drone bằng phương pháp học tăng cường (Reinforcement Learning – RL).

Nền tảng hướng tới việc cung cấp một điểm truy cập thống nhất cho quy trình thực nghiệm, từ lựa chọn môi trường mô phỏng, cấu hình nhiệm vụ bay và thuật toán RL đến theo dõi quá trình huấn luyện, lưu trữ mô hình và xem xét kết quả đánh giá.

Hai môi trường mô phỏng dự kiến được tích hợp:

- **Project AirSim:** môi trường mô phỏng hệ thống tự hành, có thể sử dụng cùng Unreal Engine khi cần thế giới 3D, hình học môi trường và cảm biến được kết xuất.
- **Gym-PyBullet-Drones:** thư viện môi trường drone dựa trên PyBullet, cung cấp giao diện Gymnasium và ví dụ huấn luyện PPO với Stable-Baselines3.

Trong tài liệu này, thuật ngữ “Gym-Bullet” được hiểu là **Gym-PyBullet-Drones**. Tên thư viện và phiên bản cụ thể cần được xác nhận khi khảo sát kỹ thuật. Nếu chủ dự án đang đề cập đến một gói Gym/PyBullet khác, phạm vi tích hợp phải được cập nhật tương ứng.

## 1.2. Định hướng sản phẩm

Sản phẩm được định hướng là **nền tảng quản lý thí nghiệm và huấn luyện RL cho drone**, không chỉ là một trang Web hiển thị biểu đồ hoặc một giao diện điều khiển simulator.

Các năng lực chính dự kiến gồm:

1. Quản lý và kiểm tra kết nối với các môi trường mô phỏng được hỗ trợ.
2. Lựa chọn cấu hình drone, nhiệm vụ và các điều kiện mô phỏng.
3. Cấu hình thuật toán RL và tham số huấn luyện.
4. Khởi chạy, theo dõi, dừng và tiếp tục các phiên huấn luyện theo khả năng của bộ máy huấn luyện.
5. Theo dõi các chỉ số như Reward, Success Rate, Position Error và Training Loss.
6. Lưu trữ cấu hình, log, checkpoint và mô hình đã huấn luyện.
7. Đánh giá, trực quan hóa và so sánh kết quả thực nghiệm.

## 1.3. Giá trị dự kiến

- Giảm thao tác lặp lại khi chuyển đổi giữa công cụ mô phỏng, mã nguồn huấn luyện và công cụ phân tích kết quả.
- Tăng khả năng tái lập thí nghiệm nhờ lưu lại cấu hình, phiên bản phần mềm, seed và checkpoint.
- Hỗ trợ so sánh có hệ thống giữa thuật toán, cấu hình huấn luyện và môi trường mô phỏng.
- Tạo nền tảng có thể mở rộng để bổ sung nhiệm vụ bay, thuật toán và simulator mới.

---

# 2. Bối cảnh và thực trạng

## 2.1. Bối cảnh

Nghiên cứu điều khiển drone bằng RL thường liên quan đến nhiều thành phần kỹ thuật: mô hình động lực học, môi trường mô phỏng, định nghĩa trạng thái quan sát (observation), không gian hành động (action), hàm thưởng (reward), thuật toán học, quy trình huấn luyện và phương pháp đánh giá.

Các thành phần này có thể được phát triển bằng những thư viện hoặc công cụ khác nhau. Ví dụ, người nghiên cứu có thể sử dụng một môi trường để kiểm thử thuật toán nhanh, sau đó dùng môi trường 3D có cảm biến và bối cảnh phong phú hơn để đánh giá hành vi bay. Việc kết hợp nhiều môi trường làm tăng nhu cầu chuẩn hóa giao diện, đơn vị đo, hệ tọa độ, tần số mô phỏng và cách ghi nhận kết quả.

## 2.2. Khó khăn cần khảo sát và xác nhận

Các vấn đề dưới đây là **giả thuyết vấn đề ban đầu** rút ra từ đặc điểm quy trình nghiên cứu. Chúng cần được xác nhận qua phỏng vấn người dùng hoặc khảo sát quy trình hiện tại, không mặc nhiên xem là thực trạng của mọi nhóm nghiên cứu.

| Nhóm vấn đề | Khó khăn có thể gặp | Tác động dự kiến |
|---|---|---|
| Công cụ phân tán | Cấu hình simulator, chạy thuật toán, ghi log và vẽ biểu đồ được thực hiện qua nhiều chương trình hoặc terminal khác nhau | Tăng thao tác thủ công và khó theo dõi toàn bộ quy trình |
| Tích hợp simulator | Mỗi simulator có API, mô hình vật lý, hệ tọa độ, đơn vị và cách điều khiển riêng | Tốn công viết lớp chuyển đổi; dễ phát sinh lỗi tích hợp |
| Cấu hình thí nghiệm | Tham số thuật toán, reward, môi trường và điều kiện ban đầu có thể được lưu ở nhiều tệp khác nhau | Khó xác định chính xác cấu hình tạo ra một kết quả |
| Giám sát huấn luyện | Log và biểu đồ có thể nằm ở nhiều công cụ | Khó theo dõi trạng thái và phát hiện phiên chạy bất thường |
| Quản lý mô hình | Checkpoint và mô hình có thể được lưu theo quy ước khác nhau giữa các lần chạy | Khó tìm, phục hồi và tái sử dụng mô hình |
| Đánh giá kết quả | Quy trình đánh giá có thể chưa tách biệt rõ với dữ liệu huấn luyện | Có nguy cơ đánh giá chưa khách quan hoặc khó tái lập |
| So sánh thí nghiệm | Các thí nghiệm có thể không dùng cùng điều kiện, seed hoặc tiêu chí đánh giá | Kết luận so sánh thuật toán có thể thiếu cơ sở |
| Khả năng mở rộng | Mỗi nhiệm vụ hoặc simulator mới có thể cần sửa nhiều phần của chương trình | Tăng chi phí bảo trì và mở rộng |

## 2.3. Nhu cầu của người dùng

Người dùng mục tiêu có các nhu cầu dự kiến sau:

- Tạo một dự án nghiên cứu và quản lý các thí nghiệm liên quan.
- Chọn simulator và kiểm tra simulator có sẵn sàng hoạt động hay không.
- Chọn nhiệm vụ bay như Hovering, Position Control hoặc Trajectory Tracking.
- Thiết lập observation, action, reward và điều kiện kết thúc episode.
- Chọn thuật toán như PPO, SAC hoặc TD3 và cấu hình tham số tương ứng.
- Khởi chạy và theo dõi trạng thái huấn luyện mà không phải liên tục kiểm tra nhiều cửa sổ terminal.
- Theo dõi tiến trình và chỉ số huấn luyện theo thời gian.
- Lưu cấu hình, log, checkpoint và kết quả đánh giá theo từng experiment.
- Chạy đánh giá độc lập và so sánh các mô hình theo bộ tiêu chí thống nhất.
- Xuất dữ liệu để tiếp tục phân tích bằng Python, MATLAB hoặc công cụ khoa học khác.

## 2.4. Phát biểu vấn đề (Problem Statement)

Quy trình nghiên cứu và huấn luyện drone bằng Reinforcement Learning có thể phải sử dụng đồng thời nhiều môi trường mô phỏng, thư viện thuật toán và công cụ phân tích riêng biệt. Sự khác nhau về giao diện kết nối, cấu hình mô phỏng, dữ liệu quan sát, hành động và cách lưu kết quả khiến việc tổ chức, giám sát, tái lập và so sánh các thí nghiệm trở nên phức tạp.

Do đó, cần xây dựng một nền tảng thống nhất giúp người nghiên cứu cấu hình và quản lý các thí nghiệm RL cho drone, kết nối với các simulator được hỗ trợ, theo dõi quá trình huấn luyện, lưu trữ mô hình và đánh giá kết quả theo quy trình có thể kiểm tra và tái lập.

---

# 3. Đối tượng sử dụng và nhu cầu

## 3.1. Nhóm người dùng chính

| Nhóm người dùng | Mục đích sử dụng | Nhu cầu trọng tâm |
|---|---|---|
| Nhà nghiên cứu | Thiết kế và thực hiện thí nghiệm RL cho drone | Cấu hình linh hoạt, tái lập thí nghiệm, so sánh mô hình và xuất dữ liệu |
| Giảng viên | Tổ chức nghiên cứu hoặc hướng dẫn thực hành | Quản lý bài toán, cấu hình mẫu, theo dõi kết quả và hỗ trợ người học |
| Học viên/sinh viên | Học và thử nghiệm thuật toán điều khiển drone | Giao diện dễ sử dụng, cấu hình có hướng dẫn, xem trực quan kết quả |
| Nhà phát triển thuật toán | Phát triển hoặc tích hợp thuật toán, reward và môi trường mới | Khả năng mở rộng, giao diện tích hợp rõ ràng và log phục vụ debug |

## 3.2. Nhu cầu ưu tiên

1. **Tính nhất quán:** cùng một quy trình quản lý thí nghiệm dù sử dụng simulator nào.
2. **Tính tái lập:** lưu đủ cấu hình, seed, phiên bản phần mềm và thông tin môi trường để có thể chạy lại thí nghiệm.
3. **Khả năng quan sát:** theo dõi trạng thái công việc và các chỉ số quan trọng.
4. **Khả năng đánh giá:** đánh giá mô hình trên các episode/kịch bản riêng với tập điều kiện đã xác định.
5. **Khả năng mở rộng:** bổ sung simulator, thuật toán và nhiệm vụ mà không phải thiết kế lại toàn bộ nền tảng.

---

# 4. Mục tiêu dự án

## 4.1. Mục tiêu tổng quát

Xây dựng một nền tảng Web thống nhất hỗ trợ thiết lập, thực thi, giám sát, quản lý và đánh giá các thí nghiệm huấn luyện drone bằng Reinforcement Learning trên các môi trường mô phỏng được hỗ trợ, trước mắt là Project AirSim và Gym-PyBullet-Drones.

## 4.2. Mục tiêu cụ thể

| Mã | Mục tiêu | Kết quả có thể kiểm chứng |
|---|---|---|
| OBJ-01 | Tích hợp môi trường mô phỏng | Có thể cấu hình và kiểm tra kết nối riêng với từng simulator trong phạm vi hỗ trợ |
| OBJ-02 | Chuẩn hóa giao tiếp môi trường RL | Các môi trường được tích hợp cung cấp giao diện chung về reset, step, observation, reward và kết thúc episode |
| OBJ-03 | Hỗ trợ bài toán điều khiển drone | Có thể cấu hình và chạy ít nhất các bài toán được chọn cho MVP, ưu tiên Hovering/Position Control; Trajectory Tracking được kiểm chứng theo mức độ sẵn sàng của simulator |
| OBJ-04 | Hỗ trợ thuật toán RL | Tích hợp PPO làm luồng huấn luyện đầu tiên; thiết kế có khả năng bổ sung SAC và TD3 |
| OBJ-05 | Quản lý phiên huấn luyện | Người dùng có thể tạo, khởi chạy, theo dõi và kết thúc một phiên huấn luyện theo quyền được cấp |
| OBJ-06 | Theo dõi chỉ số | Ghi nhận và hiển thị các chỉ số phù hợp như Reward, Episode Length, Training Loss và các chỉ số đánh giá nhiệm vụ |
| OBJ-07 | Lưu trữ kết quả | Lưu cấu hình, log, checkpoint, thông tin mô hình và kết quả đánh giá gắn với từng phiên chạy |
| OBJ-08 | Đánh giá mô hình | Có thể nạp một checkpoint và chạy đánh giá mà không cập nhật trọng số policy |
| OBJ-09 | Trực quan hóa và xuất dữ liệu | Có thể xem biểu đồ/chỉ số và xuất dữ liệu thực nghiệm ở định dạng phổ biến như CSV |

## 4.3. Tiêu chí định hướng chất lượng

Các tiêu chí dưới đây là định hướng cần được chuyển thành tiêu chí nghiệm thu định lượng trong tài liệu yêu cầu chi tiết:

- Một experiment phải truy ngược được về cấu hình và phiên bản phần mềm đã sử dụng.
- Phiên huấn luyện phải có trạng thái rõ ràng, tối thiểu gồm chờ chạy, đang chạy, hoàn thành, thất bại và đã dừng.
- Khi phiên huấn luyện lỗi, hệ thống phải lưu được thông tin lỗi cơ bản để phục vụ điều tra.
- Chỉ số hiển thị phải có nguồn dữ liệu, thời điểm ghi nhận và đơn vị/định nghĩa rõ ràng.
- Quy trình evaluation phải phân biệt với training và không cập nhật trọng số mô hình.
- Mỗi adapter simulator phải vượt qua bộ kiểm tra giao diện và kiểm thử tích hợp tương ứng.

---

# 5. Phạm vi dự án

## 5.1. Phạm vi chức năng dự kiến của sản phẩm

Phạm vi tổng thể dự kiến gồm các nhóm chức năng:

1. Quản lý dự án và thí nghiệm.
2. Quản lý cấu hình và kết nối simulator.
3. Cấu hình drone, nhiệm vụ bay và điều kiện mô phỏng.
4. Cấu hình observation, action, reward và điều kiện kết thúc episode.
5. Cấu hình thuật toán và tham số huấn luyện.
6. Điều phối và giám sát các phiên huấn luyện.
7. Ghi log, lưu checkpoint và quản lý mô hình.
8. Đánh giá, so sánh và trực quan hóa kết quả.
9. Xuất dữ liệu và báo cáo thực nghiệm cơ bản.

## 5.2. Phạm vi phiên bản MVP

MVP tập trung chứng minh được một luồng làm việc hoàn chỉnh từ giao diện Web đến simulator, thuật toán RL và kết quả lưu trữ.

| Nhóm | Phạm vi MVP đề xuất | Ghi chú |
|---|---|---|
| Simulator | Tích hợp Project AirSim và Gym-PyBullet-Drones ở mức adapter cơ bản | Không giả định hai simulator có cùng mô hình vật lý |
| Kiểm tra kết nối | Kiểm tra trạng thái sẵn sàng, lỗi kết nối và thông tin phiên bản cơ bản | Tùy khả năng API của từng simulator |
| Nhiệm vụ | Ưu tiên Hovering và/hoặc Position Control làm bài toán kiểm chứng đầu tiên | Chọn bài toán cụ thể sau spike kỹ thuật |
| Trajectory Tracking | Đưa vào phạm vi mục tiêu; triển khai MVP khi đã xác nhận được action/observation và tốc độ mô phỏng phù hợp | Có thể là mốc nghiệm thu tiếp theo nếu phức tạp hơn dự kiến |
| Thuật toán | PPO là thuật toán đầu tiên cần có luồng hoạt động đầu-cuối | SAC và TD3 được thiết kế để bổ sung, không mặc nhiên bắt buộc trong lát cắt MVP đầu tiên |
| Cấu hình huấn luyện | Các tham số PPO cốt yếu, seed, số timestep và checkpoint frequency | Không xây dựng hyperparameter tuning tự động ở MVP |
| Giám sát | Trạng thái phiên chạy và các chỉ số cơ bản | Cập nhật theo chu kỳ, không yêu cầu streaming từng timestep nếu không cần thiết |
| Lưu trữ | Cấu hình, log, checkpoint và metadata mô hình | Có thể sử dụng lưu trữ cục bộ ở giai đoạn đầu |
| Đánh giá | Chạy checkpoint ở chế độ evaluation với cấu hình kiểm thử riêng | Không cập nhật policy |
| Trực quan hóa | Biểu đồ training cơ bản và dữ liệu quỹ đạo ở mức phù hợp | Chưa yêu cầu trình xem 3D tương tác đầy đủ |

### Điều kiện quan trọng của MVP

- Cần chứng minh được tối thiểu một quy trình huấn luyện đầu-cuối trên mỗi simulator được công bố là đã hỗ trợ.
- Cần xác nhận rõ phiên bản, hệ điều hành, thư viện và cách khởi chạy từng simulator.
- Cần thống nhất một task mẫu và bộ chỉ số đánh giá chung trước khi so sánh kết quả giữa hai simulator.
- Việc hỗ trợ PPO, SAC và TD3 đầy đủ trên cả hai simulator là mục tiêu mở rộng; không nên tuyên bố hoàn tất nếu mới chỉ kiểm thử PPO trên một môi trường.

## 5.3. Ngoài phạm vi MVP

Các nội dung sau không thuộc MVP, trừ khi chủ dự án phê duyệt mở rộng:

- Điều khiển drone thật hoặc triển khai policy lên thiết bị bay thật.
- PX4 SITL/HITL và quy trình Sim-to-Real hoàn chỉnh.
- Huấn luyện phân tán trên nhiều máy hoặc điều phối cụm GPU.
- Multi-Agent RL và điều khiển đội hình nhiều drone.
- Domain Randomization nâng cao, Curriculum Learning và Robustness Testing tự động.
- Tối ưu siêu tham số tự động quy mô lớn.
- Hệ thống nhiều tổ chức/người dùng với phân quyền phức tạp.
- Trình biên tập reward trực quan có khả năng tạo mã tùy ý.
- Hệ thống triển khai mô hình thương mại hoặc quản lý đội drone ngoài thực địa.

---

# 6. Đánh giá tính khả thi (Feasibility Study)

## 6.1. Tính khả thi về kỹ thuật (Technical Feasibility)

### 6.1.1. Đánh giá tổng quan

Dự án có cơ sở kỹ thuật để triển khai theo hướng từng giai đoạn. Các thành phần Web, Backend Python, framework RL và simulator đều có giao diện/libraries có thể tích hợp. Tuy nhiên, mức độ khả thi của việc kết nối đồng nhất cả Project AirSim và Gym-PyBullet-Drones cần được chứng minh bằng một giai đoạn thử nghiệm kỹ thuật (technical spike), không chỉ suy luận từ việc mỗi công cụ hoạt động độc lập.

### 6.1.2. Cơ sở kỹ thuật đã xác minh ở mức tài liệu

| Thành phần | Cơ sở kỹ thuật | Ý nghĩa đối với dự án | Hạn chế/cần kiểm chứng |
|---|---|---|---|
| Project AirSim | Tài liệu dự án mô tả Python client và các đối tượng Client, World, Drone; API hỗ trợ kết nối, quản lý world, điều khiển drone và dữ liệu cảm biến | Có điểm tích hợp để xây dựng adapter Python | API được ghi nhận là đang phát triển và không đặt mục tiêu tương thích ngược hoàn toàn với AirSim cũ; cần cố định phiên bản và kiểm thử lại adapter |
| Project AirSim + Unreal | Tài liệu dự án nêu khả năng chạy core/runtime không cần Unreal hoặc kết hợp Unreal Engine 5 khi cần thế giới 3D, hình học môi trường và cảm biến được render | Có thể cân nhắc chế độ headless cho một số tác vụ và chế độ render khi quan sát | Hiệu năng phụ thuộc workload, rendering và phần cứng; cần thử nghiệm trên máy mục tiêu |
| Gym-PyBullet-Drones | Repository cung cấp môi trường PyBullet cho quadcopter, giao diện Gymnasium và ví dụ huấn luyện PPO với Stable-Baselines3 | Có nền tảng thuận lợi để xây dựng quy trình RL mẫu | Cần xác nhận đúng repository/fork, phiên bản, môi trường Python và tính tương thích với dependency của dự án |
| Gymnasium | API chuẩn sử dụng reset và step; step trả observation, reward, terminated, truncated, info | Có thể dùng làm hợp đồng giao tiếp chung cho các environment adapter | Cần ánh xạ đúng semantics, không chỉ đổi tên hàm; terminated và truncated phải được phân biệt |
| Stable-Baselines3/PyTorch | Có thể dùng làm lớp thuật toán và huấn luyện; ví dụ PPO đã có trong hệ sinh thái PyBullet-Drones | Hạn chế việc tự triển khai thuật toán từ đầu | Cần kiểm tra phiên bản tương thích, kiểu observation/action, vectorization và callback của môi trường |
| Web + Backend | React/TypeScript và FastAPI là lựa chọn phổ biến cho giao diện và API Python | Phù hợp với việc tách giao diện khỏi tiến trình huấn luyện | Cần thiết kế worker riêng; không chạy vòng lặp RL dài bên trong request HTTP |

### 6.1.3. Hướng giải pháp kỹ thuật ở mức khởi tạo

Đề xuất kiến trúc khái niệm gồm:

- **Web Frontend:** cấu hình thí nghiệm, hiển thị trạng thái, biểu đồ và kết quả.
- **Backend API:** quản lý dự án, cấu hình, người dùng và yêu cầu chạy thí nghiệm.
- **Training Worker:** tiến trình riêng chịu trách nhiệm chạy thuật toán RL.
- **RL Framework:** Gymnasium, Stable-Baselines3 và PyTorch.
- **Simulator Adapter:** lớp chuyển đổi API của từng simulator sang một hợp đồng môi trường thống nhất.
- **Storage:** lưu metadata, log, checkpoint, mô hình và dữ liệu đánh giá.

Gymnasium nên là chuẩn giao tiếp môi trường RL. Tuy vậy, không được giả định hai simulator có cùng state space, action space, tần số vật lý, hệ trục hoặc mô hình động lực học. Cần định nghĩa rõ các quy ước theo từng task và adapter.

### 6.1.4. Các điểm kỹ thuật phải kiểm chứng

1. **Kết nối và điều khiển Project AirSim:** kết nối client, nạp scene, reset trạng thái, gửi action, lấy state/sensor và đồng bộ thời gian mô phỏng.
2. **Tích hợp Gym-PyBullet-Drones:** xác định chính xác repository/fork, environment class, tham số mô phỏng và cách kết thúc/khởi tạo episode.
3. **Chuẩn hóa observation/action:** thống nhất thứ tự biến, đơn vị, hệ tọa độ, giới hạn và chuẩn hóa dữ liệu.
4. **Đồng bộ thời gian:** xác định một action của agent tương ứng bao nhiêu bước vật lý, thời lượng mô phỏng và tần số điều khiển.
5. **Reward và termination:** phân biệt reward theo task với reward đặc thù simulator; quy định thống nhất điều kiện thành công, va chạm, mất ổn định và hết thời gian.
6. **Hiệu năng:** đo tốc độ mô phỏng khi chạy headless/render, thời gian mỗi bước, số môi trường song song và mức sử dụng CPU/GPU/RAM.
7. **Khả năng tái lập:** lưu seed, cấu hình, phiên bản simulator, thư viện, hệ điều hành và thông tin phần cứng.
8. **Vận hành worker:** quản lý tiến trình, dừng an toàn, timeout, lỗi simulator và phục hồi checkpoint.

### 6.1.5. Kết luận kỹ thuật

**Đánh giá sơ bộ: Khả thi có điều kiện.** Các công nghệ nền tảng và ví dụ tích hợp RL đã tồn tại. Rủi ro kỹ thuật trọng yếu nằm ở adapter Project AirSim, đồng bộ thời gian mô phỏng, khác biệt mô hình vật lý và hiệu năng khi huấn luyện. Cần hoàn thành technical spike cho cả hai simulator trước khi chốt kiến trúc chi tiết và cam kết đầy đủ phạm vi MVP.

## 6.2. Tính khả thi về vận hành (Operational Feasibility)

### Thuận lợi

- Quy trình được tập trung hơn trong một giao diện chung.
- Người dùng có thể theo dõi thí nghiệm, cấu hình và kết quả theo cùng một cấu trúc.
- Các nhà nghiên cứu vẫn có thể sử dụng Python và simulator trực tiếp khi cần debug hoặc phát triển chức năng mới.
- Có thể triển khai ban đầu trong mạng nội bộ hoặc trên máy trạm/máy chủ của phòng thí nghiệm.

### Khó khăn

- Người dùng cần hiểu các khái niệm RL như observation, action, reward, episode và checkpoint.
- Việc cài đặt và vận hành Project AirSim có thể đòi hỏi cấu hình phần mềm/phần cứng chuyên biệt.
- Một phiên huấn luyện dài có thể chiếm tài nguyên, ảnh hưởng đến các phiên khác.
- Khi simulator lỗi, cần quy trình chẩn đoán phân biệt lỗi Web, Backend, Worker, adapter và simulator.

### Điều kiện để vận hành tốt

- Có tài liệu cài đặt, cấu hình và xử lý lỗi.
- Có bộ cấu hình mẫu cho các bài toán được hỗ trợ.
- Có hướng dẫn phân biệt Training và Evaluation.
- Có giới hạn số phiên chạy đồng thời theo tài nguyên thực tế.
- Có cơ chế ghi log và thông báo lỗi có thể truy vết.

**Đánh giá sơ bộ: Khả thi.** Nên bắt đầu với nhóm người dùng nhỏ trong phòng thí nghiệm, sau đó mới mở rộng số lượng người dùng và khả năng chạy đồng thời.

## 6.3. Tính khả thi về kinh tế (Economic Feasibility)

Chưa có thông tin về ngân sách, cấu hình máy trạm, số lượng người dùng, thời lượng huấn luyện và phương án triển khai. Do đó, chưa đủ căn cứ để đưa ra tổng chi phí hoặc thời gian hoàn vốn. Các nhóm chi phí cần lập dự toán gồm:

| Nhóm chi phí | Hạng mục cần xem xét | Ghi chú |
|---|---|---|
| Phần cứng | Máy trạm/máy chủ, CPU, GPU, RAM, SSD, thiết bị lưu trữ và mạng | Phụ thuộc simulator, render và số phiên huấn luyện đồng thời |
| Phần mềm | Hệ điều hành, Unreal Engine, thư viện Python, công cụ phát triển và giám sát | Cần kiểm tra license và điều kiện sử dụng của từng thành phần |
| Hạ tầng | Điện, làm mát, mạng nội bộ, backup và lưu trữ | Tăng theo thời gian chạy và dung lượng log/video/checkpoint |
| Phát triển | Công phân tích nghiệp vụ, tích hợp simulator, phát triển Web/Backend/RL, kiểm thử và tài liệu | Cần ước lượng sau khi chốt phạm vi và năng lực nhóm |
| Vận hành | Bảo trì, cập nhật phiên bản, sửa lỗi, hỗ trợ người dùng và sao lưu | Cần tính cả giai đoạn sau nghiệm thu |

### Cách kiểm soát chi phí

- Tận dụng thư viện mã nguồn mở khi phù hợp và kiểm tra license trước khi sử dụng.
- Làm MVP trên hạ tầng hiện có nếu đáp ứng được yêu cầu thử nghiệm.
- Ưu tiên chạy headless đối với các tác vụ không cần hình ảnh render nếu simulator hỗ trợ và kết quả vẫn hợp lệ.
- Thiết lập giới hạn tài nguyên và chính sách lưu trữ log/checkpoint.
- Chỉ đầu tư thêm GPU hoặc máy chủ sau khi có số liệu benchmark đại diện.

**Đánh giá sơ bộ: Chưa thể kết luận về tổng mức đầu tư; có thể kiểm soát theo giai đoạn.** Cần khảo sát phần cứng hiện có và lập dự toán sau technical spike.

## 6.4. Tính khả thi về tiến độ (Schedule Feasibility)

Có thể chia dự án thành các giai đoạn với đầu ra và điều kiện chuyển giai đoạn rõ ràng. Chưa ấn định số tuần/tháng vì chưa có thông tin về quy mô đội ngũ, kinh nghiệm, máy móc và mức độ sẵn sàng của simulator.

| Giai đoạn | Nội dung chính | Đầu ra/điều kiện hoàn thành |
|---|---|---|
| 1. Khảo sát và khởi tạo | Xác nhận người dùng, bài toán ưu tiên, simulator/fork, môi trường phần cứng và tiêu chí đánh giá | Tài liệu khởi tạo được phê duyệt; danh sách giả định và rủi ro được xác nhận |
| 2. Technical spike | Thử kết nối từng simulator; chạy reset/step; thu observation; gửi action; chạy một vòng PPO mẫu | Bằng chứng tích hợp đầu-cuối tối thiểu trên từng simulator mục tiêu hoặc ghi nhận rõ blocker |
| 3. MVP Core | Xây dựng giao diện quản lý, backend, worker, lưu trữ và adapter đã chứng minh | Tạo và chạy được experiment theo quy trình thống nhất |
| 4. Giám sát và đánh giá | Bổ sung metrics, checkpoint, evaluation, biểu đồ và xuất dữ liệu | Có thể theo dõi, đánh giá và truy xuất kết quả |
| 5. Kiểm thử và nghiệm thu | Kiểm thử chức năng, tích hợp, hiệu năng, độ ổn định và tài liệu vận hành | Đạt các tiêu chí nghiệm thu đã thống nhất |
| 6. Mở rộng | Bổ sung SAC/TD3, task mới, trực quan hóa nâng cao và các chức năng nghiên cứu | Các tính năng mở rộng được triển khai theo ưu tiên mới |

### Các yếu tố có thể làm chậm tiến độ

- Khác biệt hoặc thay đổi API giữa các phiên bản simulator.
- Khó khăn trong đồng bộ thời gian thực và điều khiển từng bước mô phỏng.
- Cấu hình phần cứng không đáp ứng yêu cầu của môi trường 3D.
- Phạm vi MVP thay đổi trong khi phát triển.
- Chưa thống nhất tiêu chí đo lường thành công của nhiệm vụ bay.

**Đánh giá sơ bộ: Khả thi theo hướng phát triển tăng dần.** Không nên cam kết lịch hoàn thành chi tiết trước khi technical spike và xác nhận nguồn lực.

## 6.5. Tính khả thi về nguồn lực (Resource Feasibility)

### Năng lực cần có

| Vai trò/năng lực | Trách nhiệm chính | Mức độ cần thiết |
|---|---|---|
| Project Manager/BA | Điều phối phạm vi, yêu cầu, tiến độ, rủi ro và nghiệm thu | Cần có người phụ trách |
| Python/Backend Developer | Xây dựng backend, worker, quản lý tiến trình và tích hợp Python | Cần có |
| Frontend Developer | Xây dựng giao diện cấu hình, giám sát và hiển thị kết quả | Cần có |
| RL/Control Engineer | Thiết kế task, observation, action, reward, thuật toán và đánh giá | Cần có; có thể kiêm nhiệm |
| Simulation Engineer | Cấu hình và tích hợp Project AirSim, Gym-PyBullet-Drones | Cần có năng lực chuyên môn tương ứng |
| QA/Tester | Kiểm thử chức năng, tích hợp, tái lập và hiệu năng | Cần có; có thể kiêm nhiệm ở MVP |
| DevOps/System Admin | Đóng gói, triển khai, giám sát máy chủ và lưu trữ | Có thể kiêm nhiệm ở MVP; quan trọng khi mở rộng |

### Hạ tầng cần khảo sát

- Máy tính/máy chủ có hệ điều hành tương thích với phiên bản Project AirSim được chọn.
- CPU, RAM, GPU và dung lượng SSD phù hợp với Unreal Engine, workload mô phỏng và huấn luyện.
- Môi trường Python và bộ thư viện được cố định phiên bản.
- Mạng nội bộ và cơ chế kết nối giữa Web server, worker và simulator.
- Không gian lưu trữ cho checkpoint, log, dữ liệu telemetry và video nếu có.

**Đánh giá sơ bộ: Khả thi nếu bố trí được nhân lực có kinh nghiệm Python/RL/simulation và hạ tầng đáp ứng.** Hiện chưa có dữ liệu cụ thể để xác nhận nguồn lực đã sẵn sàng.

## 6.6. Tổng hợp đánh giá khả thi

| Khía cạnh | Đánh giá sơ bộ | Điều kiện/quyết định cần có |
|---|---|---|
| Kỹ thuật | Khả thi có điều kiện | Technical spike thành công cho từng simulator; cố định phiên bản và chuẩn hóa task |
| Vận hành | Khả thi | Có quy trình cài đặt, hướng dẫn, log và quản lý tài nguyên |
| Kinh tế | Chưa đủ dữ liệu để kết luận | Khảo sát phần cứng hiện có và lập dự toán theo kịch bản sử dụng |
| Tiến độ | Khả thi theo giai đoạn | Chốt phạm vi MVP và đánh giá effort sau spike |
| Nguồn lực | Khả thi nếu bố trí đủ năng lực | Xác nhận người phụ trách RL, simulator, backend, frontend và kiểm thử |

**Kết luận sơ bộ:** Dự án có cơ sở để tiếp tục bước khảo sát và thử nghiệm kỹ thuật. Chưa nên xem tính khả thi tích hợp hai simulator, chi phí và tiến độ là đã được xác nhận cho đến khi hoàn thành các điều kiện kiểm chứng nêu trên.

---

# 7. Rủi ro và thách thức chính

| Mã | Rủi ro | Khả năng | Ảnh hưởng | Biện pháp giảm thiểu |
|---|---|---|---|---|
| R-01 | API Project AirSim thay đổi giữa các phiên bản | Trung bình | Cao | Cố định phiên bản; đóng gói adapter riêng; kiểm thử tích hợp khi nâng cấp |
| R-02 | Khác biệt hệ tọa độ, đơn vị, state và action giữa simulator | Cao | Cao | Định nghĩa task contract; chuyển đổi và kiểm thử bằng bộ dữ liệu/trạng thái mẫu |
| R-03 | Đồng bộ thời gian mô phỏng không phù hợp với vòng lặp RL | Trung bình | Cao | Thử nghiệm clock/step; đo latency và xác định control time step rõ ràng |
| R-04 | Simulator 3D tiêu tốn tài nguyên, làm chậm huấn luyện | Trung bình | Cao | Benchmark; cân nhắc headless; giới hạn phiên chạy đồng thời |
| R-05 | Reward/termination thiết kế chưa phù hợp | Trung bình | Cao | Định nghĩa metric và kịch bản đánh giá; kiểm thử reward từng thành phần |
| R-06 | Kết quả khó tái lập do thiếu metadata hoặc seed | Trung bình | Cao | Lưu seed, cấu hình, phiên bản thư viện, simulator và phần cứng |
| R-07 | Tiến trình huấn luyện bị treo hoặc dừng bất thường | Trung bình | Trung bình/Cao | Worker độc lập, timeout, heartbeat, checkpoint và cơ chế kết thúc tiến trình |
| R-08 | Phạm vi dự án mở rộng quá sớm | Cao | Cao | Quản lý thay đổi; ưu tiên MVP; đưa Multi-Agent, tuning và Sim-to-Real sang giai đoạn sau |
| R-09 | Thiếu nhân lực chuyên sâu RL/simulation | Trung bình | Cao | Xác định người phụ trách; làm prototype sớm; chuẩn hóa tài liệu kỹ thuật |
| R-10 | Chi phí lưu trữ log, checkpoint và video tăng | Trung bình | Trung bình | Chính sách retention, giới hạn dung lượng và sao lưu theo mức độ quan trọng |

## 7.1. Các giả định cần xác nhận

1. “Gym-Bullet” trong yêu cầu là Gym-PyBullet-Drones hay một package khác.
2. Máy triển khai và hệ điều hành mục tiêu là gì; có cần chạy Project AirSim cùng Unreal Engine trên cùng máy hay tách máy.
3. Project AirSim sẽ sử dụng phiên bản/release/commit nào.
4. Bài toán đầu tiên để chứng minh tích hợp là Hovering, Position Control hay Trajectory Tracking.
5. Action của policy là motor command, attitude, velocity hay position setpoint.
6. Observation sử dụng trạng thái động lực học nào và có sử dụng camera/LiDAR hay không.
7. Có yêu cầu chạy đồng thời nhiều experiment hay chỉ một phiên trên một máy trong MVP.
8. Số lượng người dùng dự kiến, yêu cầu đăng nhập và phân quyền.
9. Dung lượng lưu trữ, thời gian giữ log/checkpoint và nhu cầu xuất video.
10. Ngân sách, nhân sự và thời hạn mong muốn.

---

# 8. Kết luận và đề xuất triển khai

## 8.1. Kết luận

Drone RL Training Platform giải quyết nhu cầu tập trung hóa quy trình thiết lập, huấn luyện, giám sát và đánh giá các thí nghiệm RL cho drone. Định hướng tích hợp Project AirSim và Gym-PyBullet-Drones có cơ sở kỹ thuật, nhưng việc chuẩn hóa hai môi trường thành một quy trình huấn luyện thống nhất là phần có rủi ro cao và cần được kiểm chứng thực tế.

Dự án được đánh giá **có thể tiếp tục triển khai ở giai đoạn khảo sát và prototype kỹ thuật**, với điều kiện không mở rộng phạm vi quá sớm và không đưa ra cam kết về hiệu năng, chi phí hoặc tiến độ khi chưa có số liệu.

## 8.2. Đề xuất thứ tự ưu tiên

1. Xác nhận chính xác simulator, phiên bản, hệ điều hành và máy phần cứng.
2. Chọn một nhiệm vụ RL đơn giản làm bài toán chuẩn để tích hợp.
3. Tạo prototype độc lập cho từng simulator: kết nối, reset, step, lấy observation và gửi action.
4. Bọc môi trường theo API Gymnasium và chạy PPO mẫu.
5. Đo hiệu năng mô phỏng, độ ổn định và khả năng tái lập.
6. Chỉ sau khi đạt các điều kiện trên mới chốt thiết kế chi tiết và phát triển đầy đủ Web/Backend.
7. Bổ sung SAC, TD3, Trajectory Tracking nâng cao và các chức năng nghiên cứu theo mức độ ưu tiên.

## 8.3. Cổng quyết định trước khi phát triển MVP

| Cổng | Điều kiện cần đạt | Quyết định |
|---|---|---|
| G1 – Xác nhận đầu vào | Chốt simulator/fork, phiên bản, task đầu tiên, cấu hình phần cứng và người dùng mục tiêu | Cho phép làm prototype |
| G2 – Chứng minh tích hợp | Mỗi simulator trong phạm vi có thể khởi tạo/reset, nhận action, trả observation và chạy episode mẫu | Cho phép chốt thiết kế adapter |
| G3 – Chứng minh huấn luyện | PPO có thể huấn luyện và lưu checkpoint trên task mẫu; evaluation có thể chạy lại checkpoint | Cho phép hoàn thiện MVP |
| G4 – Nghiệm thu MVP | Hoàn thành các luồng cấu hình, chạy, giám sát, lưu trữ và đánh giá theo tiêu chí đã thống nhất | Cho phép đưa vào sử dụng thử |

---

# 9. Định hướng bước tiếp theo

Sau khi tài liệu khởi tạo được xem xét và phê duyệt, dự án nên chuyển sang **Phân tích yêu cầu nghiệp vụ (Business Requirements Analysis)**.

Các đầu ra đề xuất của bước tiếp theo:

1. Danh sách stakeholder và nhóm người dùng.
2. Danh sách nhu cầu nghiệp vụ và vấn đề ưu tiên.
3. Quy trình nghiệp vụ tổng thể của người dùng: tạo project → cấu hình simulator → tạo experiment → cấu hình RL → chạy training → đánh giá → lưu/chia sẻ kết quả.
4. Danh sách yêu cầu chức năng (Functional Requirements).
5. Danh sách yêu cầu phi chức năng (Non-Functional Requirements).
6. Phạm vi MVP được xác nhận và tiêu chí nghiệm thu.
7. Danh sách giả định, phụ thuộc và ràng buộc.

Không nên chuyển ngay sang thiết kế database, API hoặc giao diện chi tiết trước khi thống nhất yêu cầu và phạm vi MVP.

---

# 10. Tài liệu tham khảo kỹ thuật ban đầu

Các tài liệu dưới đây được dùng để xác nhận sơ bộ khả năng tích hợp và các ràng buộc kỹ thuật. Cần kiểm tra lại đúng phiên bản tài liệu tương ứng với phiên bản phần mềm sẽ khóa cho dự án.

1. **Project AirSim – GitHub repository:** mô tả tổng quan dự án, khả năng chạy Runtime và tích hợp Unreal Engine.  
   https://github.com/iamaisim/ProjectAirSim
2. **Project AirSim – API Overview:** mô tả Client, World, Drone, giao tiếp API, đơn vị SI và quy ước NED; lưu ý API có thể thay đổi và không cam kết tương thích ngược hoàn toàn với AirSim cũ.  
   https://github.com/iamaisim/ProjectAirSim/blob/main/docs/api.md
3. **Project AirSim – Documentation:** thông tin môi trường phát triển và các hướng dẫn cài đặt.  
   https://iamaisim.github.io/ProjectAirSim/
4. **Gym-PyBullet-Drones – GitHub repository:** môi trường PyBullet cho quadcopter, hỗ trợ Gymnasium và có ví dụ PPO/Stable-Baselines3. Repository/fork cần được chủ dự án xác nhận trước khi khóa phụ thuộc.  
   https://github.com/learnsyslab/gym-pybullet-drones
5. **Gymnasium – Environment API:** định nghĩa reset, step, observation, reward, terminated, truncated và info.  
   https://gymnasium.farama.org/api/env/
6. **Stable-Baselines3 – Documentation:** tài liệu framework RL và các thuật toán được hỗ trợ.  
   https://stable-baselines3.readthedocs.io/

---

## Phê duyệt tài liệu

| Vai trò | Người phê duyệt | Ngày | Trạng thái |
|---|---|---|---|
| Chủ dự án/Product Owner | Chưa xác định | Chưa xác định | Chờ phê duyệt |
| Project Manager | Chưa xác định | Chưa xác định | Chờ phê duyệt |
| Đại diện kỹ thuật/RL | Chưa xác định | Chưa xác định | Chờ phê duyệt |

> **Trạng thái tài liệu:** Bản dự thảo khởi tạo. Các nội dung về nhân lực, phần cứng, ngân sách, tiến độ và tiêu chí định lượng cần được xác nhận trước khi dùng làm baseline chính thức của dự án.
