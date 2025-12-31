"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonModel = void 0;
const mongoose_1 = require("mongoose");
const personSchema = new mongoose_1.Schema({
    // ===== I18N =====
    name: {
        type: Map,
        of: String,
        required: true,
    },
    bio: {
        type: Map,
        of: String,
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
    // ===== INFO =====
    avatar: String,
    cover: String,
    birthday: Date,
    country: String,
    // ===== ROLE =====
    roles: {
        type: [String],
        enum: ["ACTOR", "DIRECTOR"],
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
exports.PersonModel = (0, mongoose_1.model)("Person", personSchema);
