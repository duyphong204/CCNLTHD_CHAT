import { BaseRepository } from "./base.repository";
import ChatModel, { ChatDocument } from "../models/chat.model";
import mongoose, { FilterQuery } from "mongoose";
import { IChatRepository } from "../@types/repository.interface";

export class ChatRepository extends BaseRepository<ChatDocument> implements IChatRepository {
  constructor() {
    super(ChatModel);
  }

  async findByParticipants(
    participantIds: string[],
  ): Promise<ChatDocument | null> {
    return this.findOne({
      participants: { $all: participantIds, $size: participantIds.length },
    });
  }

  async findUserChats(userId: string): Promise<ChatDocument[]> {
    return this.model
      .find({
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
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findByIdAndUser(
    chatId: string,
    userId: string,
  ): Promise<ChatDocument | null> {
    return this.model
      .findOne({
        _id: chatId,
        participants: {
          $in: [userId],
        },
      })
      .populate("participants", "name avatar")
      .exec();
  }

  async createGroupChat(data: {
    participants: string[];
    isGroup: boolean;
    groupName: string;
    createdBy: string;
  }): Promise<ChatDocument> {
    const chatData = {
      participants: data.participants.map(
        (id) => new mongoose.Types.ObjectId(id),
      ),
      isGroup: data.isGroup,
      groupName: data.groupName,
      createdBy: new mongoose.Types.ObjectId(data.createdBy),
    };
    return this.create(chatData);
  }

  async createOneOnOneChat(data: {
    participants: string[];
    isGroup: boolean;
    createdBy: string;
  }): Promise<ChatDocument> {
    const chatData = {
      participants: data.participants.map(
        (id) => new mongoose.Types.ObjectId(id),
      ),
      isGroup: data.isGroup,
      createdBy: new mongoose.Types.ObjectId(data.createdBy),
    };
    return this.create(chatData);
  }
}
