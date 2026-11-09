# Drone RL Training Platform

Monorepo cho nền tảng Web hỗ trợ cấu hình, thực thi, giám sát và đánh giá thí nghiệm Reinforcement Learning cho drone.

## Thành phần chính

- `frontend/`: React + TypeScript; hiện có frontend demo MOD-01.
- `backend/`: FastAPI modular monolith; chỉ mở skeleton MOD-01 ở thời điểm hiện tại.
- `worker/`: Dispatcher, supervisor và child-process orchestration cho training/evaluation.
- `rl_runtime/`: RL Core, Gymnasium Task Environment và simulator adapters.
- `database/`: schema/migration/seed/test triển khai PostgreSQL; khác với tài liệu trong `Database_design/`.
- `infrastructure/`: cấu hình triển khai, database và observability.
- `artifacts/`: cấu trúc local artifact storage; dữ liệu runtime không commit.
- `tests/`: kiểm thử hệ thống xuyên thành phần.
- `API_design/`, `Database_design/`, `Frontend_design/`, `Module_design/`: tài liệu thiết kế và contract nguồn.

Xem [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) để biết ranh giới và quy tắc mở rộng thư mục.
