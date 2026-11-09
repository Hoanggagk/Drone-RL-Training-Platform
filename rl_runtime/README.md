# RL runtime

Vùng thực thi RL tách khỏi Web/API:

- `core/`: algorithm registry, training/evaluation controller, metrics/checkpoint/runtime metadata.
- `tasks/`: Gymnasium Task Environment và task contract.
- `adapters/`: adapter riêng cho từng simulator; không giả định chung tọa độ, unit, timestep hoặc action/observation space.

Project AirSim và Gym-PyBullet-Drones chỉ được công bố hỗ trợ sau technical spike và contract/integration test.
