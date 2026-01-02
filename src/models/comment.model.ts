import { model, Schema } from "mongoose";
import { IComment } from "../types/comment.type";

const commentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },

    movieId: { type: Schema.Types.ObjectId, ref: "Movie" },
    episodeOrLabel: { type: String },
    episode: { type: Number },

    // Danh sách user đã like
    likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],

    // Nếu bạn muốn dislikes cũng là danh sách user, có thể đổi tương tự
    dislikes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    shares: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    useful: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],

    parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    replyCount: { type: Number, default: 0 }, // ⭐ QUAN TRỌNG
    totalLike: { type: Number, default: 0 },
    totalDislike: { type: Number, default: 0 },
    totalUseful: { type: Number, default: 0 },
    totalShare: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CommentModel = model<IComment>("Comment", commentSchema);
