# Local artifact storage layout

Runtime có thể dùng các vùng `data/`, `staging/` và `quarantine/`. Nội dung các vùng này bị ignore; database chỉ giữ metadata, reference, checksum và trạng thái. Luồng ghi bắt buộc là staging → verify → atomic commit → available.
