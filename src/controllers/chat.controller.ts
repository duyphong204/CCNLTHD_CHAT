import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { chatIdSchema, createChatSchema } from "../validators/chat.validator";
import { IChatService } from "../@types/service.interface";

export class ChatController {
  private chatService: IChatService;
  constructor(chatService: IChatService) {
    this.chatService = chatService;
  }

  createChat = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = createChatSchema.parse(req.body);

    const chat = await this.chatService.createChat(userId, body);
    return res.status(HTTPSTATUS.OK).json({
      message: "Tạo hoặc lấy cuộc trò chuyện thành công",
      chat,
    });
  });

  getUserChats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const chats = await this.chatService.getUserChats(userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "Lấy danh sách cuộc trò chuyện thành công",
      chats,
    });
  });

  getSingleChat = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { id } = chatIdSchema.parse(req.params);
    const { chat, messages } = await this.chatService.getSingleChat(id, userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "Lấy danh sách cuộc trò chuyện thành công",
      chat,
      messages,
    });
  });
}
