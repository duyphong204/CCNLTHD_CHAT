import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { loginSchema, registerSchema } from "../../validators/auth.validator";
import { AuthResponseSchema, ErrorResponseSchema } from "./schemas";

export const registerAuthSwaggerPaths = (registry: OpenAPIRegistry) => {
  registry.registerPath({
    method: "post",
    path: "/auth/register",
    tags: ["Auth"],
    summary: "Dang ky tai khoan",
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
        description: "Dang ky thanh cong",
        content: {
          "application/json": {
            schema: AuthResponseSchema,
          },
        },
      },
      400: {
        description: "Du lieu dau vao khong hop le",
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
    summary: "Dang nhap",
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
        description: "Dang nhap thanh cong",
        content: {
          "application/json": {
            schema: AuthResponseSchema,
          },
        },
      },
      401: {
        description: "Sai thong tin dang nhap",
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
    summary: "Dang xuat",
    responses: {
      200: {
        description: "Dang xuat thanh cong",
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
    summary: "Kiem tra trang thai xac thuc",
    security: [{ cookieAuth: [] }],
    responses: {
      200: {
        description: "Nguoi dung da xac thuc",
        content: {
          "application/json": {
            schema: AuthResponseSchema,
          },
        },
      },
      401: {
        description: "Chua dang nhap hoac token khong hop le",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });
};
