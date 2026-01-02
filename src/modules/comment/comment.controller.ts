import { Request, Response } from "express";
import { CommentService } from "./comment.service";
import { IComment } from "../../types/comment.type";
import { getLocalizedValue } from "../../utils/i18n.util";
import { da } from "zod/v4/locales";
import { UnauthorizedError } from "../../errors/http.error";

export class CommentController {
  // ===== PUBLIC =====
  static async getAllComment(req: Request, res: Response) {
    const {
      page = 1,
      limit = 24,
      sort_field = "updatedAt",
      sort_type = "desc",
      country,
      year,
      lang = "vi",
    } = req.query;

    const result = CommentService.getAllComment({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sort_field: sort_field as string,
      sort_type: sort_type as "asc" | "desc",
      year: year as string,
      lang: lang as string,
    });

    // const data = result.comments.map((comment: IComment) => {
    //   const displayName = (comment.userId as any)?.displayName;

    //   return {
    //     id: comment.id,
    //     displayName: displayName,
    //     content: comment.content,
    //     parentId: comment.parentId,
    //     isEdited: comment.isEdited,
    //     isDeleted: comment.isDeleted,
    //     createdAt: comment.createdAt,
    //     updatedAt: comment.updatedAt,
    //     movieName: comment.movieId
    //       ? getLocalizedValue(
    //           (comment.movieId as any).title,
    //           lang,
    //           (comment.movieId as any).defaultLang
    //         )
    //       : undefined,
    //     seasonOrLabel: comment.seasonOrLabel,
    //     episode: comment.episode,
    //     likes: comment.likes,
    //     dislikes: comment.dislikes,
    //     shares: comment.shares,
    //     useful: comment.useful,
    //   };
    // });

    const data = await result;
    res.json({ success: true, data: data });
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
        episodeOrLabel: comment.episodeOrLabel,
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
  static async react(req: Request, res: Response) {
    try {
      const commentId = req.params.id;
      const userId = req.user?.userId;
      const type = req.body.type as "like" | "dislike";

      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      if (!["like", "dislike"].includes(type))
        return res.status(400).json({ message: "Invalid type" });

      const comment = await CommentService.reactComment(
        commentId,
        userId,
        type
      );
      return res.json(comment);
    } catch (err: any) {
      res.status(500).json({ status: false, message: "Server error" });
    }
  }
  // ===== ADMIN / USER =====
  static async getRootComment(req: Request, res: Response) {
    const { page = 1, limit = 24, lang = "vi", movieId } = req.query;
    const comments = await CommentService.getRootComments(
      movieId as string | undefined,
      {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 24,
        lang: lang as string,
      }
    );
    res.json({ success: true, data: comments });
  }
  static async getRepliesByRoot(req: Request, res: Response) {
    const { page = 1, limit = 24 } = req.query;
    const comments = await CommentService.getRepliesByRoot(req.params.rootId, {
      page: Number(page),
      limit: Number(limit),
    });
    res.json({ success: true, data: comments });
  }
  static async getAll(req: Request, res: Response) {
    const comments = await CommentService.getAll();
    res.json({ success: true, data: comments });
  }

  static async create(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) throw UnauthorizedError;
    const comment = await CommentService.create({
      ...req.body,
      userId: userId,
    });
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
