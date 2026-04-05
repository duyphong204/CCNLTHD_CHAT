import { emitNewChatToParticipants } from "../lib/socket";
import { emitNewChatToParticipants } from "../lib/socket";
import { BadRequestException } from "../utils/app-error";
import {
  IChatRepository,
  IUserRepository,
  IMessageRepository,
} from "../@types/repository.interface";
// import { IChatService } from "../@types/service.interface";

export class ChatService {
  private chatRepository: IChatRepository;
  private userRepository: IUserRepository;
  private messageRepository: IMessageRepository;
  constructor(
    chatRepository: IChatRepository,
    userRepository: IUserRepository,
    messageRepository: IMessageRepository,
  ) {
    this.chatRepository = chatRepository;
    this.userRepository = userRepository;
    this.messageRepository = messageRepository;
  }

  async createChat(
    userId: string,
    body: {
      participantId?: string;
      isGroup?: boolean;
      participants?: string[];
      groupName?: string;
    },
  ) {
    const { participantId, isGroup, participants, groupName } = body;

    let chat;
    let allParticipantIds: string[] = [];

    // Tạo group chat
    if (isGroup && participants?.length && groupName) {
      allParticipantIds = [userId, ...participants];
      chat = await this.chatRepository.createGroupChat({
        participants: allParticipantIds,
        isGroup: true,
        groupName,
        createdBy: userId,
      });
      // Tạo chat 1-1
    } else if (participantId) {
      const otherUser = await this.userRepository.findById(participantId);
      if (!otherUser)
        throw new BadRequestException("Không tìm thấy người dùng");

      allParticipantIds = [userId, participantId];
      const existingChat =
        await this.chatRepository.findByParticipants(allParticipantIds);

      if (existingChat) return existingChat;

      chat = await this.chatRepository.createOneOnOneChat({
        participants: allParticipantIds,
        isGroup: false,
        createdBy: userId,
      });
    }

    const populatedChat = await chat?.populate(
      "participants",
      "name avatar isAI",
    );
    const participantIdStrings = populatedChat?.participants?.map((p) => {
      return p._id?.toString();
    });
    emitNewChatToParticipants(participantIdStrings, populatedChat);
    return chat;
  }

  async getUserChats(userId: string) {
    const chats = await this.chatRepository.findUserChats(userId);
    return chats;
  }

  async getSingleChat(chatId: string, userId: string) {
    const chat = await this.chatRepository.findByIdAndUser(chatId, userId);

    if (!chat)
      throw new BadRequestException(
        "Không tìm thấy cuộc trò chuyện hoặc bạn không có quyền xem",
      );

    const messages = await this.messageRepository.findByChatId(chatId);

    return {
      chat,
      messages,
    };
  }

  async validateChatParticipant(chatId: string, userId: string) {
    const chat = await this.chatRepository.findByIdAndUser(chatId, userId);
    if (!chat)
      throw new BadRequestException(
        "Người dùng không phải là thành viên của cuộc trò chuyện",
      );
    return chat;
  }
}
