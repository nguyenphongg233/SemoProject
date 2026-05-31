# API Documentation

Tài liệu này tổng hợp các endpoint hiện có trong Backend.  
Ký hiệu `{{baseUrl}}` là địa chỉ backend, ví dụ: `http://localhost:8888`.

## Tài khoản mặc định

- Customer: `customer@semo.com` / `Customer@123`

## Ghi chú chung

- Các request cần đăng nhập phải gắn JWT ở header `Authorization: Bearer <token>`.
- Endpoint quản trị yêu cầu role `ADMIN`.
- Upload dùng `multipart/form-data` với field tên `file`.

## 1. Auth API

| API | Cú pháp | Mục đích |
|---|---|---|
| `POST /api/auth/register` | `POST {{baseUrl}}/api/auth/register` | Đăng ký tài khoản mới |
| `POST /api/auth/login` | `POST {{baseUrl}}/api/auth/login` | Đăng nhập và nhận JWT token |

## 2. User API

| API | Cú pháp | Mục đích |
|---|---|---|
| `POST /api/users` | `POST {{baseUrl}}/api/users` | Tạo user mới |
| `GET /api/users` | `GET {{baseUrl}}/api/users` | Lấy danh sách tất cả user |
| `GET /api/users/{id}` | `GET {{baseUrl}}/api/users/1` | Lấy user theo ID |
| `GET /api/users/by-email?email=...` | `GET {{baseUrl}}/api/users/by-email?email=user@example.com` | Lấy user theo email |
| `GET /api/users/by-role?role=...` | `GET {{baseUrl}}/api/users/by-role?role=ADMIN` | Lấy danh sách user theo vai trò |
| `GET /api/users/check-email?email=...` | `GET {{baseUrl}}/api/users/check-email?email=user@example.com` | Kiểm tra email đã tồn tại hay chưa |
| `PUT /api/users/{id}` | `PUT {{baseUrl}}/api/users/1` | Cập nhật thông tin user |
| `DELETE /api/users/{id}` | `DELETE {{baseUrl}}/api/users/1` | Xóa user |
| `POST /api/users/{id}/reset-password` | `POST {{baseUrl}}/api/users/1/reset-password` | Admin đặt lại mật khẩu cho user |
| `PUT /api/users/{id}/change-password` | `PUT {{baseUrl}}/api/users/1/change-password` | User tự đổi mật khẩu hoặc admin đổi theo quyền |
| `POST /api/users/wallet/deposit` | `POST {{baseUrl}}/api/users/wallet/deposit` | Nạp tiền vào ví user |

## 3. Scooter API

| API | Cú pháp | Mục đích |
|---|---|---|
| `POST /api/scooters` | `POST {{baseUrl}}/api/scooters` | Tạo scooter mới |
| `GET /api/scooters` | `GET {{baseUrl}}/api/scooters` | Lấy toàn bộ scooter |
| `GET /api/scooters/paged?page=0&size=10` | `GET {{baseUrl}}/api/scooters/paged?page=0&size=10` | Lấy scooter theo phân trang |
| `GET /api/scooters/status?status=AVAILABLE` | `GET {{baseUrl}}/api/scooters/status?status=AVAILABLE` | Lấy scooter theo trạng thái |
| `GET /api/scooters/{id}` | `GET {{baseUrl}}/api/scooters/1` | Lấy scooter theo ID |
| `PUT /api/scooters/{id}` | `PUT {{baseUrl}}/api/scooters/1` | Cập nhật scooter |

## 4. Rental API

| API | Cú pháp | Mục đích |
|---|---|---|
| `POST /api/rentals/start` | `POST {{baseUrl}}/api/rentals/start` | Bắt đầu thuê xe |
| `PUT /api/rentals/{id}/end` | `PUT {{baseUrl}}/api/rentals/1/end` | Kết thúc thuê xe / trả xe |

## 5. Maintenance API

| API | Cú pháp | Mục đích |
|---|---|---|
| `POST /api/maintenance` | `POST {{baseUrl}}/api/maintenance` | Tạo maintenance log mới |
| `GET /api/maintenance/scooter/{scooterId}` | `GET {{baseUrl}}/api/maintenance/scooter/1` | Lấy danh sách maintenance log theo scooter |

## 6. Analytics API

| API | Cú pháp | Mục đích |
|---|---|---|
| `GET /api/analytics/optimal-stations?k=3` | `GET {{baseUrl}}/api/analytics/optimal-stations?k=3` | Tính toán các trạm sạc tối ưu |

## 7. Upload API

| API | Cú pháp | Mục đích |
|---|---|---|
| `POST /api/upload/avatar` | `POST {{baseUrl}}/api/upload/avatar` | Upload avatar cho user |
| `POST /api/upload/scooter/{scooterId}` | `POST {{baseUrl}}/api/upload/scooter/1` | Upload hình ảnh cho scooter |

## Ghi chú nhanh

- Một số endpoint yêu cầu JWT token hoặc quyền `ADMIN` theo cấu hình bảo mật của project.
- Cú pháp trong bảng là dạng gọi API thực tế, chỉ thay `{{baseUrl}}` bằng địa chỉ backend đang chạy.
