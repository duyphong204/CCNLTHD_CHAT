import { BaseRepository } from "./base.repository";
import UserModel, { UserDocument } from "../models/user.model";
import { IUserRepository } from "../@types/repository.interface";

export class UserRepository
  extends BaseRepository<UserDocument>
  implements IUserRepository
{
  constructor() {
    super(UserModel);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.findOne({ email });
  }

  async getAllExcept(userId: string): Promise<UserDocument[]> {
    return this.find({ _id: { $ne: userId } });
  }

  async findByEmailOrCreate(
    data: Partial<UserDocument>,
  ): Promise<UserDocument | null> {
    return this.findOne({ email: data.email });
  }
}
