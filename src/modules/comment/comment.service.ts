import { NotFoundError } from "../../errors/http.error";
import { CommentModel } from "../../models/comment.model";
import { MovieModel } from "../../models/movie.model";
import { IComment } from "../../types/comment.type";
import { getLocalizedValueMap } from "../../utils/i18n.util";

export class CommentService {
  private static formatComment(comment: IComment, lang: string) {
    const user = comment.userId as any;
    const parent = comment.parentId as any;

    return {
      id: comment.id,

      user: user
        ? {
            id: user._id,
            displayName: user.displayName,
            avatar: user.avatar,
          }
        : null,

      content: comment.content,

      parent: parent
        ? {
            id: parent._id,
            user: parent.userId
              ? {
                  id: parent.userId._id,
                  displayName: parent.userId.displayName,
                  avatar: parent.userId.avatar,
                }
              : null,
          }
        : null,

      replyCount: comment.replyCount || 0, // ⭐ ADD
      likes: comment.likes || [],
      dislikes: comment.dislikes || [],

      useful: comment.useful || [],
      shares: comment.shares || [],
      totalLike: comment.totalLike || 0,
      totalDislike: comment.totalDislike || 0,
      totalUseful: comment.totalUseful || 0,
      totalShare: comment.totalShare || 0,
      isEdited: comment.isEdited,
      isDeleted: comment.isDeleted,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,

      movieName: comment.movieId
        ? getLocalizedValueMap(
            (comment.movieId as any)?.title || {},
            lang,
            "vi"
          )
        : null,

      episode: comment.episode,
      episodeOrLabel: comment.episodeOrLabel,
    };
  }
  static async getRootComments(
    movieId?: string,
    options: {
      page?: number;
      limit?: number;
      lang?: string;
    } = {}
  ) {
    const { page = 1, limit = 10, lang = "vi" } = options;
    const skip = (page - 1) * limit;

    // ✅ build query đúng
    const query: any = {
      parentId: null,
      isDeleted: false,
    };

    if (movieId) {
      query.movieId = movieId;
    }

    const [comments, total] = await Promise.all([
      CommentModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("userId", "_id displayName avatar")
        .populate("movieId", "_id title slug"),
      // .populate("likes", "_id displayName")
      // .populate("dislikes", "_id displayName"),

      CommentModel.countDocuments(query),
    ]);

    return {
      comments: comments.map((c) => this.formatComment(c, lang)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  static async getRepliesByRoot(
    rootId: string,
    options: {
      page?: number;
      limit?: number;
      lang?: string;
    } = {}
  ) {
    const { page = 1, limit = 5, lang = "vi" } = options;
    const skip = (page - 1) * limit;

    const replies = await CommentModel.find({
      $or: [{ parentId: rootId }],
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "_id displayName avatar")
      .populate({
        path: "parentId",
        populate: {
          path: "userId",
          select: "_id displayName avatar",
        },
      });

    return {
      comments: replies.map((comment) => this.formatComment(comment, lang)),
      pagination: {
        page,
        limit,
        total: replies.length,
        totalPages: Math.ceil(replies.length / limit),
      },
    };
  }
  static async getMyComment(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      sort_field?: string;
      sort_type?: "asc" | "desc";
      year?: string;
      lang?: string;
    } = {}
  ) {
    const {
      page = 1,
      limit = 24,
      sort_field = "updatedAt",
      sort_type = "desc",
      year,
      lang,
    } = options;

    const query: any = {
      userId,
      isDeleted: false,
    };

    if (year) {
      query.updatedAt = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${Number(year) + 1}-01-01`),
      };
    }

    const sortFieldMap: Record<string, string> = {
      created: "createdAt",
      updated: "updatedAt",
      _id: "_id",
    };

    const dbSortField = sortFieldMap[sort_field] || "updatedAt";
    const sortOption: any = {
      [dbSortField]: sort_type === "asc" ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      CommentModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        .populate("userId", "_id displayName avatar")
        .populate("movieId", "_id title slug")
        .populate("likes", "_id displayName avatar")
        .populate("dislikes", "_id displayName avatar")
        .populate({
          path: "parentId",
          populate: {
            path: "userId",
            select: "_id displayName avatar",
          },
        }),
      CommentModel.countDocuments(query),
    ]);

    return {
      comments: comments.map((comment) =>
        this.formatComment(comment, options.lang || "vi")
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  static async getAllComment(
    options: {
      page?: number;
      limit?: number;
      sort_field?: string;
      sort_type?: "asc" | "desc";
      year?: string;
      lang?: string;
    } = {}
  ) {
    const {
      page = 1,
      limit = 24,
      sort_field = "updatedAt",
      sort_type = "desc",
      year,
      lang,
    } = options;

    const query: any = {
      isDeleted: false,
    };

    if (year) {
      query.updatedAt = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${Number(year) + 1}-01-01`),
      };
    }

    const sortFieldMap: Record<string, string> = {
      created: "createdAt",
      updated: "updatedAt",
      _id: "_id",
    };

    const dbSortField = sortFieldMap[sort_field] || "updatedAt";
    const sortOption: any = {
      [dbSortField]: sort_type === "asc" ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      CommentModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        .populate("userId", "_id displayName avatar")
        .populate("movieId", "_id title slug")
        .populate({
          path: "parentId",
          populate: {
            path: "userId",
            select: "_id displayName avatar",
          },
        }),
      CommentModel.countDocuments(query),
    ]);

    return {
      comments: comments.map((comment) =>
        this.formatComment(comment, options.lang || "vi")
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
      .populate("userId", "_id displayName avatar")
      .populate("movieId", "_id title slug")
      .populate("parentId");

    if (!comment) throw new NotFoundError("Comment not found");
    return comment;
  }

  // ===== ADMIN / USER =====
  static async getAll() {
    return CommentModel.find()
      .sort({ createdAt: -1 })
      .populate("movieId", "_id title slug")
      .populate("userId", "_id displayName");
  }

  static async create(data: IComment) {
    // 1. Tạo comment
    const comment = await CommentModel.create(data);

    // 2. Nếu có parentId, tăng replyCount của parent **không cần fetch lại parent**
    if (data.parentId) {
      await CommentModel.findByIdAndUpdate(data.parentId, {
        $inc: { replyCount: 1 },
      });
    }
    if (data.movieId) {
      await MovieModel.findByIdAndUpdate(data.movieId, {
        $inc: { comments: 1 },
      });
    }
    // 3. Lấy comment vừa tạo với populate
    const createdComment = await CommentModel.findById(comment._id)
      .populate("movieId", "_id title slug")
      .populate("userId", "_id displayName avatar");

    // 4. Format và trả về
    if (!createdComment) {
      throw new NotFoundError("Failed to retrieve created comment");
    }
    return this.formatComment(createdComment, "vi");
  }

  static async update(id: string, data: Partial<IComment>) {
    const comment = await CommentModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!comment) throw new NotFoundError("Comment not found");
    return comment;
  }

  static async delete(id: string) {
    const comment = await CommentModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (comment?.movieId) {
      await MovieModel.findByIdAndUpdate(comment.movieId, {
        $inc: { comments: -1 },
      });
    }
    if (comment?.parentId) {
      await CommentModel.findByIdAndUpdate(comment.parentId, {
        $inc: { replyCount: -1 },
      });
    }
    if (!comment) throw new NotFoundError("Comment not found");
  }
  static async reactComment(
    commentId: string,
    userId: string,
    type: "like" | "dislike"
  ) {
    const comment = await CommentModel.findById(commentId);
    if (!comment) throw new NotFoundError("Comment not found");

    const isLike = type === "like";
    const currentField = isLike ? "likes" : "dislikes";
    const oppositeField = isLike ? "dislikes" : "likes";
    const totalField = isLike ? "totalLike" : "totalDislike";
    const totalOpposite = isLike ? "totalDislike" : "totalLike";

    if (!Array.isArray(comment[currentField])) comment[currentField] = [];
    if (!Array.isArray(comment[oppositeField])) comment[oppositeField] = [];

    const currentArray = comment[currentField] as string[];
    const oppositeArray = comment[oppositeField] as string[];

    const hasReacted = currentArray.includes(userId);

    if (hasReacted) {
      // Toggle: nếu đã react thì remove
      comment[currentField] = currentArray.filter(
        (id) => id.toString() !== userId
      ) as any;
      (comment[totalField as keyof typeof comment] as number) = Math.max(
        ((comment[totalField as keyof typeof comment] as number) || 1) - 1,
        0
      );
    } else {
      // Add userId vào current
      currentArray.push(userId);
      (comment[totalField as keyof typeof comment] as number) =
        ((comment[totalField as keyof typeof comment] as number) || 0) + 1;

      // Nếu user trước đó đã react opposite => remove
      if (oppositeArray.includes(userId)) {
        comment[oppositeField] = oppositeArray.filter(
          (id) => id.toString() !== userId
        ) as any;
        (comment[totalOpposite as keyof typeof comment] as number) = Math.max(
          ((comment[totalOpposite as keyof typeof comment] as number) || 1) - 1,
          0
        );
      }
    }

    await comment.save();
    return comment;
  }
}
