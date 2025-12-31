"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const http_error_1 = require("../../errors/http.error");
const comment_model_1 = require("../../models/comment.model");
class CommentService {
    // ===== PUBLIC =====
    static async getAllComment(limit) {
        const query = comment_model_1.CommentModel.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .populate("userId")
            .populate("movieId")
            .populate("parentId");
        if (limit && limit > 0) {
            query.limit(limit);
        }
        return query;
    }
    static async getByMovie(movieId, limit) {
        const query = comment_model_1.CommentModel.find({ movieId: movieId, isDeleted: false })
            .sort({ createdAt: -1 })
            .populate("movieId")
            .populate("parentId");
        if (limit && limit > 0) {
            query.limit(limit);
        }
        return query;
    }
    static async getDetail(id) {
        const comment = await comment_model_1.CommentModel.findById(id)
            .populate("movieId")
            .populate("parentId");
        if (!comment)
            throw new http_error_1.NotFoundError("Comment not found");
        return comment;
    }
    // ===== ADMIN / USER =====
    static async getAll() {
        return comment_model_1.CommentModel.find().sort({ createdAt: -1 }).populate("movieId");
    }
    static async create(data) {
        return comment_model_1.CommentModel.create(data);
    }
    static async update(id, data) {
        const comment = await comment_model_1.CommentModel.findByIdAndUpdate(id, data, {
            new: true,
        }).populate("movieId");
        if (!comment)
            throw new http_error_1.NotFoundError("Comment not found");
        return comment;
    }
    static async delete(id) {
        const comment = await comment_model_1.CommentModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!comment)
            throw new http_error_1.NotFoundError("Comment not found");
    }
}
exports.CommentService = CommentService;
