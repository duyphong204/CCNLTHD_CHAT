import { FilterQuery, UpdateQuery, Document } from "mongoose";
import { UserDocument } from "../models/user.model";
import { ChatDocument } from "../models/chat.model";
import { MessageDocument } from "../models/message.model";

/**
 * Interface cho BaseRepository
 * Định nghĩa các phương thức CRUD cơ bản
 */
export interface IBaseRepository<T extends Document> {
  findById(id: string | null): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  find(filter: FilterQuery<T>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  updateById(id: string, update: UpdateQuery<T>): Promise<T | null>;
  deleteById(id: string): Promise<boolean>;
  findAndPopulate(
    filter: FilterQuery<T>,
    populate: string | string[],
  ): Promise<T | null>;
}

/**
 * Interface cho UserRepository
 */
export interface IUserRepository extends IBaseRepository<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;
  getAllExcept(userId: string): Promise<UserDocument[]>;
  findByEmailOrCreate(
    data: Partial<UserDocument>,
  ): Promise<UserDocument | null>;
}

/**
 * Interface cho ChatRepository
 */
export interface IChatRepository extends IBaseRepository<ChatDocument> {
  findByParticipants(
    participantIds: string[],
  ): Promise<ChatDocument | null>;
  findUserChats(userId: string): Promise<ChatDocument[]>;
  findByIdAndUser(
    chatId: string,
    userId: string,
  ): Promise<ChatDocument | null>;
  createGroupChat(data: {
    participants: string[];
    isGroup: boolean;
    groupName: string;
    createdBy: string;
  }): Promise<ChatDocument>;
  createOneOnOneChat(data: {
    participants: string[];
    isGroup: boolean;
    createdBy: string;
  }): Promise<ChatDocument>;
}

/**
 * Interface cho MessageRepository
 */
export interface IMessageRepository extends IBaseRepository<MessageDocument> {
  findByChatId(chatId: string): Promise<MessageDocument[]>;
  createMessage(data: {
    chatId: string;
    sender: string;
    content?: string;
    image?: string;
    replyTo?: string;
  }): Promise<MessageDocument>;
  findLastMessage(chatId: string): Promise<MessageDocument | null>;
}
