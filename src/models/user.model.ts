import { Role, Status } from "../types/role.type";
import mongoose, { Schema, Document } from "mongoose";
import {
  IUser,
  IUserPreference,
  IUserStats,
  IAchievement,
} from "../types/test.type";

const UserPreferenceSchema = new Schema<IUserPreference>({
  favoriteGenres: [{ type: String }],
  languages: [{ type: String }],
  quality: [{ type: String }],
  autoPlay: { type: Boolean, default: true },
  notifications: { type: Boolean, default: true },
});

const UserStatsSchema = new Schema<IUserStats>({
  totalWatched: { type: Number, default: 0 },
  totalHours: { type: Number, default: 0 },
  favorites: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
});

const AchievementSchema = new Schema<IAchievement>({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  description: { type: String, required: true },
  achievedAt: { type: Date, default: Date.now },
});

const UserSchema = new Schema<IUser>(
  {
    // username: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   trim: true,
    //   lowercase: true,
    // },
    displayName: {
      type: String,
      // required: true,
      // trim: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    membership: {
      type: String,
      enum: ["Free", "Premium", "VIP"],
      default: "Free",
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    preferences: {
      type: UserPreferenceSchema,
      default: () => ({}),
    },
    stats: {
      type: UserStatsSchema,
      default: () => ({}),
    },
    achievements: [AchievementSchema],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    // toJSON: {
    //   transform: function(doc, ret) {
    //     delete ret.password;
    //     return ret;
    //   }
    // }
  }
);

// Indexes
// UserSchema.index({ username: 1 });
// UserSchema.index({ email: 1 });
// UserSchema.index({ level: -1, points: -1 });

export const UserModel = mongoose.model<IUser>("User", UserSchema);
