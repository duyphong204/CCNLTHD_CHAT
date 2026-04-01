import { NotFoundException, UnauthorizedException } from "../utils/app-error";
import {
  LoginSchemaType,
  RegisterSchemaType,
} from "../validators/auth.validator";
import { IUserRepository } from "../@types/repository.interface";
import { IAuthService } from "../@types/service.interface";

export class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async register(body: RegisterSchemaType) {
    const { email } = body;
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) throw new UnauthorizedException("Người dùng đã tồn tại");

    const newUser = await this.userRepository.create({
      name: body.name,
      email: body.email,
      password: body.password,
      avatar: body.avatar,
    });

    return newUser;
  }

  async login(body: LoginSchemaType) {
    const { email, password } = body;
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException("Email không chính xác");

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid)
      throw new UnauthorizedException("Mật khẩu không hợp lệ");

    return user;
  }
}
