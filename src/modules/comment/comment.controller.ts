import { Request, Response } from "express";
import { CommentService } from "./comment.service";
import { IComment } from "../../types/comment.type";
import { getLocalizedValue } from "../../utils/i18n.util";
import { da } from "zod/v4/locales";

export class CommentController {
  // ===== PUBLIC =====
  static async getAllComment(req: Request, res: Response) {
    const lang = (req.query.lang as string) || "vi";

    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;

    const comments = await CommentService.getAllComment(limit);

    const data = comments.map((comment: IComment) => {
      const displayName = (comment.userId as any)?.displayName;

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
          ? getLocalizedValue(
              (comment.movieId as any).title,
              lang,
              (comment.movieId as any).defaultLang
            )
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

  static async getByMovie(req: Request, res: Response) {
    const lang = (req.query.lang as string) || "vi";

    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;

    const comments = await CommentService.getByMovie(req.params.movieId, limit);
    const data = comments.map((comment: IComment) => {
      const displayName = (comment.userId as any)?.displayName;

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
          ? getLocalizedValue(
              (comment.movieId as any).title,
              lang,
              (comment.movieId as any).defaultLang
            )
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

  static async getDetail(req: Request, res: Response) {
    const comment = await CommentService.getDetail(req.params.id);
    res.json({ success: true, data: comment });
  }

  // ===== ADMIN / USER =====
  static async getAll(req: Request, res: Response) {
    const comments = await CommentService.getAll();
    res.json({ success: true, data: comments });
  }

  static async create(req: Request, res: Response) {
    const comment = await CommentService.create(req.body);
    res.status(201).json({ success: true, data: comment });
  }

  static async update(req: Request, res: Response) {
    const comment = await CommentService.update(req.params.id, req.body);
    res.json({ success: true, data: comment });
  }

  static async delete(req: Request, res: Response) {
    await CommentService.delete(req.params.id);
    res.json({ success: true });
  }
}
