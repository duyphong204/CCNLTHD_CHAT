/**
 * Dependency Injection Container
 * Quản lý việc khởi tạo và cung cấp singleton cho tất cả repositories, services, và controllers.
 * Đây là nơi DUY NHẤT thực hiện việc tạo đối tượng (new) và tiêm dependency vào constructor.
 */

// Interfaces
import {
  IUserRepository,
  IChatRepository,
  IMessageRepository,
} from "../@types/repository.interface";
import {
  IAuthService,
  IUserService,
  IChatService,
} from "../@types/service.interface";

// Concrete implementations
import { ChatRepository } from "../repositories/chat.repository";
import { MessageRepository } from "../repositories/message.repository";
import { UserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/auth.service";
import { ChatService } from "../services/chat.service";
import { UserService } from "../services/user.service";
import { AuthController } from "../controllers/auth.controller";
import { ChatController } from "../controllers/chat.controller";

class DIContainer {
  private static instance: DIContainer;

  // Repositories
  private _userRepository: IUserRepository | null = null;
  private _chatRepository: IChatRepository | null = null;
  private _messageRepository: IMessageRepository | null = null;

  // Services
  private _authService: IAuthService | null = null;
  private _userService: IUserService | null = null;
  private _chatService: IChatService | null = null;

  // Controllers
  private _authController: AuthController | null = null;
  private _chatController: ChatController | null = null;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // ─── Repository Getters ────────────────────────────────────────────

  getUserRepository(): IUserRepository {
    if (!this._userRepository) {
      this._userRepository = new UserRepository();
    }
    return this._userRepository;
  }

  getChatRepository(): IChatRepository {
    if (!this._chatRepository) {
      this._chatRepository = new ChatRepository();
    }
    return this._chatRepository;
  }

  getMessageRepository(): IMessageRepository {
    if (!this._messageRepository) {
      this._messageRepository = new MessageRepository();
    }
    return this._messageRepository;
  }

  // ─── Service Getters ──────────────────────────────────────────────

  getAuthService(): IAuthService {
    if (!this._authService) {
      this._authService = new AuthService(this.getUserRepository());
    }
    return this._authService;
  }

  getUserService(): IUserService {
    if (!this._userService) {
      this._userService = new UserService(this.getUserRepository());
    }
    return this._userService;
  }

  getChatService(): IChatService {
    if (!this._chatService) {
      this._chatService = new ChatService(
        this.getChatRepository(),
        this.getUserRepository(),
        this.getMessageRepository(),
      );
    }
    return this._chatService;
  }

  // ─── Controller Getters ───────────────────────────────────────────

  getAuthController(): AuthController {
    if (!this._authController) {
      this._authController = new AuthController(this.getAuthService());
    }
    return this._authController;
  }

  getChatController(): ChatController {
    if (!this._chatController) {
      this._chatController = new ChatController(this.getChatService());
    }
    return this._chatController;
  }

  // ─── Reset (dùng cho testing) ─────────────────────────────────────

  reset(): void {
    this._userRepository = null;
    this._chatRepository = null;
    this._messageRepository = null;
    this._authService = null;
    this._userService = null;
    this._chatService = null;
    this._authController = null;
    this._chatController = null;
  }
}

export const container = DIContainer.getInstance();
