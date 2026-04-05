# CCNLTHD_CHAT — Backend (Express + TypeScript)

Backend cho đồ án **“Tìm hiểu và xây dựng dịch vụ Backend với Express”** (Messenger/Chat backend).

Hệ thống cung cấp:

- REST API cho **Auth** và **Chat**.
- **Swagger UI** để xem tài liệu API.
- Kết nối **MongoDB** qua **Mongoose**.
- **Socket.IO** cho realtime (online users, join/leave chat room, emit sự kiện chat/message).

> Server mặc định chạy tại `http://localhost:8000` (có thể thay đổi bằng biến môi trường `PORT`).

---

## 1) Công nghệ sử dụng

- **Node.js + Express (v5)**: xây dựng REST API.
- **TypeScript**: gõ tĩnh, dễ bảo trì.
- **MongoDB + Mongoose**: lưu trữ dữ liệu.
- **JWT (cookie-based)** + **Passport-JWT**: xác thực người dùng.
- **Zod**: validate dữ liệu request.
- **Swagger (OpenAPI)**: tài liệu API tại `/docs`.
- **Socket.IO**: realtime.
- **Morgan**: logging request.
- **Docker & Docker Compose**: containerization & orchestration.

---

## 2) Kiến trúc & cấu trúc thư mục (tổng quan)

Dự án tổ chức theo hướng phân lớp (layered):

- `src/index.ts`: khởi tạo Express app, middleware, routes, swagger.
- `src/routes/`: định nghĩa endpoint.
- `src/controllers/`: nhận request, validate, gọi service, trả response.
- `src/services/`: business logic.
- `src/repositories/`: tầng truy cập dữ liệu (data access).
- `src/models/`: Mongoose schema/model.
- `src/config/`: cấu hình env, database, passport, swagger,...
- `src/middlewares/`: middleware dùng chung (vd: `asyncHandler`).
- `src/lib/socket.ts`: cấu hình Socket.IO + events.
- `src/container/di-container.ts`: DI Container (khởi tạo & inject dependency).

---

## 3) Cài đặt & chạy project

### 3.1 Yêu cầu

**Option 1: Chạy Local**

- Node.js (khuyến nghị >= 18)
- MongoDB (local hoặc MongoDB Atlas)

**Option 2: Chạy với Docker**

- Docker & Docker Compose

---

### 3.2 Cài dependencies (Local only)

```bash
npm install
```

### 3.3 Cấu hình môi trường (.env)

Tạo file `.env` ở root (tham khảo các key trong `src/config/env.config.ts`):

```env
NODE_ENV=development
PORT=8000

MONGO_URI=mongodb://localhost:27017/ccnlthd_chat

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=15m

FRONTEND_ORIGIN=http://localhost:5173

# Cloudinary (nếu dùng upload)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3.4 Chạy server

#### **Cách 1: Chạy Local**

- Chạy dev (nodemon):

```bash
npm run dev
```

- Chạy production (cần build ra `dist/` trước):

```bash
npm run build
npm start
```

#### **Cách 2: Chạy với Docker Compose (Khuyến nghị)**

```bash
docker compose up --build
```

**Lợi ích:**

- ✅ Tự động cài đặt dependencies
- ✅ MongoDB chạy trong container
- ✅ Hot reload với nodemon
- ✅ Không cần cài MongoDB locally
- ✅ Môi trường giống nhất với production

**Dừng services:**

```bash
docker compose down
```

**Xem logs:**

```bash
docker compose logs -f app
```

**Reset hoàn toàn (xóa MongoDB data):**

```bash
docker compose down -v
docker compose up --build
```

---

## 4) Docker Configuration

### 4.1 Files

- **Dockerfile**: Build production-ready image
- **docker-compose.yml**: Orchestrate app + MongoDB services
- **.dockerignore**: Exclude unnecessary files

### 4.2 Docker Environment

Docker Compose tự động cấu hình:

```yaml
App Service:
  - Port: 8000
  - Environment: NODE_ENV=development
  - MongoDB: mongodb://admin:password123@mongodb:27017/chat_db
  - Hot reload: Enabled (nodemon + volume)

MongoDB Service:
  - Port: 27017
  - Username: admin
  - Password: password123
  - Volume: Persist data in named volume
```

### 4.3 Troubleshooting Docker

**Container không chạy?**

```bash
# Xem logs chi tiết
docker compose logs app

# Rebuild từ đầu
docker compose build --no-cache
docker compose up
```

**Port đã sử dụng?**

Sửa port trong `docker-compose.yml` hoặc dừng process sử dụng port.

---

## 5) Endpoints & Swagger

### 5.1 Swagger UI

- Swagger UI: `GET /docs`

### 5.2 API chính (đã gồm prefix `/api`)

**Auth**

- `POST /api/auth/register` — Đăng ký
- `POST /api/auth/login` — Đăng nhập
- `POST /api/auth/logout` — Đăng xuất
- `POST /api/auth/status` — Kiểm tra trạng thái đăng nhập (cần JWT cookie)

**Chat (cần đăng nhập)**

- `POST /api/chat/create` — Tạo chat 1-1 hoặc group
- `GET /api/chat/all` — Lấy danh sách chat của user
- `GET /api/chat/:id` — Lấy chi tiết chat + messages

---

## 6) Xác thực (JWT Cookie)

Hệ thống dùng **JWT lưu trong cookie** tên `accessToken`:

- Cookie dạng `httpOnly` giúp hạn chế rủi ro bị JS đọc token.
- Passport-JWT đọc token từ cookie, verify và gắn user vào `req.user`.

---

## 7) Realtime (Socket.IO)

Module realtime nằm ở `src/lib/socket.ts`:

- Xác thực socket bằng JWT lấy từ cookie trong handshake.
- Quản lý user online (`userId -> socketId`).
- Rooms:
  - `user:<userId>`: room riêng cho từng user
  - `chat:<chatId>`: room theo cuộc trò chuyện

Sự kiện phổ biến:

- `online:users`: broadcast danh sách user online
- `chat:join`, `chat:leave`: tham gia/rời room chat
- `chat:new`: tạo chat mới
- `message:new`: có tin nhắn mới
- `chat:update`: cập nhật last message

---

## 8) Gợi ý kiểm thử

- Dùng **Postman** để test REST API.
- Với các API cần đăng nhập: đăng nhập trước để nhận cookie `accessToken`, sau đó gọi các endpoint protected.
- Xem chi tiết schema request/response tại Swagger `/docs`.

---

## 8) Thông tin đồ án

**TRƯỜNG ĐẠI HỌC SÀI GÒN — KHOA CÔNG NGHỆ THÔNG TIN**  
Môn: **Công Nghệ Lập Trình Hiện Đại**  
Đề tài: **Tìm hiểu và xây dựng dịch vụ Backend với Express**  
Thời gian: **03/2026**
