// models/WatchHistory.model.ts
import mongoose, { Schema, Document } from "mongoose";
import { IWatchHistory } from "../types/test.type";

const WatchHistorySchema = new Schema<IWatchHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    episodeId: {
      type: Schema.Types.ObjectId,
      ref: "Episode",
      required: false,
    },
    currentTime: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    watchDuration: {
      type: Number,
      default: 0,
    },
    watchedPercentage: {
      type: Number,
      default: 0,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
    watchCount: {
      type: Number,
      default: 1,
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
