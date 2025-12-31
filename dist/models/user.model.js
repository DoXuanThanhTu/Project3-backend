"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const role_type_1 = require("../types/role.type");
const mongoose_1 = __importStar(require("mongoose"));
const UserPreferenceSchema = new mongoose_1.Schema({
    favoriteGenres: [{ type: String }],
    languages: [{ type: String }],
    quality: [{ type: String }],
    autoPlay: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
});
const UserStatsSchema = new mongoose_1.Schema({
    totalWatched: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
});
const AchievementSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    icon: { type: String, required: true },
    description: { type: String, required: true },
    achievedAt: { type: Date, default: Date.now },
});
const UserSchema = new mongoose_1.Schema({
    // username: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   trim: true,
    //   lowercase: true,
    // },
    displayName: {
        type: String,
        // required: true,
        // trim: true,
    },
    role: {
        type: String,
        enum: Object.values(role_type_1.Role),
        default: role_type_1.Role.USER,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    avatar: {
        type: String,
        default: "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
    },
    coverImage: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    joinDate: {
        type: Date,
        default: Date.now,
    },
    membership: {
        type: String,
        enum: ["Free", "Premium", "VIP"],
        default: "Free",
    },
    level: {
        type: Number,
        default: 1,
        min: 1,
        max: 100,
    },
    points: {
        type: Number,
        default: 0,
        min: 0,
    },
    preferences: {
        type: UserPreferenceSchema,
        default: () => ({}),
    },
    stats: {
        type: UserStatsSchema,
        default: () => ({}),
    },
    achievements: [AchievementSchema],
    followers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    following: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
}, {
    timestamps: true,
    // toJSON: {
    //   transform: function(doc, ret) {
    //     delete ret.password;
    //     return ret;
    //   }
    // }
});
// Indexes
// UserSchema.index({ username: 1 });
// UserSchema.index({ email: 1 });
// UserSchema.index({ level: -1, points: -1 });
exports.UserModel = mongoose_1.default.model("User", UserSchema);
