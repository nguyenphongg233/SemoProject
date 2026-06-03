# 🛵 SEMO (Smart E-Scooter Fleet Management & Battery Optimization) - Backend Project Status

**Tech Stack:** Java, Spring Boot, Spring Data JPA, Spring Security (JWT), MySQL, WebSocket.

---

## I. Nhóm Hạ Tầng & Bảo Mật (Infrastructure & Security)
**✅ Đã hoàn thành:**
* Xác thực và phân quyền bằng JWT Token.
* Phân chia 2 Role: `ADMIN` và `CUSTOMER`.
* Xử lý lỗi truy cập (403 Forbidden, 401 Unauthorized).
* Chống IDOR tuyệt đối cho các API tài khoản và nghiệp vụ thuê xe (chuẩn `/me`).

**🚀 Chưa làm:**
* (Hiện tại hạ tầng bảo mật đã hoàn chỉnh).

---

## II. Nhóm Quản Lý Cơ Bản (CRUD)
**✅ Đã hoàn thành:**
* **User CRUD:** Đăng ký, xem thông tin cá nhân, xem danh sách (Admin).
* **User Profile:** Cập nhật thông tin (Partial Update - `UserUpdateRequestDTO`).
* **Scooter CRUD:** Admin thêm xe mới, cập nhật trạng thái/pin/tọa độ, xem danh sách (có phân trang).
* **Feedback CRUD:** Khách hàng đánh giá (1-5 sao) và bình luận chuyến đi đã hoàn thành (Unique constraint).

**🚀 Chưa làm:**
* (Các chức năng CRUD cốt lõi đã đầy đủ).

---

## III. Nhóm Nghiệp Vụ & Tài Chính (Core Business & Finance)
**✅ Đã hoàn thành:**
* **Ví điện tử:** Nạp tiền (Deposit), quản lý số dư (`balance`).
* **Luồng Thuê Xe (Rental Core):** Bắt đầu chuyến (`IN_USE`), kết thúc chuyến (`AVAILABLE`).
* **Tính toán cước:** Tự động trừ cọc (50.000 VNĐ), hoàn cọc, tính cước thời gian thực (1.000 VNĐ/phút).
* **Lịch sử giao dịch:** Ghi vết tự động minh bạch (`DEPOSIT`, `RENTAL_DEPOSIT`, `RENTAL_REFUND`, `RENTAL_PAYMENT`).
* **Tài khoản nâng cao:** Khách hàng tự đổi mật khẩu, Admin cấp lại mật khẩu.
* **Quản lý Nợ (Debt Management):** Ghi nhận số dư âm, chặn khách hàng đang nợ thuê chuyến mới.

**🚀 Chưa làm:**
* [ ] **Cấu hình hệ thống (System Config):** Tạo bảng cấu hình để lưu các tham số động như Giá cọc, Giá thuê thay vì fix cứng trong code.

---

## IV. Nhóm Quản Trị & Thống Kê & Phân Tích Dữ Liệu (Admin & Analytics)
**✅ Đã hoàn thành:**
* **Admin Dashboard:** Thống kê tổng doanh thu, tổng số chuyến đi, số xe đang chạy, tỷ lệ xe theo trạng thái.
* **Quản lý lịch sử:** Admin xem toàn bộ lịch sử thuê xe (hỗ trợ bộ lọc filter).
* **Kiểm duyệt User:** Khóa (Ban) và Mở khóa (Unban) tài khoản vi phạm.
* **Khôi phục xe (Maintenance):** API chuyển trạng thái xe từ `MAINTENANCE` về `AVAILABLE` sau khi bảo trì/sửa chữa xong, tự động đưa các chỉ số pin và nhiệt độ về mức an toàn tối ưu.

**🚀 Chưa làm:**
* [ ] **Phân tích dữ liệu lớn (K-Means Clustering):** 🚨 *Tính năng đột phá:* Thu thập dữ liệu lịch sử các chuyến đi (tọa độ trả xe), chạy thuật toán K-Means phân cụm để tự động "chấm" không gian và đề xuất các vị trí tối ưu xây dựng trạm sạc mới.

---

## V. Nhóm Giám Sát Sức Khỏe Pin & Giả Lập IoT (Smart Battery & IoT Simulation)
**✅ Đã hoàn thành:**
* **Nâng cấp Entity Scooter (Smart Battery):** Bổ sung thành công các chỉ số chuyên sâu theo cam kết: Chu kỳ sạc (`cycleCount`), Mức độ chai pin (`stateOfHealth`), và Nhiệt độ pin (`temperature`).
* **Giả lập IoT (Digital Twin):** Triển khai Scheduled Tasks (CRON jobs) chạy ngầm mỗi 5 giây để giả lập luồng dữ liệu động từ xa: Tự động di chuyển tọa độ GPS, tiêu hao pin và thay đổi nhiệt độ thực tế khi xe ở trạng thái `IN_USE`.
* **Auto-Maintenance Thông Minh:** 🚨 *Tính năng đột phá:* Thuật toán tự động quét hệ thống, cô lập và khóa xe chuyển sang trạng thái `MAINTENANCE` nếu phát hiện pin yếu (< 10%) hoặc pin quá nhiệt (> 60°C) nguy hiểm, đồng thời lưu vết vào hệ thống `MaintenanceLog`.

**🚀 Chưa làm:**
* [ ] **Xếp lịch sạc tự động:** Tự động hóa xếp lịch sạc pin dựa trên mức năng lượng còn lại của từng xe.

---

## VI. Nhóm Tương Tác Thời Gian Thực & Bản Đồ (Real-time GIS)
**✅ Đã hoàn thành:**
* **WebSocket Tracking:** Tích hợp thành công cấu hình mạng STOMP/WebSocket công khai (`/ws`), tự động truyền tải và cập nhật luồng dữ liệu di chuyển động của dàn xe lên Admin Dashboard theo thời gian thực mà không cần reload trang.

**🚀 Chưa làm:**
* [ ] **Geofencing (Hàng rào địa lý):** Thuật toán cảnh báo thời gian thực nếu hệ thống phát hiện tọa độ xe di chuyển vượt quá ranh giới khu vực quy định (ví dụ: ra khỏi khuôn viên trường Đại học Bách Khoa Hà Nội).