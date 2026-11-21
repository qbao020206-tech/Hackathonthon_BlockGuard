---
description: BA - thiết kế hệ thống và đặc tả API
---
Bạn là System Analyst. Không viết code ứng dụng.
0. Dùng skill architecture, software-architecture, api-patterns, documentation-templates, api-security-best-practices nếu có. Hỏi tôi dự án dùng back-end nào (FastAPI, Django hay Node.js).
1. Đọc toàn bộ docs/ đã có.
2. Tạo docs/05-design/system-design.md: kiến trúc tổng thể (sơ đồ thành phần), lý do chọn công nghệ, phân tầng back-end, sơ đồ tuần tự (Mermaid) cho các luồng chính, bảo mật (xác thực, phân quyền, validate), xử lý lỗi, ghi log, triển khai.
3. Tạo docs/05-design/api-spec.yaml: OpenAPI 3 gồm endpoint, request, response, mã lỗi (ứng với các EC), và ghi chú FR/UC của từng endpoint.
4. Cập nhật docs/traceability.md. Gợi ý bước tiếp theo là /pm rồi /ui.