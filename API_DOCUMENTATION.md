# 🚀 SEMO Backend API Documentation

## 📋 Table of Contents
- [Authentication](#authentication)
- [Users API](#users-api)
- [Scooters API](#scooters-api)
- [Rentals API](#rentals-api)
- [Maintenance Logs API](#maintenance-logs-api)
- [Error Handling](#error-handling)
- [Security](#security)

---

## 🔐 Authentication

### Register New User
**POST** `/api/auth/register`

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phoneNumber": "0123456789"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "phoneNumber": "0123456789",
  "role": "CUSTOMER",
  "createdAt": "2026-04-20T21:43:20",
  "updatedAt": "2026-04-20T21:43:20"
}
```

**Validations:**
- ✅ Email must be valid format
- ✅ Password must be at least 8 characters
- ✅ Email must be unique
- ✅ fullName and phoneNumber are required

---

### Login
**POST** `/api/auth/login`

Authenticate user and get JWT token.

Tài khoản admin seeded sẵn để test:

```json
{
  "email": "admin@semo.com",
  "password": "Admin@123"
}
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "CUSTOMER",
  "userId": 1
}
```

**Store the token and use it in subsequent requests:**
```
Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...
```

Token trả về chứa `role` và `userId`. Khi gọi các endpoint quản trị như `/api/users`, hãy đăng nhập bằng tài khoản admin và truyền token trong header `Authorization`.

---

## 👤 Users API

### Get All Users
**GET** `/api/users`

Retrieve all users.

**Access:** `ADMIN` only. Endpoint này yêu cầu JWT token của admin.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "email": "user1@example.com",
    "fullName": "John Doe",
    "phoneNumber": "0123456789",
    "role": "CUSTOMER",
    "createdAt": "2026-04-20T21:43:20",
    "updatedAt": "2026-04-20T21:43:20"
  },
  {
    "id": 2,
    "email": "user2@example.com",
    "fullName": "Jane Smith",
    "phoneNumber": "9876543210",
    "role": "ADMIN",
    "createdAt": "2026-04-20T21:50:00",
    "updatedAt": "2026-04-20T21:50:00"
  }
]
```

---

### Get User by ID
**GET** `/api/users/{id}`

Retrieve a specific user by ID (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "phoneNumber": "0123456789",
  "role": "CUSTOMER",
  "createdAt": "2026-04-20T21:43:20",
  "updatedAt": "2026-04-20T21:43:20"
}
```

---

### Get User by Email
**GET** `/api/users/by-email?email=user@example.com`

Retrieve a user by email (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "phoneNumber": "0123456789",
  "role": "CUSTOMER",
  "createdAt": "2026-04-20T21:43:20",
  "updatedAt": "2026-04-20T21:43:20"
}
```

---

### Get Users by Role
**GET** `/api/users/by-role?role=ADMIN`

Retrieve all users with a specific role.

**Access:** requires authentication. Thực tế thường dùng với token admin khi quản trị.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `role` (string): ADMIN, CUSTOMER, etc.

**Response (200 OK):**
```json
[
  {
    "id": 2,
    "email": "admin@example.com",
    "fullName": "Jane Smith",
    "phoneNumber": "9876543210",
    "role": "ADMIN",
    "createdAt": "2026-04-20T21:50:00",
    "updatedAt": "2026-04-20T21:50:00"
  }
]
```

---

### Create User
**POST** `/api/users`

Create a new user.

**Access:** `ADMIN` only. Endpoint này cũng cần JWT token của admin.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "New User",
  "phoneNumber": "5555555555"
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "email": "newuser@example.com",
  "fullName": "New User",
  "phoneNumber": "5555555555",
  "role": "CUSTOMER",
  "createdAt": "2026-04-20T22:00:00",
  "updatedAt": "2026-04-20T22:00:00"
}
```

---

### Update User
**PUT** `/api/users/{id}`

Update user information (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "email": "newemail@example.com",
  "fullName": "Updated Name",
  "phoneNumber": "1111111111",
  "password": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "newemail@example.com",
  "fullName": "Updated Name",
  "phoneNumber": "1111111111",
  "role": "CUSTOMER",
  "createdAt": "2026-04-20T21:43:20",
  "updatedAt": "2026-04-20T22:05:00"
}
```

---

### Delete User
**DELETE** `/api/users/{id}`

Delete a user account (ADMIN only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (204 No Content)**

---

### Admin: Reset User Password
**POST** `/api/users/{id}/reset-password`

Reset a user's password (ADMIN only). Admin can provide a `newPassword` in the body, otherwise the backend will generate a temporary password and return it once in the response.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request (optional):**
```json
{
  "newPassword": "OptionalNewPass@123"
}
```

**Response (200 OK):**
```json
{
  "newPassword": "GeneratedOrProvidedPlaintextPass"
}
```

> Security note: the plaintext returned is only shown once by the API; admin should communicate it securely to the user and the user must change it on first login.

---

### Change Password (User)
**PUT** `/api/users/{id}/change-password`

Authenticated user can change their own password by providing the current password and new password. Admins should use the reset endpoint instead.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "currentPassword": "OldPass@123",
  "newPassword": "NewPass@123"
}
```

**Response:**
204 No Content


---

### Check Email Exists
**GET** `/api/users/check-email?email=user@example.com`

Check if an email is already registered (public endpoint).

**Response (200 OK):**
```json
true
```
or
```json
false
```

---

## 🛴 Scooters API

### Get All Scooters
**GET** `/api/scooters`

Retrieve all scooters.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "licensePlate": "ABC123",
    "status": "AVAILABLE",
    "location": "Downtown",
    "batteryLevel": 100,
    "createdAt": "2026-04-20T10:00:00",
    "updatedAt": "2026-04-20T10:00:00"
  }
]
```

---

### Get Scooters (Paginated)
**GET** `/api/scooters/paged?page=0&size=10`

Retrieve scooters with pagination.

**Query Parameters:**
- `page` (int, default: 0): Page number (0-indexed)
- `size` (int, default: 10): Number of records per page

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "licensePlate": "ABC123",
      "status": "AVAILABLE",
      "location": "Downtown",
      "batteryLevel": 100,
      "createdAt": "2026-04-20T10:00:00",
      "updatedAt": "2026-04-20T10:00:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 5,
  "totalPages": 1
}
```

---

### Get Scooters by Status
**GET** `/api/scooters/status?status=AVAILABLE`

Filter scooters by status.

**Query Parameters:**
- `status` (string, default: AVAILABLE): AVAILABLE, IN_USE, MAINTENANCE, DISABLED

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "licensePlate": "ABC123",
    "status": "AVAILABLE",
    "location": "Downtown",
    "batteryLevel": 100,
    "createdAt": "2026-04-20T10:00:00",
    "updatedAt": "2026-04-20T10:00:00"
  }
]
```

---

### Get Scooter by ID
**GET** `/api/scooters/{id}`

Get a specific scooter.

**Response (200 OK):**
```json
{
  "id": 1,
  "licensePlate": "ABC123",
  "status": "AVAILABLE",
  "location": "Downtown",
  "batteryLevel": 100,
  "createdAt": "2026-04-20T10:00:00",
  "updatedAt": "2026-04-20T10:00:00"
}
```

---

### Create Scooter
**POST** `/api/scooters`

Create a new scooter (ADMIN only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "licensePlate": "XYZ789",
  "status": "AVAILABLE",
  "location": "Uptown",
  "batteryLevel": 95
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "licensePlate": "XYZ789",
  "status": "AVAILABLE",
  "location": "Uptown",
  "batteryLevel": 95,
  "createdAt": "2026-04-20T14:00:00",
  "updatedAt": "2026-04-20T14:00:00"
}
```

---

### Update Scooter
**PUT** `/api/scooters/{id}`

Update scooter information (ADMIN only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "status": "MAINTENANCE",
  "location": "Service Center",
  "batteryLevel": 50
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "licensePlate": "ABC123",
  "status": "MAINTENANCE",
  "location": "Service Center",
  "batteryLevel": 50,
  "createdAt": "2026-04-20T10:00:00",
  "updatedAt": "2026-04-20T15:30:00"
}
```

---

## 🚗 Rentals API

### Get All Rentals
**GET** `/api/rentals`

Retrieve all rentals (public).

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "scooterId": 1,
    "startTime": "2026-04-20T10:00:00",
    "endTime": "2026-04-20T10:30:00",
    "totalPrice": 15000,
    "status": "COMPLETED",
    "createdAt": "2026-04-20T10:00:00",
    "updatedAt": "2026-04-20T10:30:00"
  }
]
```

---

### Get Rentals by User
**GET** `/api/rentals/user/{userId}`

Get all rentals for a specific user (CUSTOMER needs token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "scooterId": 1,
    "startTime": "2026-04-20T10:00:00",
    "endTime": "2026-04-20T10:30:00",
    "totalPrice": 15000,
    "status": "COMPLETED",
    "createdAt": "2026-04-20T10:00:00",
    "updatedAt": "2026-04-20T10:30:00"
  }
]
```

---

### Create Rental
**POST** `/api/rentals`

Create a new rental (CUSTOMER must have token).

**Headers:**
```
Authorization: Bearer <customer_token>
```

**Request:**
```json
{
  "userId": 1,
  "scooterId": 1,
  "startTime": "2026-04-20T10:00:00"
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "userId": 1,
  "scooterId": 1,
  "startTime": "2026-04-20T10:00:00",
  "endTime": null,
  "totalPrice": 0,
  "status": "ACTIVE",
  "createdAt": "2026-04-20T10:00:00",
  "updatedAt": "2026-04-20T10:00:00"
}
```

---

## 🔧 Maintenance Logs API

### Get All Maintenance Logs
**GET** `/api/maintenance`

Retrieve all maintenance logs (ADMIN only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "scooterId": 1,
    "maintenanceDate": "2026-04-20T09:00:00",
    "description": "Battery replacement",
    "cost": 500000,
    "createdAt": "2026-04-20T09:00:00",
    "updatedAt": "2026-04-20T09:00:00"
  }
]
```

---

### Create Maintenance Log
**POST** `/api/maintenance`

Record maintenance work (ADMIN only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "scooterId": 1,
  "maintenanceDate": "2026-04-20T09:00:00",
  "description": "Brake inspection and adjustment",
  "cost": 250000
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "scooterId": 1,
  "maintenanceDate": "2026-04-20T09:00:00",
  "description": "Brake inspection and adjustment",
  "cost": 250000,
  "createdAt": "2026-04-20T09:00:00",
  "updatedAt": "2026-04-20T09:00:00"
}
```

