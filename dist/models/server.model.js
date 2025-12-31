"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerModel = void 0;
const mongoose_1 = require("mongoose");
const serverSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    baseUrl: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.ServerModel = (0, mongoose_1.model)("Server", serverSchema);
