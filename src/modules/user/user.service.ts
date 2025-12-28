import { NotFoundError } from "../../errors/http.error";
import { UserModel } from "../../models/user.model";
import { IUser } from "../../types/user.type";

export class UserService {
  static async getAllUsers() {
    return UserModel.find().select("-password");
  }

  static async getUserById(userId: string) {
    const user = await UserModel.findById(userId).select("-password");
    if (!user) throw new NotFoundError();
    return user;
  }

  static async updateUser(id: string, data: Partial<IUser>) {
    const user = await UserModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  static async updateUserRole(userId: string, role: "USER" | "ADMIN") {
    return UserModel.findByIdAndUpdate(userId, { role }, { new: true }).select(
      "-password"
    );
  }

  static async updateUserStatus(userId: string, status: "ACTIVE" | "BANNED") {
    return UserModel.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select("-password");
  }
}
