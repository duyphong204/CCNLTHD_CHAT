import { IUserRepository } from "../@types/repository.interface";
import { IUserService } from "../@types/service.interface";
import {
  ChangePasswordSchemaType,
  UpdateProfileSchemaType,
} from "../validators/user.validator";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/app-error";
import { uploadImageToCloudinary } from "../utils/cloudinary";

export class UserService implements IUserService {
  private userRepository: IUserRepository;
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  private isCloudinaryUrl(url: string): boolean {
    return /^https?:\/\/res\.cloudinary\.com\/.+/i.test(url);
  }

  async findById(userId: string) {
    return await this.userRepository.findById(userId);
  }

  async getMyProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại");
    }
    return user;
  }

  async getUserProfileById(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại");
    }
    return user;
  }

  async getUsers(userId: string) {
    const users = await this.userRepository.getAllExcept(userId);
    return users;
  }

  async updateProfile(userId: string, body: UpdateProfileSchemaType) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    if (body.email && body.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(body.email);
      if (existingUser && existingUser._id.toString() !== userId) {
        throw new BadRequestException("Email đã được sử dụng");
      }
      user.email = body.email;
    }

    if (body.name !== undefined) {
      user.name = body.name;
    }

    if (body.avatar !== undefined) {
      if (body.avatar === null) {
        user.avatar = null;
      } else if (this.isCloudinaryUrl(body.avatar)) {
        user.avatar = body.avatar;
      } else {
        const uploadedAvatarUrl = await uploadImageToCloudinary(
          body.avatar,
          "ccnlthd-chat/avatars",
        );
        user.avatar = uploadedAvatarUrl;
      }
    }

    await user.save();
    return user;
  }

  async changePassword(userId: string, body: ChangePasswordSchemaType) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    const isCurrentPasswordValid = await user.comparePassword(
      body.currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("Mật khẩu hiện tại không chính xác");
    }

    user.password = body.newPassword;
    await user.save();
  }
}
