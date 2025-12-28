import { Schema, model, Types } from "mongoose";

const profileSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    fullName: String,
    avatar: String,
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },
    dateOfBirth: Date,
    phone: String,
    bio: String,
  },
  { timestamps: true }
);

export const ProfileModel = model("Profile", profileSchema);
