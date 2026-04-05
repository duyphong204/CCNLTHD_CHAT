import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { clearJwtAuthCookie, setJwtAuthCookie } from "../utils/cookie";
import { HTTPSTATUS } from "../config/http.config";
import { IAuthService } from "../@types/service.interface";

export class AuthController {
  private authService: IAuthService;
  constructor(authService: IAuthService) {
    this.authService = authService;
  }
  register = asyncHandler(async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);

    const user = await this.authService.register(body);
    const userId = user._id.toString();

    return setJwtAuthCookie({
      res,
      userId,
    })
      .status(HTTPSTATUS.CREATED)
      .json({
        message: "Đăng ký thành công.",
        user,
      });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body);
    const user = await this.authService.login(body);
    const userId = user._id.toString();
    return setJwtAuthCookie({
      res,
      userId,
    })
      .status(HTTPSTATUS.OK)
      .json({
        message: "Đăng nhập thành công.",
        user,
      });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    return clearJwtAuthCookie(res).status(HTTPSTATUS.OK).json({
      message: "Đăng xuất thành công",
    });
  });

  authStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    return res.status(HTTPSTATUS.OK).json({
      message: "Người dùng đã xác thực",
      user,
    });
  });
}
