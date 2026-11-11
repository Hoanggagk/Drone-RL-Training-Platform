# Database implementation

Baseline MVP dùng PostgreSQL 15+ và migration imperative, bám theo
`Database_design/PLATFORM_DATABASE_DESIGN.md`. Đây là PostgreSQL thuần, chưa phụ thuộc
Supabase Auth, Data API, Storage, ORM hoặc migration framework.

- `migrations/0001_mvp_baseline.sql`: schema, constraint, index, immutable snapshot và
  hàm atomic job claim bằng `FOR UPDATE SKIP LOCKED`.
- `seeds/0001_local_catalog.sql`: catalog phát triển tối thiểu; không đánh dấu simulator
  hoặc task là `supported`.
- `tests/0001_mvp_baseline_test.sql`: smoke test cho migration, snapshot bất biến, claim
  duy nhất, artifact lifecycle và metric availability.

Chạy trên một database kiểm thử rỗng (script sẽ thay đổi schema của database được truyền):

```powershell
.\scripts\test-database.ps1 -DatabaseUrl 'postgresql://USER:PASSWORD@localhost:5432/TEST_DATABASE'
```

Không đưa URL chứa credential vào Git hoặc log CI. Process training/evaluation phải được
spawn sau khi transaction claim đã commit; không giữ transaction trong suốt vòng đời run.
