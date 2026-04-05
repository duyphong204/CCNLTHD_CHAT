import cloudinary from "../config/cloudinary.config";
import {
  emitLastMessageToParticipants,
  emitNewMessageToChatRoom,
} from "../lib/socket";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { IMessageRepository } from "../@types/repository.interface";
import { IChatRepository } from "../@types/repository.interface";
import { IMessageService } from "../@types/service.interface";
import mongoose from "mongoose";

export class MessageService implements IMessageService {
  private messageRepository: IMessageRepository;
  private chatRepository: IChatRepository;

  constructor(
    messageRepository: IMessageRepository,
    chatRepository: IChatRepository,
  ) {
    this.messageRepository = messageRepository;
    this.chatRepository = chatRepository;
  }

  async sendMessageService(
    userId: string,
    body: {
      chatId: string;
      content?: string;
      image?: string;
      replyToId?: string;
    },
  ): Promise<any> {
    const { chatId, content, image, replyToId } = body;

    // Kiểm tra chat tồn tại & user có quyền
    const chat = await this.chatRepository.findByIdAndUser(chatId, userId);
    if (!chat)
      throw new BadRequestException(
        "Không tìm thấy cuộc trò chuyện hoặc không có quyền",
      );

    // Nếu là trả lời tin nhắn, kiểm tra tin nhắn gốc tồn tại
    if (replyToId) {
      const replyMessage = await this.messageRepository.findById(replyToId);
      if (!replyMessage)
        throw new NotFoundException("Không tìm thấy tin nhắn trả lời");
    }

    // Upload ảnh lên Cloudinary nếu có
    let imageUrl;
    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image);
      imageUrl = uploadRes.secure_url;
    }

    // Tạo tin nhắn mới
    const newMessage = await this.messageRepository.createMessage({
      chatId,
      sender: userId,
      content,
      image: imageUrl,
      replyTo: replyToId,
    });

    // Populate dữ liệu trả về client
    const populatedMessage = await newMessage.populate([
      { path: "sender", select: "name avatar" },
      {
        path: "replyTo",
        select: "content image sender",
        populate: {
          path: "sender",
          select: "name avatar",
        },
      },
    ]);

    // WebSocket emit
    emitNewMessageToChatRoom(userId, chatId, populatedMessage);

    // Lấy danh sách tất cả ID của thành viên trong chat
    const allParticipantIds = chat.participants?.map((id) =>
      id._id?.toString(),
    );

    // Gửi tin nhắn cuối cùng đến từng người
    emitLastMessageToParticipants(allParticipantIds, chatId, newMessage);

    return { userMessage: newMessage, chat };
  }
}
