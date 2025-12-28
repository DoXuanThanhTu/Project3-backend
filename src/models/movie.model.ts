import { Schema, model, Types, Document } from "mongoose";
import { IMovie, MovieType } from "../types/movie.type";

const movieSchema = new Schema<IMovie>(
  {
    // ===== I18N =====
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
  },
  { timestamps: true }
);

export const MovieModel = model<IMovie>("Movie", movieSchema);
