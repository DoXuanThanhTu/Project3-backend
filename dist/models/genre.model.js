"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenreModel = void 0;
const mongoose_1 = require("mongoose");
const genreSchema = new mongoose_1.Schema({
    // ===== I18N =====
    title: {
        type: Map,
        of: String,
        required: true,
    },
    slug: {
        type: Map,
        of: String,
        required: true,
    },
    defaultLang: {
        type: String,
        default: "vi",
    },
    description: {
        type: Map,
        of: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
exports.GenreModel = (0, mongoose_1.model)("Genre", genreSchema);
