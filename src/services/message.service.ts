import cloudinary from "../config/cloudinary.config";
import {
  emitDeleteMessageToChatRoom,
  emitEditMessageToChatRoom,
  emitLastMessageToParticipants,
  emitNewMessageToChatRoom,
} from "../lib/socket";
import {
  AppError,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/app-error";
import { IMessageRepository } from "../@types/repository.interface";
import { IChatRepository } from "../@types/repository.interface";
import { IMessageService } from "../@types/service.interface";

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

  async editMessageService(
    userId: string,
    body: {
      chatId: string;
      messageId: string;
      content?: string;
    },
  ): Promise<any> {
    const { chatId, messageId, content } = body;

    // Kiểm tra chat tồn tại & user có quyền
    const chat = await this.chatRepository.findByIdAndUser(chatId, userId);
    if (!chat)
      throw new BadRequestException(
        "Không tìm thấy cuộc trò chuyện hoặc không có quyền",
      );

    // Tìm tin nhắn
    const existMessage = await this.messageRepository.findById(messageId);

    if (!existMessage)
      throw new NotFoundException(
        "Tin nhắn không tồn tại để thực hiện chỉnh sửa",
      );

    if (existMessage.sender._id.toString() !== userId.toString())
      throw new UnauthorizedException("Tin nhắn này không phải của bạn.");

    existMessage.content = content;
    existMessage.isEdit = true;
    await existMessage.save();

    // Populate dữ liệu trả về client
    const populatedMessage = await existMessage.populate([
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
    emitEditMessageToChatRoom(userId, chatId, populatedMessage);

    // Lấy danh sách tất cả ID của thành viên trong chat
    const allParticipantIds = chat.participants?.map((id) =>
      id._id?.toString(),
    );

    // Gửi tin nhắn cuối cùng đến từng người (nếu tin nhắn edit là cuối cùng)
    emitLastMessageToParticipants(allParticipantIds, chatId, populatedMessage);

    return { userMessage: populatedMessage, chat };
  }

  async deleteMessageService(
    userId: string,
    body: { chatId: string; messageId: string },
  ): Promise<any> {
    const { chatId, messageId } = body;

    // Kiểm tra chat tồn tại & user có quyền
    const chat = await this.chatRepository.findByIdAndUser(chatId, userId);
    if (!chat)
      throw new BadRequestException(
        "Không tìm thấy cuộc trò chuyện hoặc không có quyền",
      );

    // Tìm tin nhắn
    const existMessage = await this.messageRepository.findById(messageId);

    console.log("existMessage: ", existMessage?.sender._id);
    console.log("userId delete: ", userId);

    if (!existMessage)
      throw new NotFoundException("Tin nhắn không tồn tại để thực hiện xóa");

    // Kiểm tra người gửi
    if (existMessage.sender._id.toString() !== userId.toString())
      throw new UnauthorizedException("Tin nhắn này không phải của bạn.");

    // Soft delete: Đánh dấu xóa
    existMessage.isDeleted = true;
    existMessage.deletedAt = new Date();
    // existMessage.deletedBy = userId;
    existMessage.content = ""; // Xóa content để không lấy được
    await existMessage.save();

    // Populate dữ liệu tin nhắn xóa
    const deletedMessage = await existMessage.populate([
      { path: "sender", select: "name avatar" },
    ]);

    // WebSocket emit: Thông báo tin nhắn đã xóa
    emitDeleteMessageToChatRoom(userId, chatId, deletedMessage);

    // Cập nhật last message nếu tin nhắn xóa là last message
    if (chat.lastMessage?.toString() === messageId) {
      const actualLastMessage =
        await this.messageRepository.findLastMessage(chatId);
      if (actualLastMessage) {
        chat.lastMessage = actualLastMessage._id;
        await chat.save();

        // Thông báo cập nhật last message
        const allParticipantIds = chat.participants?.map((id) =>
          id._id?.toString(),
        );
        emitLastMessageToParticipants(
          allParticipantIds,
          chatId,
          actualLastMessage,
        );
      }
    }

    return { deletedMessage, chat };
  }
}
