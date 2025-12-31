import { Schema, model } from "mongoose";
import { IGenre } from "../types/genre.type";
const genreSchema = new Schema<IGenre>(
  {
    // ===== I18N =====
    title: {
      type: Map,
      of: String,
      required: true,
    },

    slug: {
      type: Map,
      of: String,
      required: true,
    },

    defaultLang: {
      type: String,
      default: "vi",
    },

    description: {
      type: Map,
      of: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const GenreModel = model<IGenre>("Genre", genreSchema);
