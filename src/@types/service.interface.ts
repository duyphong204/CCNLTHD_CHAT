import {
  RegisterSchemaType,
  LoginSchemaType,
} from "../validators/auth.validator";
import {
  UpdateProfileSchemaType,
  ChangePasswordSchemaType,
} from "../validators/user.validator";
import { UserDocument } from "../models/user.model";
import { ChatDocument } from "../models/chat.model";
import { MessageDocument } from "../models/message.model";

/**
 * Interface cho AuthService
 */
export interface IAuthService {
  register(body: RegisterSchemaType): Promise<UserDocument>;
  login(body: LoginSchemaType): Promise<UserDocument>;
}

/**
 * Interface cho UserService
 */
export interface IUserService {
  findById(userId: string): Promise<UserDocument | null>;
  getMyProfile(userId: string): Promise<UserDocument>;
  getUserProfileById(userId: string): Promise<UserDocument>;
  getUsers(userId: string): Promise<UserDocument[]>;
  updateProfile(
    userId: string,
    body: UpdateProfileSchemaType,
  ): Promise<UserDocument>;
  changePassword(userId: string, body: ChangePasswordSchemaType): Promise<void>;

  /**
   * Tìm kiếm và phân trang user
   * @param query Từ khóa tìm kiếm (tên hoặc email)
   * @param page Trang hiện tại
   * @param limit Số lượng mỗi trang
   * @returns Danh sách user và tổng số lượng
   */
  searchUsers(
    query: string,
    page: number,
    limit: number,
    excludeUserId?: string,
  ): Promise<{ users: UserDocument[]; total: number }>;
}

/**
 * Interface cho ChatService
 */
export interface IChatService {
  createChat(
    userId: string,
    body: {
      participantId?: string;
      isGroup?: boolean;
      participants?: string[];
      groupName?: string;
    },
  ): Promise<any>;
  getUserChats(userId: string): Promise<ChatDocument[]>;
  getSingleChat(
    chatId: string,
    userId: string,
  ): Promise<{ chat: ChatDocument; messages: MessageDocument[] }>;
  validateChatParticipant(
    chatId: string,
    userId: string,
  ): Promise<ChatDocument>;
}

export interface IMessageService {
  sendMessageService(
    userId: string,
    body: {
      chatId: string;
      content?: string;
      image?: string;
      replyToId?: string;
    },
  ): Promise<any>;
  editMessageService(
    userId: string,
    body: {
      chatId: string;
      messageId: string;
      content?: string;
    },
  ): Promise<any>;

  deleteMessageService(
    userId: string,
    body: {
      chatId: string;
      messageId: string;
    },
  ): Promise<any>;
}
