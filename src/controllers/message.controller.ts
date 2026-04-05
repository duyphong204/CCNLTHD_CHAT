import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { Request, Response } from "express";
import { sendMessageSchema } from "../validators/message.validator";
import { HTTPSTATUS } from "../config/http.config";
import { container } from "../container/di-container";

export const sendMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    console.log("req.user", req.user);
    const body = sendMessageSchema.parse(req.body);
    console.log("req.body", req.body);
    const messageService = container.getMessageService();
    const result = await messageService.sendMessageService(userId, body);
    return res.status(HTTPSTATUS.OK).json({
      message: "Gửi tin nhắn thành công",
      ...result,
    });
  },
);
