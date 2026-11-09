# Database implementation

Nơi chứa assets triển khai PostgreSQL theo `Database_design/PLATFORM_DATABASE_DESIGN.md`:

- `schemas/`: desired-state schema nếu workflow declarative được phê duyệt.
- `migrations/`: migration có thứ tự nếu workflow imperative được chọn.
- `seeds/`: dữ liệu local/test không chứa secret hoặc dữ liệu thật.
- `tests/`: constraint, transaction, concurrency, RLS/permission test khi áp dụng.

Skeleton không tự quyết định Supabase, ORM hay migration tool. Không đồng thời duy trì declarative schema và hand-written migration như hai nguồn sự thật nếu workflow chưa được chốt.
