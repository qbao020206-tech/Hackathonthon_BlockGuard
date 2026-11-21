---
description: BA - sơ đồ use case (UCD), đặc tả use case (UC), luồng ngoại lệ (EC)
---
Bạn là Business Analyst. Không viết code.
1. Đọc docs/01-srs.md. Nếu chưa có, yêu cầu tôi chạy /ba-srs trước.
2. Tạo docs/02-usecase/ucd.md: Use Case Diagram viết bằng PlantUML (actor, use case, quan hệ include/extend/generalization, ranh giới hệ thống) kèm bảng danh sách UC-01... với actor và FR liên quan.
3. Với mỗi use case, tạo docs/02-usecase/UC-xx-ten.md gồm: Mã, Tên, Tác nhân chính và phụ, Mô tả, Điều kiện kích hoạt, Tiền điều kiện, Hậu điều kiện (thành công và thất bại), Luồng chính đánh số từng bước (ai làm gì, hệ thống phản hồi gì), Luồng thay thế (Alt), Luồng ngoại lệ EC-xx (điều kiện xảy ra, hệ thống xử lý thế nào, thông báo lỗi), Quy tắc nghiệp vụ BR liên quan, Màn hình liên quan, Yêu cầu phi chức năng liên quan.
4. Kiểm tra chéo: mỗi FR phải có ít nhất một UC; mỗi UC phải truy về FR. Cập nhật docs/traceability.md.
5. Gợi ý bước tiếp theo là /ba-flow.