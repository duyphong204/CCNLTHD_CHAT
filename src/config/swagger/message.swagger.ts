import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  sendMessageSchema,
  editMessageSchema,
} from "../../validators/message.validator";
import { MessageSchema, ErrorResponseSchema } from "./schemas";

export const registerMessageSwaggerPaths = (registry: OpenAPIRegistry) => {
  // POST - Gửi tin nhắn
  registry.registerPath({
    method: "post",
    path: "/message/send",
    tags: ["Messages"],
    summary: "Gửi tin nhắn",
    security: [{ cookieAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: sendMessageSchema.openapi("SendMessageRequest"),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Gửi tin nhắn thành công",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
              data: MessageSchema,
            }),
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

  // PATCH - Chỉnh sửa tin nhắn
  registry.registerPath({
    method: "patch",
    path: "/message/{id}",
    tags: ["Messages"],
    summary: "Chỉnh sửa tin nhắn",
    security: [{ cookieAuth: [] }],
    request: {
      params: z.object({
        id: z.string().describe("ID của tin nhắn"),
      }),
      body: {
        content: {
          "application/json": {
            schema: editMessageSchema.openapi("EditMessageRequest"),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Chỉnh sửa tin nhắn thành công",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
              data: MessageSchema,
            }),
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
      401: {
        description: "Chưa đăng nhập hoặc token không hợp lệ",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      403: {
        description: "Không có quyền chỉnh sửa tin nhắn này",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  // DELETE - Xóa tin nhắn
  registry.registerPath({
    method: "delete",
    path: "/message/{id}",
    tags: ["Messages"],
    summary: "Xóa tin nhắn",
    security: [{ cookieAuth: [] }],
    request: {
      params: z.object({
        id: z.string().describe("ID của tin nhắn"),
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              chatId: z
                .string()
                .describe("ID của cuộc trò chuyện chứa tin nhắn"),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Xóa tin nhắn thành công",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
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
      401: {
        description: "Chưa đăng nhập hoặc token không hợp lệ",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      403: {
        description: "Không có quyền xóa tin nhắn này",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });
};