---

## ❌ Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "timestamp": "2026-04-20T21:43:20",
  "status": 400,
  "error": "Bad Request",
  "message": "Email hoặc mật khẩu không đúng"
}
```

**401 Unauthorized**
```json
{
  "timestamp": "2026-04-20T21:43:20",
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is missing or invalid"
}
```

**403 Forbidden**
```json
{
  "timestamp": "2026-04-20T21:43:20",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied. Admin role required."
}
```

**404 Not Found**
```json
{
  "timestamp": "2026-04-20T21:43:20",
  "status": 404,
  "error": "Not Found",
  "message": "Không tìm thấy User với ID: 999"
}
```

**500 Internal Server Error**
```json
{
  "timestamp": "2026-04-20T21:43:20",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## 🔒 Security

### Authentication
- All protected endpoints require JWT token in Authorization header
- Token format: `Authorization: Bearer <token>`
- Token expires after 24 hours
- Password is hashed with BCrypt (never stored in plain text)

### Authorization (Role-Based Access Control)

| Endpoint | Role Required |
|----------|---------------|
| POST /api/users | ADMIN |
| GET /api/users | ADMIN |
| GET /api/users/{id} | Authenticated |
| GET /api/users/by-email | Authenticated |
| GET /api/users/by-role | Authenticated |
| PUT /api/users/{id} | Authenticated |
| DELETE /api/users/{id} | ADMIN |
| GET /api/users/check-email | Public |
| POST /api/auth/register | Public |
| POST /api/auth/login | Public |
| POST /api/scooters | ADMIN |
| GET /api/scooters | Public |
| GET /api/scooters/{id} | Public |
| PUT /api/scooters/{id} | ADMIN |
| POST /api/rentals | CUSTOMER |
| GET /api/rentals | Public |
| POST /api/maintenance | ADMIN |
| GET /api/maintenance | ADMIN |

---

## 🧪 Testing with Postman

### 1. Register User
```
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "Test@1234",
  "fullName": "Test User",
  "phoneNumber": "0901234567"
}
```

### 2. Login
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "admin@semo.com",
  "password": "Admin@123"
}
```

### 3. Use Token in Subsequent Requests
```
GET http://localhost:8080/api/users
Authorization: Bearer <admin_token_from_login>
Content-Type: application/json
```

---

**Last Updated:** May 27, 2026  
**Version:** 1.1
