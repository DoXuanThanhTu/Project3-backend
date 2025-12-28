import crypto from "crypto";
import { RefreshTokenModel } from "../../models/refreshToken.model";
import { UserModel } from "../../models/user.model";
import { hashPassword, comparePassword } from "../../utils/hash";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { UnauthorizedError } from "../../errors/http.error";

const REFRESH_EXPIRE_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthService {
  static async register(email: string, password: string, meta: TokenMeta) {
    const user = await UserModel.create({
      email,
      password: await hashPassword(password),
    });

    return this.issueTokens(user, meta);
  }

  static async login(email: string, password: string, meta: TokenMeta) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new UnauthorizedError();

    const ok = await comparePassword(password, user.password);
    if (!ok) throw new UnauthorizedError();

    return this.issueTokens(user, meta);
  }

  static async refresh(oldRefreshToken: string) {
    const payload = verifyRefreshToken(oldRefreshToken);

    const tokenHash = this.hashToken(oldRefreshToken);

    const record = await RefreshTokenModel.findOne({
      userId: payload.userId,
      tokenHash,
      revoked: false,
    });

    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedError();
    }

    // Rotation
    record.revoked = true;
    record.lastUsedAt = new Date();
    await record.save();

    const user = await UserModel.findById(payload.userId);
    if (!user) throw new UnauthorizedError();

    return this.issueTokens(user, {
      deviceId: record.deviceId || "",
      userAgent: record.userAgent || "",
      ipAddress: record.ipAddress || "",
    });
  }

  static async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await RefreshTokenModel.updateOne({ tokenHash }, { revoked: true });
  }

  static async logoutAll(userId: string) {
    await RefreshTokenModel.updateMany({ userId }, { revoked: true });
  }

  // ===== PRIVATE =====

  private static async issueTokens(user: any, meta: TokenMeta) {
    const refreshToken = signRefreshToken({ userId: user._id });
    const tokenHash = this.hashToken(refreshToken);

    await RefreshTokenModel.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRE_MS),
      ...meta,
    });

    return {
      accessToken: signAccessToken({
        userId: user._id,
        role: user.role,
      }),
      refreshToken,
    };
  }

  private static hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}

type TokenMeta = {
  deviceId?: string;
  userAgent?: string;
  ipAddress?: string;
};
