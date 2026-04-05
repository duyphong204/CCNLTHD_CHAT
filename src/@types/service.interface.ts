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
