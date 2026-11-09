# MOD-01 Identity & Access

Backend package dành riêng cho authentication/session, account, role binding và project membership của MOD-01. Implementation phải bám `API_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/contracts/openapi.yaml` và module design tương ứng.

Không đặt Project, Experiment, Run, Simulator, Training hoặc Evaluation vào package này. `project_id` trong membership là opaque reference.
