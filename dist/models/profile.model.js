"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileModel = void 0;
const mongoose_1 = require("mongoose");
const profileSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    fullName: String,
    avatar: String,
    gender: {
        type: String,
        enum: ["MALE", "FEMALE", "OTHER"],
    },
    dateOfBirth: Date,
    phone: String,
    bio: String,
}, { timestamps: true });
exports.ProfileModel = (0, mongoose_1.model)("Profile", profileSchema);
