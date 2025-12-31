import { model, Schema } from "mongoose";
import { IFranchise } from "../types/franchise.type";

const franchiseSchema = new Schema<IFranchise>(
  {
    title: { type: Map, of: String, required: true },
    description: { type: Map, of: String, required: true },
    slug: { type: Map, of: String, required: true },
    movies: [{ type: Schema.Types.ObjectId, ref: "Movie" }],
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export const FranchiseModel = model<IFranchise>("Franchise", franchiseSchema);
