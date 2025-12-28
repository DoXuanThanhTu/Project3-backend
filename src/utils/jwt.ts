import jwt from "jsonwebtoken";
import { AccessTokenPayload, RefreshTokenPayload } from "../types/jwt.type";

const ACCESS_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "your_access_token_secret";
const REFRESH_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret";

// ================= ACCESS TOKEN =================
export const signAccessToken = (payload: AccessTokenPayload) => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: "1d",
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
};

// ================= REFRESH TOKEN =================
export const signRefreshToken = (payload: RefreshTokenPayload) => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
};
