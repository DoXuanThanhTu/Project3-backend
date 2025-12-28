import { NotFoundError } from "../../errors/http.error";
import { ServerModel } from "../../models/server.model";
import { IServer } from "../../types/server.type";

export class ServerService {
  // ===== PUBLIC =====
  static async getAllActive() {
    return ServerModel.find({ isActive: true }).sort({ createdAt: 1 });
  }

  static async getDetail(id: string) {
    const server = await ServerModel.findById(id);
    if (!server) throw new NotFoundError("Server not found");
    return server;
  }

  // ===== ADMIN =====
  static async getAll() {
    return ServerModel.find().sort({ createdAt: -1 });
  }

  static async create(data: IServer) {
    return ServerModel.create(data);
  }

  static async update(id: string, data: Partial<IServer>) {
    const server = await ServerModel.findByIdAndUpdate(id, data, { new: true });
    if (!server) throw new NotFoundError("Server not found");
    return server;
  }

  static async delete(id: string) {
    const server = await ServerModel.findByIdAndDelete(id);
    if (!server) throw new NotFoundError("Server not found");
  }
}
