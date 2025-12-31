import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../errors/http.error";
import { Role } from "../types/role.type";

export const authorize =
  (allowedRoles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ForbiddenError("User not authenticated");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError("You do not have permission");
    }

    next();
  };
