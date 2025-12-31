// models/Favorite.model.ts
import mongoose, { Schema, Document } from "mongoose";
import { IFavorite } from "../types/test.type";

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // index: true,
    },
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    movie: {
      id: { type: String, required: true },
      title: { type: String, required: true },
      thumbnail: { type: String, required: true },
      genres: [{ type: String }],
      ratingAvg: { type: Number, default: 0 },
      releasedYear: { type: Number },
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate favorites
// FavoriteSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export const FavoriteModel = mongoose.model<IFavorite>(
  "Favorite",
  FavoriteSchema
);
