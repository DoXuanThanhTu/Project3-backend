// models/Review.model.ts
import mongoose, { Schema, Document } from "mongoose";
import { IReview } from "../types/test.type";

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
      index: true,
    },
    movieTitle: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
// ReviewSchema.index({ userId: 1, date: -1 });
// ReviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);
