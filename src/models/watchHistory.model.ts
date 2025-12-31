// models/WatchHistory.model.ts
import mongoose, { Schema, Document } from "mongoose";
import { IWatchHistory } from "../types/test.type";

const WatchHistorySchema = new Schema<IWatchHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // index: true,
    },
    movie: {
      id: { type: String, required: true },
      title: { type: String, required: true },
      thumbnail: { type: String, required: true },
      genres: [{ type: String }],
      ratingAvg: { type: Number, default: 0 },
      duration: { type: String },
    },
    watchedAt: {
      type: Date,
      default: Date.now,
      // index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
// WatchHistorySchema.index({ userId: 1, watchedAt: -1 });
// WatchHistorySchema.index({ userId: 1, "movie.id": 1 }, { unique: true });

export const WatchHistoryModel = mongoose.model<IWatchHistory>(
  "WatchHistory",
  WatchHistorySchema
);
