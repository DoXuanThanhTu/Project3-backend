// models/viewCounter.model.ts
import { model, Schema } from "mongoose";

const ViewCounterSchema = new Schema(
  {
    // Liên kết với Movie và Episode
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
      index: true,
    },
    episodeId: {
      type: Schema.Types.ObjectId,
      ref: "Episode",
      default: null,
      index: true,
    },

    // Thông tin view
    date: {
      type: Date,
      required: true,
      index: true,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Phân loại view
    viewType: {
      type: String,
      enum: ["movie", "episode", "trailer", "preview"],
      default: "movie",
    },

    // Thông tin người dùng (nếu có)
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Thông tin device/session để tránh spam
    sessionId: String,
    ipAddress: String,
    userAgent: String,

    // Thời gian xem (cho phân tích)
    watchDuration: {
      type: Number, // tính bằng giây
      default: 0,
    },

    // Trạng thái
    isUnique: {
      // View duy nhất (không tính refresh)
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "viewcounters", // Tên collection
  }
);

// Indexes để tối ưu query
ViewCounterSchema.index({ movieId: 1, date: 1 });
ViewCounterSchema.index(
  { movieId: 1, episodeId: 1, date: 1 },
  { unique: true }
);
ViewCounterSchema.index({ date: 1, count: -1 });
ViewCounterSchema.index({ movieId: 1, viewType: 1, date: 1 });
ViewCounterSchema.index({ sessionId: 1, movieId: 1 }, { sparse: true });

export const ViewCounterModel = model("ViewCounter", ViewCounterSchema);
