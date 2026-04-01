import ChatModel from "../models/chat.model";

class ChatRepository {
  createChat(data: {
    participants: string[];
    isGroup: boolean;
    groupName?: string;
    createdBy: string;
  }) {
    return ChatModel.create(data);
  }

  // Tìm cuộc trò chuyện 1-1 giữa hai người dùng dựa trên danh sách participantIds (phải có đúng 2 thành viên).
  findOneToOneChatByParticipants(participantIds: string[]) {
    return ChatModel.findOne({
      participants: { $all: participantIds, $size: 2 },
    }).populate("participants", "name avatar");
  }

  // Tìm tất cả cuộc trò chuyện mà userId tham gia, sắp xếp theo thời gian cập nhật gần nhất.
  findChatsByUser(userId: string) {
    return ChatModel.find({
      participants: { $in: [userId] },
    })
      .populate("participants", "name avatar")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "name avatar",
        },
      })
      .sort({ updatedAt: -1 });
  }

  //Tìm chi tiết cuộc chat (Có Populate) theo chatId và đảm bảo userId là một participant của cuộc trò chuyện đó.
  findChatByIdForParticipant(chatId: string, userId: string) {
    return ChatModel.findOne({
      _id: chatId,
      participants: { $in: [userId] },
    }).populate("participants", "name avatar");
  }

  // Tìm dữ liệu chat thô (Không Populate) theo chatId và đảm bảo userId là một participant của cuộc trò chuyện đó.
  findRawChatByIdForParticipant(chatId: string, userId: string) {
    return ChatModel.findOne({
      _id: chatId,
      participants: { $in: [userId] },
    });
  }
}

export const chatRepository = new ChatRepository();
