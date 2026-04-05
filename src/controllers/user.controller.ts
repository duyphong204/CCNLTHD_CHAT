import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { IUserService } from "../@types/service.interface";
import {
  changePasswordSchema,
  userIdParamSchema,
  updateProfileSchema,
} from "../validators/user.validator";

export class UserController {
  private userService: IUserService;
  constructor(userService: IUserService) {
    this.userService = userService;
  }

  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const users = await this.userService.getUsers(userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "Lấy danh sách người dùng thành công",
      users,
    });
  });

  getMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const user = await this.userService.getMyProfile(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Lấy thông tin cá nhân thành công",
      user,
    });
  });

  getUserProfileById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = userIdParamSchema.parse(req.params);
    const user = await this.userService.getUserProfileById(id);

    return res.status(HTTPSTATUS.OK).json({
      message: "Lấy thông tin người dùng thành công",
      user,
    });
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = updateProfileSchema.parse(req.body);

    const user = await this.userService.updateProfile(userId, body);
    return res.status(HTTPSTATUS.OK).json({
      message: "Cập nhật thông tin cá nhân thành công",
      user,
    });
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = changePasswordSchema.parse(req.body);

    await this.userService.changePassword(userId, body);
    return res.status(HTTPSTATUS.OK).json({
      message: "Đổi mật khẩu thành công",
    });
  });
}
