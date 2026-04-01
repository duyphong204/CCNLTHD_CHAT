import UserModel from "../models/user.model";

class UserRepository {
  findById(userId: string) {
    return UserModel.findById(userId);
  }

  findByEmail(email: string) {
    return UserModel.findOne({ email });
  }

  createUser(data: {
    name: string;
    email: string;
    password: string;
    avatar?: string;
  }) {
    return UserModel.create(data);
  }

  findOthersWithoutPassword(userId: string) {
    return UserModel.find({ _id: { $ne: userId } }).select("-password");
  }
}

export const userRepository = new UserRepository();
