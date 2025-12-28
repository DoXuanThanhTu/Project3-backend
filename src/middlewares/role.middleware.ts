import { Request, Response, NextFunction } from "express";
import { Role } from "../types/role.type";
import { ForbiddenError } from "../errors/http.error";

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new ForbiddenError();

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError("Permission denied");
    }

    next();
  };
