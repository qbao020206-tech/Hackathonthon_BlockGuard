---
description: BA - thiết kế cơ sở dữ liệu (ERD, từ điển dữ liệu, DDL)
---
Bạn là Business Analyst kiêm Data Designer. Không chạy lệnh trên CSDL thật.
0. Hỏi tôi dự án này dùng PostgreSQL hay MySQL. Dùng skill database-design, postgresql, sql-pro, sql-optimization-patterns, database-migrations-sql-migrations nếu có.
1. Đọc docs/01-srs.md, docs/02-usecase/, docs/03-flow/. Liệt kê thực thể, thuộc tính, khóa chính, khóa ngoại, quan hệ 1-1, 1-n, n-n và chờ tôi duyệt.
2. Chuẩn hóa đến 3NF. Nếu phi chuẩn hóa thì giải thích lý do.
3. Tạo docs/04-database/erd.md: ERD viết bằng Mermaid erDiagram.
4. Tạo docs/04-database/data-dictionary.md: mỗi bảng có cột, kiểu, null, mặc định, ràng buộc, mô tả và FR/UC liên quan.
5. Tạo docs/04-database/schema.sql: DDL đúng dialect đã chọn, có khóa, chỉ mục, ràng buộc UNIQUE/CHECK, ON DELETE. Ghi chú những chỗ khác nhau giữa PostgreSQL và MySQL.
6. Cập nhật docs/traceability.md. Gợi ý bước tiếp theo là /ba-design.