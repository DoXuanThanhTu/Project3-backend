import { Schema, model, Types, Document } from "mongoose";
import { IMovie, MovieFlagType, MovieType } from "../types/movie.type";

// const movieSchema = new Schema<IMovie>(
//   {
//     // ===== I18N =====

//   },
//   { timestamps: true }
// );

// export const MovieModel = model<IMovie>("Movie", movieSchema);
// // src/models/Movie.model.ts
// import { Schema, model, Types, Document } from "mongoose";
// import { IMovie, MovieType, MovieFlagType } from "../types/movie.type";

const movieFlagSchema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(MovieFlagType),
      required: true,
    },
    source: {
      type: String,
      enum: ["admin", "system"],
      required: true,
    },
    startAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endAt: {
      type: Date,
      default: null,
    },
    metadata: {
      score: { type: Number, default: 0 },
      reason: { type: String },
      priority: { type: Number, default: 1 },
    },
  },
  { _id: false, timestamps: true }
);

const movieSchema = new Schema<IMovie>(
  {
    franchiseId: { type: Types.ObjectId, ref: "Franchise" },

    title: {
      type: Map,
      of: String,
      required: true, // ít nhất 1 ngôn ngữ
    },

    description: {
      type: Map,
      of: String,
    },

    slug: {
      type: Map,
      of: String,
      required: true,
    },

    // ===== META =====
    defaultLang: {
      type: String,
      default: "vi",
    },

    // ===== MEDIA =====
    poster: { type: String },
    thumbnail: { type: String },
    banner: { type: String },
    backdrop: { type: String },
    trailerUrl: { type: String },

    type: {
      type: String,
      enum: Object.values(MovieType),
      required: true,
      default: MovieType.MOVIE,
    },
    currentEpisode: { type: Number },
    totalEpisodes: { type: Number },
    // ===== RELATION =====
    genres: [{ type: Types.ObjectId, ref: "Genre" }],
    cast: [{ type: Types.ObjectId, ref: "Person" }],
    director: { type: Types.ObjectId, ref: "Person" },

    // ===== STAT =====
    ratingAvg: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    year: { type: Number }, // Năm sản xuất
    country: { type: String }, // Quốc gia (có thể nhiều)
    isPublished: { type: Boolean, default: false },
    // ... các field hiện có giữ nguyên ...

    // Thêm flags
    flags: [movieFlagSchema],

    // Thêm field thống kê
    dailyViews: { type: Number, default: 0 },
    weeklyViews: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    lastTrendingUpdate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes cho query hiệu quả
movieSchema.index({ "flags.type": 1, "flags.endAt": 1 });
movieSchema.index({ "flags.type": 1, "flags.startAt": 1, "flags.endAt": 1 });
movieSchema.index({ dailyViews: -1 });
movieSchema.index({ weeklyViews: -1 });
movieSchema.index({ "flags.type": 1, "metadata.score": -1 });

export const MovieModel = model<IMovie>("Movie", movieSchema);
