import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    tokenHash: { type: String, required: true },

    expiresAt: { type: Date, required: true },

    deviceId: String,
    userAgent: String,
    ipAddress: String,

    revoked: { type: Boolean, default: false },
    lastUsedAt: Date,
  },
  { timestamps: true }
);

export const RefreshTokenModel = model("RefreshToken", refreshTokenSchema);
