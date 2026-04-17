import { asyncHandler } from "../utils/asyncHandler.middleware";
import { Request, Response } from "express";
import {
  sendMessageSchema,
  editMessageSchema,
} from "../validators/message.validator";
import { HTTPSTATUS } from "../config/http.config";
import { container } from "../container/di-container";
import { IMessageService } from "../@types/service.interface";

export class MessageController {
  private mesageService: IMessageService;
  constructor(messageService: IMessageService) {
    this.mesageService = messageService;
  }

  // Gửi tin nhắn
  send = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = sendMessageSchema.parse(req.body);

    console.log("req.user: ", req.user);
    console.log("req.body: ", req.body);

    const messageService = container.getMessageService();
    const result = await messageService.sendMessageService(userId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Gửi tin nhắn thành công",
      ...result,
    });
  });

  // Chỉnh sửa tin nhắn
  edit = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { id: messageId } = req.params as { id: string };
    const body = editMessageSchema.parse({ ...req.body, messageId });

    console.log("req.user: ", req.user);
    console.log("req.body: ", req.body);

    const messageService = container.getMessageService();
    const result = await messageService.editMessageService(userId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Edit tin nhắn thành công",
      ...result,
    });
  });

  // Xóa tin nhắn
  delete = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { id: messageId } = req.params as { id: string };
    const { chatId } = req.body;

    const messageService = container.getMessageService();
    const result = await messageService.deleteMessageService(userId, {
      chatId,
      messageId,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Xóa tin nhắn thành công",
      ...result,
    });
  });
}
