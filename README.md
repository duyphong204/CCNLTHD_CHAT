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

- Node.js (khuyến nghị >= 18)
- MongoDB (local hoặc MongoDB Atlas)

### 3.2 Cài dependencies

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

Theo `package.json`:

- Chạy dev (nodemon):

```bash
npm run dev
```

- Chạy production (cần build ra `dist/` trước):

```bash
npm run start
```

> Ghi chú: script `start` đang chạy `node dist/index.ts`, vì vậy cần đảm bảo bạn có bước build TypeScript ra thư mục `dist/` khi deploy.

---

## 4) Endpoints & Swagger

### 4.1 Swagger UI

- Swagger UI: `GET /docs`

### 4.2 API chính (đã gồm prefix `/api`)

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

## 5) Xác thực (JWT Cookie)

Hệ thống dùng **JWT lưu trong cookie** tên `accessToken`:
- Cookie dạng `httpOnly` giúp hạn chế rủi ro bị JS đọc token.
- Passport-JWT đọc token từ cookie, verify và gắn user vào `req.user`.

---

## 6) Realtime (Socket.IO)

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

## 7) Gợi ý kiểm thử

- Dùng **Postman** để test REST API.
- Với các API cần đăng nhập: đăng nhập trước để nhận cookie `accessToken`, sau đó gọi các endpoint protected.
- Xem chi tiết schema request/response tại Swagger `/docs`.

---

## 8) Thông tin đồ án

**TRƯỜNG ĐẠI HỌC SÀI GÒN — KHOA CÔNG NGHỆ THÔNG TIN**  
Môn: **Công Nghệ Lập Trình Hiện Đại**  
Đề tài: **Tìm hiểu và xây dựng dịch vụ Backend với Express**  
Thời gian: **03/2026**