import {
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const ErrorResponseSchema = z
  .object({
    message: z.string(),
  })
  .openapi("ErrorResponse");

export const UserSchema = z
  .object({
    _id: z.string(),
    name: z.string(),
    email: z.string().email(),
    avatar: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .openapi("User");

export const AuthResponseSchema = z
  .object({
    message: z.string(),
    user: UserSchema,
  })
  .openapi("AuthResponse");

export const ChatSchema = z
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

export const MessageSchema = z
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

export const registerSecuritySchemes = (registry: OpenAPIRegistry) => {
  registry.registerComponent("securitySchemes", "cookieAuth", {
    type: "apiKey",
    in: "cookie",
    name: "accessToken",
  });
};
