"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    movieId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Movie" },
    seasonOrLabel: { type: String },
    episode: { type: Number },
    // Danh sách user đã like
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: [] }],
    // Nếu bạn muốn dislikes cũng là danh sách user, có thể đổi tương tự
    dislikes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: [] }],
    shares: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: [] }],
    useful: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: [] }],
    parentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Comment" },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.CommentModel = (0, mongoose_1.model)("Comment", commentSchema);
