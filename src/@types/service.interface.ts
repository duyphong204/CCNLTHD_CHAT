import { RegisterSchemaType, LoginSchemaType } from "../validators/auth.validator";
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
  getUsers(userId: string): Promise<UserDocument[]>;
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
