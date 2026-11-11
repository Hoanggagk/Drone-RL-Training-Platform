# CI/CD cho Drone RL Training Platform

## Phạm vi hiện tại

Repository hiện chỉ có toolchain chạy được cho Frontend demo của MOD-01. Vì vậy, CI hiện tại chỉ kiểm tra OpenAPI contract và Frontend React/TypeScript. Backend, database migration, worker, RL runtime, simulator integration, container và deployment chưa có manifest hoặc lệnh thực thi được phê duyệt nên vẫn là **TBD**.

Workflow `.github/workflows/frontend-ci.yml` chạy khi Frontend, OpenAPI contract MOD-01 hoặc chính workflow thay đổi; cũng có thể chạy thủ công. Workflow dùng Node.js theo `frontend/.nvmrc`, cài dependency bằng `npm ci` từ lockfile và không sử dụng secret.

## Quality gates

Job `Contract, lint, test and build` kiểm tra:

1. OpenAPI lint và generated-client drift.
2. Prettier và ESLint.
3. TypeScript type checking.
4. Unit/component tests.
5. Production build.

Job `End-to-end tests` cài Chromium và chạy Playwright. Hai job có timeout 15 phút và workflow cũ trên cùng branch/PR được hủy khi có commit mới.

Nên cấu hình hai job trên thành required checks cho nhánh chính sau khi workflow đã chạy thành công trên GitHub.

## Chạy tương đương ở local

```powershell
Set-Location frontend
npm ci
npm run api:lint
npm run api:check
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## Phần chưa triển khai

- Documentation CI: chưa có Markdown/link checker hoặc quy tắc truy vết được phê duyệt.
- Backend CI và PostgreSQL migration test: chưa có `pyproject.toml`, lockfile, migration tool hoặc lệnh test.
- Worker, RL Core và PyBullet: chưa có toolchain/test thực thi.
- AirSim: chỉ nên bổ sung bằng manual workflow trên self-hosted runner, có timeout và cleanup, sau khi adapter/runtime được triển khai.
- Container build và security scan: chưa có Dockerfile.
- CD: chưa xác định deployment target, environment, secret, health check và rollback. Không tạo workflow deployment giả định ở giai đoạn này.

Khi các thành phần trên có manifest và lệnh kiểm tra thực tế, bổ sung workflow riêng; không chạy training dài hạn hoặc AirSim trên GitHub-hosted runner.
