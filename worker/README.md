# Worker orchestration

Process riêng cho PostgreSQL-backed dispatch, atomic claim, heartbeat, cooperative stop, timeout, crash reconciliation và child-process cleanup. Không import FastAPI application để chạy training trong HTTP lifecycle.

`dispatcher/`, `supervisor/` và `runtime/` chỉ là ranh giới thư mục; chưa tuyên bố worker đã được triển khai.
