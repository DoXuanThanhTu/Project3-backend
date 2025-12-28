import { Request, Response } from "express";
import { UserService } from "./user.service";

export class UserController {
  static async getAll(req: Request, res: Response) {
    const users = await UserService.getAllUsers();
    res.json({ success: true, data: users });
  }

  static async getById(req: Request, res: Response) {
    const user = await UserService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  }
  static async update(req: Request, res: Response) {
    const user = await UserService.updateUser(req.params.id, req.body);
    res.json({ success: true, data: user });
  }
  static async updateRole(req: Request, res: Response) {
    const user = await UserService.updateUserRole(req.params.id, req.body.role);
    res.json({ success: true, data: user });
  }

  static async updateStatus(req: Request, res: Response) {
    const user = await UserService.updateUserStatus(
      req.params.id,
      req.body.status
    );
    res.json({ success: true, data: user });
  }
}
