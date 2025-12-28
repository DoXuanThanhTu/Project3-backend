import { Schema, model } from "mongoose";
import { IUser } from "../types/user.type";
import { Role, Status } from "../types/role.type";

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.ACTIVE,
    },
    displayName: { type: String, required: true },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("User", userSchema);
