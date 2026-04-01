import { userRepository } from "../repositories/user.repository";

export const findByIdUserService = async (userId: string) => {
  return await userRepository.findById(userId);
};

export const getUsersService = async (userId: string) => {
  const users = await userRepository.findOthersWithoutPassword(userId);
  return users;
};
