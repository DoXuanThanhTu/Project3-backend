import { NotFoundError, ForbiddenError } from "../../errors/http.error";
import { ProfileModel } from "../../models/profile.model";

export class ProfileService {
  static async getMyProfile(userId: string) {
    return ProfileModel.findOne({ userId });
  }

  static async updateMyProfile(userId: string, data: any) {
    return ProfileModel.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true, upsert: true }
    );
  }

  static async getProfileByUserId(
    requester: { userId: string; role: string },
    targetUserId: string
  ) {
    if (requester.userId !== targetUserId && requester.role !== "admin") {
      throw new ForbiddenError();
    }

    const profile = await ProfileModel.findOne({ userId: targetUserId });
    if (!profile) throw new NotFoundError();

    return profile;
  }
}
