import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { createChatSchema } from "../../validators/chat.validator";
import { ChatSchema, ErrorResponseSchema, MessageSchema } from "./schemas";

export const registerChatSwaggerPaths = (registry: OpenAPIRegistry) => {
  registry.registerPath({
    method: "post",
    path: "/chat/create",
    tags: ["Chat"],
    summary: "Tao chat 1-1 hoac group",
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
        description: "Tao hoac lay cuoc tro chuyen thanh cong",
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
        description: "Chua xac thuc",
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
    summary: "Lay danh sach cuoc tro chuyen cua nguoi dung",
    security: [{ cookieAuth: [] }],
    responses: {
      200: {
        description: "Lay danh sach thanh cong",
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
    summary: "Lay chi tiet cuoc tro chuyen theo id",
    security: [{ cookieAuth: [] }],
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Lay chi tiet cuoc tro chuyen thanh cong",
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
};
