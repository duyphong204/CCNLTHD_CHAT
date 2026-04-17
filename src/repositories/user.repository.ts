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

  async searchUsers(
    query: string,
    page: number,
    limit: number,
    excludeUserId?: string,
  ): Promise<{ users: UserDocument[]; total: number }> {
    const filter: any = {
      $or: [
        { name: { $regex: query, $options: "i" } }, // $options: "i" = case-insensitive (không phân biệt chữ hoa/thường)
        { email: { $regex: query, $options: "i" } },
      ],
    };
    if (excludeUserId) {
      filter._id = { $ne: excludeUserId };
    }

    // const users = await UserModel.find(filter)
    //   .skip((page - 1) * limit)
    //   .limit(limit)
    //   .exec();

    const users = await this.findAll(filter, page, limit);
    const total = await UserModel.countDocuments(filter);
    return { users, total };
  }
}
