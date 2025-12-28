import { NotFoundError } from "../../errors/http.error";
import { CommentModel } from "../../models/comment.model";
import { IComment } from "../../types/comment.type";

export class CommentService {
  // ===== PUBLIC =====
  static async getAllComment(limit?: number) {
    const query = CommentModel.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .populate("userId")
      .populate("movieId")
      .populate("parentId");

    if (limit && limit > 0) {
      query.limit(limit);
    }

    return query;
  }

  static async getByMovie(movieId: string, limit?: number) {
    const query = CommentModel.find({ movieId: movieId, isDeleted: false })
      .sort({ createdAt: -1 })
      .populate("movieId")
      .populate("parentId");

    if (limit && limit > 0) {
      query.limit(limit);
    }
    return query;
  }

  static async getDetail(id: string) {
    const comment = await CommentModel.findById(id)
      .populate("movieId")
      .populate("parentId");

    if (!comment) throw new NotFoundError("Comment not found");
    return comment;
  }

  // ===== ADMIN / USER =====
  static async getAll() {
    return CommentModel.find().sort({ createdAt: -1 }).populate("movieId");
  }

  static async create(data: IComment) {
    return CommentModel.create(data);
  }

  static async update(id: string, data: Partial<IComment>) {
    const comment = await CommentModel.findByIdAndUpdate(id, data, {
      new: true,
    }).populate("movieId");

    if (!comment) throw new NotFoundError("Comment not found");
    return comment;
  }

  static async delete(id: string) {
    const comment = await CommentModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!comment) throw new NotFoundError("Comment not found");
  }
}
