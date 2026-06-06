# 🛵 SEMO (Smart E-Scooter Fleet Management & Battery Optimization) - Backend Project Status

**Tech Stack:** Java, Spring Boot, Spring Data JPA, Spring Security (JWT), MySQL, WebSocket, Spring Cache, Spring Mail.

---

## I. Nhóm Hạ Tầng & Bảo Mật (Infrastructure & Security)
**✅ Đã hoàn thành:**
* Xác thực và phân quyền bằng JWT Token.
* Phân chia 2 Role: `ADMIN` và `CUSTOMER`.
* Xử lý lỗi truy cập (403 Forbidden, 401 Unauthorized).
* Chống IDOR tuyệt đối cho các API tài khoản và nghiệp vụ thuê xe (chuẩn `/me`).
* **Global Exception Handling:** Xử lý lỗi tập trung chuẩn Clean Code, bắt mọi ngoại lệ (như `RuntimeException`) trả về chuẩn JSON không cần try-catch thủ công.
* **Identity & Access Management (IAM) & Email Verification:** Tách biệt luồng xác thực công khai (`AuthController`) và luồng quản trị nội bộ (`UserController`). Tích hợp gửi mã OTP xác thực qua Email (Google SMTP) để kích hoạt tài khoản. Sử dụng `SecureRandom` để sinh mã chuẩn mật mã học và xử lý bất đồng bộ (`@Async`) giúp tối ưu hiệu năng đăng ký.

**🚀 Chưa làm:**
* (Hiện tại hạ tầng bảo mật đã hoàn chỉnh).

---

## II. Nhóm Quản Lý Cơ Bản (CRUD)
**✅ Đã hoàn thành:**
* **User CRUD:** Đăng ký (kết hợp OTP), xem thông tin cá nhân, xem danh sách (Admin).
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
* **Lịch sử giao dịch & Đối soát (Audit):** Ghi vết tự động minh bạch (`DEPOSIT`, `RENTAL_DEPOSIT`, `RENTAL_REFUND`, `RENTAL_PAYMENT`). Bổ sung luồng API đặc quyền cho phép Admin xem toàn cảnh biến động số dư của toàn hệ thống và tra cứu chéo theo từng tài khoản khách hàng.
* **Tài khoản nâng cao:** Khách hàng tự đổi mật khẩu, Admin cấp lại mật khẩu.
* **Quản lý Nợ (Debt Management):** Ghi nhận số dư âm, chặn khách hàng đang nợ thuê chuyến mới.
* **Cấu hình hệ thống động (System Config):** Triển khai bảng Key-Value linh hoạt kết hợp Spring Cache và chuẩn hóa DTO để quản lý các tham số tài chính (Giá thuê, Giá cọc) hiệu năng cao mà không cần can thiệp mã nguồn.

**🚀 Chưa làm:**
* (Nhóm nghiệp vụ tài chính Giai đoạn 1 đã hoàn chỉnh).

---

## IV. Nhóm Quản Trị & Thống Kê & Phân Tích Dữ Liệu (Admin & Analytics)
**✅ Đã hoàn thành:**
* **Admin Dashboard:** Thống kê tổng doanh thu, tổng số chuyến đi, số xe đang chạy, tỷ lệ xe theo trạng thái, và tổng chi phí bảo trì.
* **Quản lý lịch sử:** Admin xem toàn bộ lịch sử thuê xe (hỗ trợ bộ lọc filter).
* **Kiểm duyệt User:** Khóa (Ban) và Mở khóa (Unban) tài khoản vi phạm.
* **Quy trình Bảo trì (Maintenance Workflow):** Tách biệt luồng báo hỏng (Create) và luồng nghiệm thu (Resolve). Tự động ghi nhận chi phí sửa chữa vào Dashboard. Ứng dụng thành công cơ chế **Dirty Checking** của Hibernate/JPA với `@Transactional` để tối ưu hóa hiệu năng cập nhật trạng thái xe.
* **Phân tích dữ liệu không gian (K-Means Clustering):** 🚨 *Tính năng đột phá:* Hoàn tất tích hợp thuật toán K-Means thuần (hiệu năng cao) để gom cụm tọa độ kết thúc của hàng ngàn chuyến đi lịch sử, tự động đề xuất K vị trí tối ưu để xây dựng trạm sạc mới trên Dashboard.

**🚀 Chưa làm:**
* (Giai đoạn 1 đã hoàn thành trọn vẹn nhóm chức năng này).

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
* **Lưu vết Tọa độ Lịch sử (GIS Tracking):** Tự động chụp và lưu trữ tọa độ `startLat`, `startLng`, `endLat`, `endLng` của từng chuyến đi để phục vụ bài toán Big Data.

**🚀 Chưa làm:**
* [ ] **Geofencing (Hàng rào địa lý):** Thuật toán cảnh báo thời gian thực nếu hệ thống phát hiện tọa độ xe di chuyển vượt quá ranh giới khu vực quy định (ví dụ: ra khỏi khuôn viên trường Đại học Bách Khoa Hà Nội).