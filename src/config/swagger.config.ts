import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { createChatSchema } from "../validators/chat.validator";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "cookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "accessToken",
});

const ErrorResponseSchema = z
  .object({
    message: z.string(),
  })
  .openapi("ErrorResponse");

const UserSchema = z
  .object({
    _id: z.string(),
    name: z.string(),
    email: z.string().email(),
    avatar: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .openapi("User");

const AuthResponseSchema = z
  .object({
    message: z.string(),
    user: UserSchema,
  })
  .openapi("AuthResponse");

const ChatSchema = z
  .object({
    _id: z.string(),
    participants: z.array(UserSchema).optional(),
    lastMessage: z.any().nullable().optional(),
    isGroup: z.boolean(),
    groupName: z.string().optional(),
    createdBy: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .openapi("Chat");

const MessageSchema = z
  .object({
    _id: z.string(),
    chatId: z.string(),
    sender: z.any(),
    content: z.string().optional(),
    image: z.string().optional(),
    replyTo: z.any().nullable().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .openapi("Message");

registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Đăng ký tài khoản",
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema.openapi("RegisterRequest"),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Đăng ký thành công",
      content: {
        "application/json": {
          schema: AuthResponseSchema,
        },
      },
    },
    400: {
      description: "Dữ liệu đầu vào không hợp lệ",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Đăng nhập",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema.openapi("LoginRequest"),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Đăng nhập thành công",
      content: {
        "application/json": {
          schema: AuthResponseSchema,
        },
      },
    },
    401: {
      description: "Sai thông tin đăng nhập",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  summary: "Đăng xuất",
  responses: {
    200: {
      description: "Đăng xuất thành công",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/status",
  tags: ["Auth"],
  summary: "Kiểm tra trạng thái xác thực",
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: "Người dùng đã xác thực",
      content: {
        "application/json": {
          schema: AuthResponseSchema,
        },
      },
    },
    401: {
      description: "Chưa đăng nhập hoặc token không hợp lệ",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/chat/create",
  tags: ["Chat"],
  summary: "Tạo chat 1-1 hoặc group",
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createChatSchema.openapi("CreateChatRequest"),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Tạo hoặc lấy cuộc trò chuyện thành công",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            chat: ChatSchema,
          }),
        },
      },
    },
    401: {
      description: "Chưa xác thực",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/chat/all",
  tags: ["Chat"],
  summary: "Lấy danh sách cuộc trò chuyện của người dùng",
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: "Lấy danh sách thành công",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            chats: z.array(ChatSchema),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/chat/{id}",
  tags: ["Chat"],
  summary: "Lấy chi tiết cuộc trò chuyện theo id",
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Lấy chi tiết cuộc trò chuyện thành công",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            chat: ChatSchema,
            messages: z.array(MessageSchema),
          }),
        },
      },
    },
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerSpec = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Chat API",
    version: "1.0.0",
    description: "API documentation (generated from Zod)",
  },
  servers: [
    {
      url: "http://localhost:8000/api",
    },
  ],
});
