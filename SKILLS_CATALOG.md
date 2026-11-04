# Danh mục Codex Skills

> Cập nhật: 04/11/2026. Danh mục này mô tả các skill hiện có trong môi trường Codex, không phải các module của dự án Drone RL.

## Cách sử dụng

Codex tự chọn skill dựa trên tên và mô tả của skill khi yêu cầu phù hợp. Khi muốn chỉ định rõ, hãy yêu cầu: `Dùng skill <tên-skill> để ...`.

Mỗi skill là một quy trình hướng dẫn chuyên biệt được định nghĩa trong `SKILL.md`; một số skill còn có script, tài liệu tham khảo, template hoặc công cụ kết nối đi kèm.

## 1. Codex, skill và plugin

| Skill | Mục đích sử dụng | Dùng khi |
|---|---|---|
| `openai-docs` | Tra cứu hướng dẫn chính thức về Codex, ChatGPT và OpenAI API. | Hỏi về model, cấu hình, cách dùng Codex, API, SDK hoặc tính năng OpenAI. |
| `skill-creator` | Tạo mới hoặc cập nhật một Codex skill đúng cấu trúc. | Muốn biến một quy trình lặp lại thành skill có thể tái sử dụng. |
| `skill-installer` | Liệt kê hoặc cài skill từ bộ curated hay repository GitHub. | Muốn thêm skill mới vào Codex. |
| `plugin-management:plugin-management` | Khám phá, kiểm tra quyền, kết nối hoặc gỡ plugin. | Công việc cần truy cập ứng dụng, tài khoản hay dịch vụ bên ngoài. |

## 2. Nghiên cứu và viết bài khoa học

| Skill | Mục đích sử dụng | Dùng khi |
|---|---|---|
| `vibe-research-workflow` | Điều phối quy trình nghiên cứu có AI qua coding, figure và writing. | Cần chọn công cụ hoặc tổ chức một phiên làm nghiên cứu với AI. |
| `idea-evaluator` | Đánh giá novelty, giá trị, tính khả thi và rủi ro chí mạng của ý tưởng nghiên cứu. | Trước khi cam kết theo một hướng nghiên cứu hoặc chốt phạm vi bài báo. |
| `tech-paper-template` | Xây dựng logic chain và bộ khung hoàn chỉnh cho technical paper. | Brainstorm cấu trúc bài, chuẩn bị họp với giảng viên hoặc lập paper skeleton. |
| `benchmark-paper-template` | Thiết kế cấu trúc riêng cho benchmark/evaluation paper. | Viết benchmark, lập pipeline xây dựng dữ liệu hoặc khung thí nghiệm đánh giá. |
| `deep-research` | Thực hiện literature review chuyên sâu, kiểm chứng nguồn và tổng hợp taxonomy. | Cần khảo sát lĩnh vực, lập bản đồ research landscape hoặc trả lời câu hỏi nghiên cứu bằng bằng chứng. |
| `paper-writer` | Viết nội dung bài báo từ dữ liệu, kết quả và tài liệu do tác giả cung cấp. | Cần soạn một đoạn, một section hoặc toàn bộ manuscript. |
| `intro-drafter` | Viết hoặc tái cấu trúc phần Introduction theo chuỗi lập luận học thuật. | Cần draft/outline Introduction và liên kết motivation, challenge, solution, contribution. |
| `paper-polish` | Chỉnh ngữ pháp, độ trôi chảy, academic tone và giảm văn phong máy móc. | Đã có bản nháp cần polish hoặc dịch sang tiếng Anh học thuật. |
| `pre-submission-reviewer` | Audit bài báo trước khi nộp về logic, ngôn ngữ, LaTeX và hình. | Cần review toàn diện, đặc biệt gần deadline submission. |
| `rebuttal-guidance` | Phân tích reviewer comment và đề xuất chiến lược phản hồi thuyết phục. | Chuẩn bị rebuttal hoặc response to reviewers. |

## 3. Hình ảnh, sơ đồ và figure

