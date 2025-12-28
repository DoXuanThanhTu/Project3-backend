import { model, Schema } from "mongoose";
import { IServer } from "../types/server.type";

const serverSchema = new Schema<IServer>(
  {
    name: { type: String, required: true },
    baseUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export const ServerModel = model<IServer>("Server", serverSchema);
