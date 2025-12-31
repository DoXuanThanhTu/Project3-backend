"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FranchiseModel = void 0;
const mongoose_1 = require("mongoose");
const franchiseSchema = new mongoose_1.Schema({
    title: { type: Map, of: String, required: true },
    description: { type: Map, of: String, required: true },
    slug: { type: Map, of: String, required: true },
    movies: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Movie" }],
    isPublished: { type: Boolean, default: true },
}, { timestamps: true });
exports.FranchiseModel = (0, mongoose_1.model)("Franchise", franchiseSchema);