| Skill | Mục đích sử dụng | Dùng khi |
|---|---|---|
| `imagegen` | Tạo hoặc chỉnh sửa ảnh raster bằng AI. | Cần illustration, mockup, texture, sprite, ảnh minh họa hoặc cutout nền trong suốt. |
| `drawio-reconstruction` | Chuyển ảnh/sơ đồ tham chiếu thành file Draw.io có thể chỉnh sửa. | Cần tái dựng architecture diagram, research figure, slide hoặc UI screenshot thành `.drawio`. |
| `figure-designer` | Tư vấn bố cục, loại biểu đồ, nhãn và kiểm soát chất lượng figure khoa học. | Thiết kế Figure 1, methodology overview hoặc biểu đồ kết quả thí nghiệm. |

## 4. Website

| Skill | Mục đích sử dụng | Dùng khi |
|---|---|---|
| `sites:sites` | Tạo, chỉnh sửa, xuất bản hoặc quản lý website bằng Sites. | Cần landing page, portfolio, dashboard, portal, tracker, game hoặc công cụ web. |
| `sites:sites-remix` | Tạo một Site mới dựa trên Site đã có. | Đã xác định Site nguồn và muốn remix thành phiên bản khác. |

## 5. Supabase và PostgreSQL

| Skill | Mục đích sử dụng | Dùng khi |
|---|---|---|
| `supabase` | Hướng dẫn toàn diện về Supabase Database, Auth, Storage, Realtime, Edge Functions và client SDK. | Bất kỳ tác vụ phát triển, tích hợp hoặc debug nào liên quan Supabase. |
| `supabase-postgres-best-practices` | Áp dụng best practice cho schema, migration, SQL, index, RLS, bảo mật và hiệu năng PostgreSQL. | Trước khi tạo/sửa đối tượng database hoặc khi chẩn đoán query chậm, lock, bloat hay lỗi phân quyền. |

Hai skill này thường được dùng cùng nhau khi thay đổi database trong một dự án Supabase.

## 6. ChatGPT Work Pets

| Skill | Mục đích sử dụng | Dùng khi |
|---|---|---|
| `work-pets:create-pet` | Tạo, kiểm tra, preview, upload và kích hoạt animated pet mới. | Muốn tạo mascot/pet tùy chỉnh trong ChatGPT Work. |
| `work-pets:pets` | Liệt kê, xem, chọn, tải xuống hoặc xóa pet hiện có. | Quản lý thư viện ChatGPT Pets. |
| `work-pets:update-pet` | Sửa tên, mô tả, sprite sheet hoặc trạng thái của pet tùy chỉnh. | Cần cập nhật hay sửa lỗi một ChatGPT Pet đã có. |

## Chọn nhanh theo nhu cầu

| Nhu cầu | Skill nên bắt đầu |
|---|---|
| Đánh giá ý tưởng nghiên cứu | `idea-evaluator` |
| Lập khung technical paper | `tech-paper-template` |
| Lập khung benchmark paper | `benchmark-paper-template` |
| Khảo sát tài liệu chuyên sâu | `deep-research` |
| Viết nội dung bài báo | `paper-writer` |
| Viết Introduction | `intro-drafter` |
| Chỉnh sửa bản thảo | `paper-polish` |
| Review trước submission | `pre-submission-reviewer` |
| Chuẩn bị rebuttal | `rebuttal-guidance` |
| Thiết kế figure khoa học | `figure-designer` |
| Dựng lại sơ đồ thành Draw.io | `drawio-reconstruction` |
| Tạo ảnh raster | `imagegen` |
| Làm việc với Supabase | `supabase` |
| Viết hoặc sửa SQL/PostgreSQL | `supabase-postgres-best-practices` |
| Tạo website | `sites:sites` |
| Tạo/cập nhật skill | `skill-creator` |
| Cài thêm skill | `skill-installer` |

## Ghi chú quản lý

- Không cần gọi mọi skill trong một yêu cầu; chỉ dùng nhóm tối thiểu phù hợp với mục tiêu.
- Skill có namespace như `sites:*`, `work-pets:*` hoặc `plugin-management:*` đến từ plugin tương ứng.
- Danh sách có thể thay đổi khi cài/gỡ skill hoặc plugin; nên cập nhật file này sau mỗi thay đổi lớn.
- Skill hướng dẫn quy trình, còn quyền truy cập dữ liệu và hành động thực tế phụ thuộc vào tool/plugin đang được kết nối.

