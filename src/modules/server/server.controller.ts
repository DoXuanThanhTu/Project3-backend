import { Request, Response } from "express";
import { ServerService } from "./server.service";

export class ServerController {
  // ===== PUBLIC =====
  static async getActive(req: Request, res: Response) {
    const servers = await ServerService.getAllActive();
    res.json({ success: true, data: servers });
  }

  static async getDetail(req: Request, res: Response) {
    const server = await ServerService.getDetail(req.params.id);
    res.json({ success: true, data: server });
  }

  // ===== ADMIN =====
  static async getAll(req: Request, res: Response) {
    const servers = await ServerService.getAll();
    res.json({ success: true, data: servers });
  }

  static async create(req: Request, res: Response) {
    const server = await ServerService.create(req.body);
    res.status(201).json({ success: true, data: server });
  }

  static async update(req: Request, res: Response) {
    const server = await ServerService.update(req.params.id, req.body);
    res.json({ success: true, data: server });
  }

  static async delete(req: Request, res: Response) {
    await ServerService.delete(req.params.id);
    res.json({ success: true });
  }
}
