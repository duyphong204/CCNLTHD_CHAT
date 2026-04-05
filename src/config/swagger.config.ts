import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { registerAuthSwaggerPaths } from "./swagger/auth.swagger";
import { registerChatSwaggerPaths } from "./swagger/chat.swagger";
import { registerMessageSwaggerPaths } from "./swagger/message.swagger";
import {
  ErrorResponseSchema,
  MessageSchema,
  registerSecuritySchemes,
} from "./swagger/schemas";
import { registerUserSwaggerPaths } from "./swagger/user.swagger";
import { sendMessageSchema } from "../validators/message.validator";
import z from "zod";

const registry = new OpenAPIRegistry();

registerSecuritySchemes(registry);
registerAuthSwaggerPaths(registry);
registerChatSwaggerPaths(registry);
registerMessageSwaggerPaths(registry);
registerUserSwaggerPaths(registry);

registry.registerPath({
  method: "post",
  path: "/message/send",
  tags: ["Message"],
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
    201: {
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
      description: "Chưa xác thực",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
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
