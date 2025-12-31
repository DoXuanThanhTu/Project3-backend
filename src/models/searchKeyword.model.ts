import { Schema, model } from "mongoose";

export interface ISearchKeyword {
  keyword: string;
  count: number;
  lastSearched: Date;
  language?: string;
  deviceType?: string;
  country?: string;
}

const searchKeywordSchema = new Schema<ISearchKeyword>(
  {
    keyword: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    count: {
      type: Number,
      default: 1,
      min: 1,
    },
    lastSearched: {
      type: Date,
      default: Date.now,
      index: true,
    },
    language: {
      type: String,
      default: "vi",
    },
    deviceType: {
      type: String,
      enum: ["mobile", "tablet", "desktop", "other"],
    },
    country: String,
  },
  {
    timestamps: true,
    // collection: 'searchkeywords',
  }
);

// Index for trending searches
searchKeywordSchema.index({ lastSearched: -1, count: -1 });
searchKeywordSchema.index({ keyword: "text" });

export const SearchKeywordModel = model<ISearchKeyword>(
  "SearchKeyword",
  searchKeywordSchema
);
