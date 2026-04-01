import MessageModel from "../models/message.model";

class MessageRepository {
  findMessagesByChatId(chatId: string) {
    return MessageModel.find({ chatId })
      .populate("sender", "name avatar")
      .populate({
        path: "replyTo",
        select: "content image sender",
        populate: {
          path: "sender",
          select: "name avatar",
        },
      })
      .sort({ createdAt: 1 });
  }
}

export const messageRepository = new MessageRepository();
