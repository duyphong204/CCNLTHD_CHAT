import { userRepository } from "../repositories/user.repository";
import { NotFoundException, UnauthorizedException } from "../utils/app-error";
import {
  LoginSchemaType,
  RegisterSchemaType,
} from "../validators/auth.validator";

export const registerService = async (body: RegisterSchemaType) => {
  const { email } = body;
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) throw new UnauthorizedException("Người dùng đã tồn tại");
  const newUser = await userRepository.createUser({
    name: body.name,
    email: body.email,
    password: body.password,
    avatar: body.avatar,
  });
  return newUser;
};
export const loginService = async (body: LoginSchemaType) => {
  const { email, password } = body;
  const user = await userRepository.findByEmail(email);
  if (!user) throw new NotFoundException("Email không chính xác");
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid)
    throw new UnauthorizedException("Mật khẩu không hợp lệ");

  return user;
};
