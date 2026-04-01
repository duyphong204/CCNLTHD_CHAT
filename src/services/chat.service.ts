import { emitNewChatToParticipants } from "../lib/socket";
import { chatRepository } from "../repositories/chat.repository";
import { messageRepository } from "../repositories/message.repository";
import { userRepository } from "../repositories/user.repository";
import { BadRequestException } from "../utils/app-error";

export const createChatService = async (
  userId: string,
  body: {
    participantId?: string;
    isGroup?: boolean;
    participants?: string[]; // danh sách id người tham gia group
    groupName?: string;
  },
) => {
  const { participantId, isGroup, participants, groupName } = body;

  let chat;
  let allParticipantIds: string[] = [];
  // Tạo group chat
  if (isGroup && participants?.length && groupName) {
    // Bao gồm creator + các participants
    allParticipantIds = [userId, ...participants];
    chat = await chatRepository.createChat({
      participants: allParticipantIds,
      isGroup: true,
      groupName,
      createdBy: userId,
    });
    // Tạo chat 1-1
  } else if (participantId) {
    const otherUser = await userRepository.findById(participantId);
    if (!otherUser) throw new BadRequestException("Không tìm thấy người dùng");

    allParticipantIds = [userId, participantId];
    const existingChat =
      await chatRepository.findOneToOneChatByParticipants(allParticipantIds);

    if (existingChat) return existingChat;

    chat = await chatRepository.createChat({
      participants: allParticipantIds,
      isGroup: false,
      createdBy: userId,
    });
  }

  const populatedChat = await chat?.populate(
    "participants",
    "name avatar isAI",
  );
  // Chuyển _id của từng participant thành chuỗi (string)
  const particpantIdStrings = populatedChat?.participants?.map((p) => {
    return p._id?.toString();
  });
  // Gửi sự kiện "chat:new" đến tất cả thành viên của chat
  emitNewChatToParticipants(particpantIdStrings, populatedChat);
  return chat;
};

export const getUserChatsService = async (userId: string) => {
  // Lấy tất cả chat mà userId tham gia
  const chats = chatRepository.findChatsByUser(userId);
  return chats;
};

export const getSingleChatService = async (chatId: string, userId: string) => {
  const chat = await chatRepository.findChatByIdForParticipant(chatId, userId);

  if (!chat)
    throw new BadRequestException(
      "Không tìm thấy cuộc trò chuyện hoặc bạn không có quyền xem",
    );

  const messages = await messageRepository.findMessagesByChatId(chatId);

  return {
    chat,
    messages,
  };
};

// Kiểm tra xem user có nằm trong danh sách thành viên của chat không
export const validateChatParticipant = async (
  chatId: string,
  userId: string,
) => {
  // Tìm chat có _id khớp và chứa userId trong participants
  const chat = await chatRepository.findRawChatByIdForParticipant(
    chatId,
    userId,
  );

  if (!chat)
    throw new BadRequestException(
      "Người dùng không phải là thành viên của cuộc trò chuyện",
    );
  return chat; // Trả về chat hợp lệ
};
