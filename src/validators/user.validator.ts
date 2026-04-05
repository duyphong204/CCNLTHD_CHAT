import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1, "Tên không được để trống").optional(),
    email: z
      .string()
      .trim()
      .email("Địa chỉ email không hợp lệ")
      .min(1, "Email không được để trống")
      .optional(),
    avatar: z
      .string()
      .trim()
      .min(1, "Avatar không được để trống")
      .nullable()
      .optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.email !== undefined ||
      value.avatar !== undefined,
    {
      message: "Cần ít nhất một trường để cập nhật",
    },
  );

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().trim().min(1, "Mật khẩu hiện tại là bắt buộc"),
    newPassword: z.string().trim().min(1, "Mật khẩu mới là bắt buộc"),
    confirmNewPassword: z
      .string()
      .trim()
      .min(1, "Xác nhận mật khẩu mới là bắt buộc"),
  })
  .refine((value) => value.newPassword === value.confirmNewPassword, {
    message: "Xác nhận mật khẩu mới không khớp",
    path: ["confirmNewPassword"],
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: "Mật khẩu mới phải khác mật khẩu hiện tại",
    path: ["newPassword"],
  });

export const userIdParamSchema = z.object({
  id: z.string().trim().min(1, "Id người dùng là bắt buộc"),
});

export type UpdateProfileSchemaType = z.infer<typeof updateProfileSchema>;
export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
export type UserIdParamSchemaType = z.infer<typeof userIdParamSchema>;
