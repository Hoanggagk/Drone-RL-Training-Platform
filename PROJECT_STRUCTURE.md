# Cấu trúc repository

## 1. Cấu trúc chuẩn

```text
Drone-RL-Training-Platform/
├── frontend/                  # React/TypeScript presentation và API interaction
├── backend/                   # FastAPI modular monolith
│   ├── src/drone_rl_platform/
│   │   ├── modules/           # Module nghiệp vụ đã được duyệt
│   │   │   └── identity_access/
│   │   │       ├── api/       # HTTP routes, request/response mapping
│   │   │       ├── application/ # Use cases, commands, queries
│   │   │       ├── domain/    # Entity, value object, business rules
│   │   │       └── infrastructure/ # Repository, persistence, external adapter
│   │   └── shared/            # Hạ tầng dùng chung, không chứa nghiệp vụ module
│   └── tests/                 # Unit, integration, contract, API E2E
├── worker/                    # Dispatcher/supervisor; không nằm trong FastAPI process
├── rl_runtime/                # RL Core, tasks và simulator adapters
├── database/                  # PostgreSQL implementation assets
├── infrastructure/            # Compose/deployment/observability configuration
├── artifacts/                 # Local artifact layout, runtime data bị ignore
├── scripts/                   # Script phát triển/vận hành có kiểm soát
├── tests/                     # System/E2E xuyên frontend-backend-worker
├── API_design/                # OpenAPI và tài liệu API
├── Database_design/           # Thiết kế dữ liệu
├── Frontend_design/           # Spec/plan/tasks frontend
└── Module_design/             # Ranh giới MOD-01…MOD-17
```

## 2. Quy tắc phụ thuộc

- Frontend chỉ gọi public API; không chứa logic RL, simulator hoặc truy cập database.
- `backend/modules/<module>` không import trực tiếp infrastructure nội bộ của module khác. Tương tác xuyên module phải đi qua application contract được duyệt.
- HTTP request không chạy training/evaluation dài hạn. Backend chỉ tạo/điều phối job; `worker/` sở hữu process lifecycle.
- `rl_runtime/core` chỉ làm việc với Task Environment contract. Task gọi simulator qua adapter riêng.
- PostgreSQL là nguồn trạng thái chuẩn cho metadata/job state; binary artifact nằm ngoài database.
- `database/` chứa implementation có thể chạy; `Database_design/` vẫn là tài liệu nguồn.
- Chỉ tạo package module mới sau khi module đó có thiết kế/contract được phê duyệt. Skeleton hiện chỉ mở MOD-01.

## 3. Quy ước kiểm thử

- Unit test đặt gần layer chịu trách nhiệm trong `backend/tests/unit`, `worker/tests/unit` hoặc `rl_runtime/tests/unit`.
- Integration test kiểm tra PostgreSQL, HTTP boundary và simulator adapter thật/fixture phù hợp.
- Contract test giữ OpenAPI, registry và adapter contract không drift.
- System E2E trong `tests/e2e` chỉ được thêm khi các thành phần tương ứng đã có toolchain thực tế.

## 4. Trạng thái hiện tại

- `frontend/`: đã triển khai demo MOD-01.
- `backend/`, `worker/`, `rl_runtime/`, `database/`, `infrastructure/`: mới là skeleton; README không tuyên bố thành phần đã được hỗ trợ.
- Chưa chốt Python version, ORM/migration tool, Supabase workflow hay container topology trong skeleton này. Các quyết định đó phải bám tài liệu được duyệt và ADR tương ứng.
