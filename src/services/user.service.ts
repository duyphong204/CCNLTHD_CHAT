import { IUserRepository } from "../@types/repository.interface";
import { IUserService } from "../@types/service.interface";

export class UserService implements IUserService {
  private userRepository: IUserRepository;
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async findById(userId: string) {
    return await this.userRepository.findById(userId);
  }

  async getUsers(userId: string) {
    const users = await this.userRepository.getAllExcept(userId);
    return users;
  }
}
