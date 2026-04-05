import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  changePasswordSchema,
  updateProfileSchema,
  userIdParamSchema,
} from "../../validators/user.validator";
import { ErrorResponseSchema, UserSchema } from "./schemas";

export const registerUserSwaggerPaths = (registry: OpenAPIRegistry) => {
  registry.registerPath({
    method: "get",
    path: "/user/me",
    tags: ["User"],
    summary: "Lấy thông tin cá nhân",
    security: [{ cookieAuth: [] }],
    responses: {
      200: {
        description: "Lấy thông tin cá nhân thành công",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
              user: UserSchema,
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
    path: "/user/all",
    tags: ["User"],
    summary: "Lấy danh sách người dùng (trừ bản thân)",
    security: [{ cookieAuth: [] }],
    responses: {
      200: {
        description: "Lấy danh sách người dùng thành công",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
              users: z.array(UserSchema),
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
    path: "/user/{id}",
    tags: ["User"],
    summary: "Lấy thông tin người dùng theo id",
    security: [{ cookieAuth: [] }],
    request: {
      params: userIdParamSchema.openapi("UserIdParamRequest"),
    },
    responses: {
      200: {
        description: "Lấy thông tin người dùng thành công",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
              user: UserSchema,
            }),
          },
        },
      },
      404: {
        description: "Không tìm thấy người dùng",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/user/profile",
    tags: ["User"],
    summary: "Cập nhật thông tin cá nhân",
    security: [{ cookieAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: updateProfileSchema.openapi("UpdateProfileRequest"),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Cập nhật thông tin cá nhân thành công",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
              user: UserSchema,
            }),
          },
        },
      },
      400: {
        description: "Dữ liệu cập nhật không hợp lệ",
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

  registry.registerPath({
    method: "patch",
    path: "/user/change-password",
    tags: ["User"],
    summary: "Đổi mật khẩu",
    security: [{ cookieAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: changePasswordSchema.openapi("ChangePasswordRequest"),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Đổi mật khẩu thành công",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
      400: {
        description: "Dữ liệu đổi mật khẩu không hợp lệ",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      401: {
        description: "Mật khẩu hiện tại không chính xác hoặc chưa xác thực",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });
};
