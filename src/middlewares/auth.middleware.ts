import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/http.error";
import { verifyAccessToken } from "../utils/jwt";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError("Authorization header missing");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError("Token not found");
    }

    // verifyAccessToken trả về payload (ví dụ: { userId, role, email })
    const payload = verifyAccessToken(token);
    req.user = payload; // cần mở rộng type Request để có user
    console.log("Authenticated user:", payload);
    next();
  } catch (error) {
    next(error); // chuyển lỗi cho error handler middleware
  }
};
