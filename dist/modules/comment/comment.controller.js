"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const comment_service_1 = require("./comment.service");
const i18n_util_1 = require("../../utils/i18n.util");
class CommentController {
    // ===== PUBLIC =====
    static async getAllComment(req, res) {
        const lang = req.query.lang || "vi";
        const limit = req.query.limit
            ? parseInt(req.query.limit, 10)
            : undefined;
        const comments = await comment_service_1.CommentService.getAllComment(limit);
        const data = comments.map((comment) => {
            const displayName = comment.userId?.displayName;
            return {
                id: comment.id,
                displayName: displayName,
                content: comment.content,
                parentId: comment.parentId,
                isEdited: comment.isEdited,
                isDeleted: comment.isDeleted,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                movieName: comment.movieId
                    ? (0, i18n_util_1.getLocalizedValue)(comment.movieId.title, lang, comment.movieId.defaultLang)
                    : undefined,
                seasonOrLabel: comment.seasonOrLabel,
                episode: comment.episode,
                likes: comment.likes,
                dislikes: comment.dislikes,
                shares: comment.shares,
                useful: comment.useful,
            };
        });
        res.json({ success: true, data });
    }
    static async getByMovie(req, res) {
        const lang = req.query.lang || "vi";
        const limit = req.query.limit
            ? parseInt(req.query.limit, 10)
            : undefined;
        const comments = await comment_service_1.CommentService.getByMovie(req.params.movieId, limit);
        const data = comments.map((comment) => {
            const displayName = comment.userId?.displayName;
            return {
                id: comment.id,
                displayName: displayName,
                content: comment.content,
                parentId: comment.parentId,
                isEdited: comment.isEdited,
                isDeleted: comment.isDeleted,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                movieName: comment.movieId
                    ? (0, i18n_util_1.getLocalizedValue)(comment.movieId.title, lang, comment.movieId.defaultLang)
                    : undefined,
                seasonOrLabel: comment.seasonOrLabel,
                episode: comment.episode,
                likes: comment.likes,
                dislikes: comment.dislikes,
                shares: comment.shares,
                useful: comment.useful,
            };
        });
        res.json({ success: true, data: data });
    }
    static async getDetail(req, res) {
        const comment = await comment_service_1.CommentService.getDetail(req.params.id);
        res.json({ success: true, data: comment });
    }
    // ===== ADMIN / USER =====
    static async getAll(req, res) {
        const comments = await comment_service_1.CommentService.getAll();
        res.json({ success: true, data: comments });
    }
    static async create(req, res) {
        const comment = await comment_service_1.CommentService.create(req.body);
        res.status(201).json({ success: true, data: comment });
    }
    static async update(req, res) {
        const comment = await comment_service_1.CommentService.update(req.params.id, req.body);
        res.json({ success: true, data: comment });
    }
    static async delete(req, res) {
        await comment_service_1.CommentService.delete(req.params.id);
        res.json({ success: true });
    }
}
exports.CommentController = CommentController;
