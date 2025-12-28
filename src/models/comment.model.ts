import { model, Schema, Document } from "mongoose";
import { IComment } from "../types/comment.type";

const commentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },

    movieId: { type: Schema.Types.ObjectId, ref: "Movie" },
    seasonOrLabel: { type: String },
    episode: { type: Number },

    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    useful: { type: Number, default: 0 },

    parentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CommentModel = model<IComment>("Comment", commentSchema);
