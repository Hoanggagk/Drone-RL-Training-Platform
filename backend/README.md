# Backend

Vùng triển khai FastAPI modular monolith theo ADR-001. Backend xử lý HTTP/API, validation, authorization và application orchestration; không chạy RL loop hoặc simulator runtime trong request/process FastAPI.

Hiện chỉ tạo ranh giới `identity_access` vì MOD-01 đã có module design và OpenAPI. Chưa có `pyproject.toml` hoặc lệnh chạy cho đến khi backend plan chốt Python version, dependency và migration workflow.

Các layer trong mỗi module:

- `api`: FastAPI routers và boundary mapping.
- `application`: use case, command/query và transaction boundary.
- `domain`: business rules độc lập framework.
- `infrastructure`: repository/persistence/external integration.
