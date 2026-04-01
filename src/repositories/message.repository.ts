import { BaseRepository } from "./base.repository";
import MessageModel, { MessageDocument } from "../models/message.model";
import mongoose from "mongoose";
import { IMessageRepository } from "../@types/repository.interface";

export class MessageRepository extends BaseRepository<MessageDocument> implements IMessageRepository {
  constructor() {
    super(MessageModel);
  }

  async findByChatId(chatId: string): Promise<MessageDocument[]> {
    return this.model
      .find({ chatId })
      .populate("sender", "name avatar")
      .populate({
        path: "replyTo",
        select: "content image sender",
        populate: {
          path: "sender",
          select: "name avatar",
        },
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  async createMessage(data: {
    chatId: string;
    sender: string;
    content?: string;
    image?: string;
    replyTo?: string;
  }): Promise<MessageDocument> {
    const messageData = {
      chatId: new mongoose.Types.ObjectId(data.chatId),
      sender: new mongoose.Types.ObjectId(data.sender),
      content: data.content,
      image: data.image,
      replyTo: data.replyTo
        ? new mongoose.Types.ObjectId(data.replyTo)
        : undefined,
    };
    return this.create(messageData);
  }

  async findLastMessage(chatId: string): Promise<MessageDocument | null> {
    return this.model.findOne({ chatId }).sort({ createdAt: -1 }).exec();
  }
}
