import { Schema, model } from "mongoose";
import { IPerson } from "../types/person.type";
const personSchema = new Schema<IPerson>(
  {
    // ===== I18N =====
    name: {
      type: Map,
      of: String,
      required: true,
    },

    bio: {
      type: Map,
      of: String,
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

    // ===== INFO =====
    avatar: String,
    cover: String,
    birthday: Date,
    country: String,

    // ===== ROLE =====
    roles: {
      type: [String],
      enum: ["ACTOR", "DIRECTOR"],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const PersonModel = model<IPerson>("Person", personSchema);
