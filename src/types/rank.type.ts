import { Types } from "mongoose";

export enum RankPeriod {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
  ALL_TIME = "all_time",
}

export enum RankType {
  MOST_VIEWED = "most_viewed",
  TOP_RATED = "top_rated",
  NEWEST = "newest",
  TRENDING = "trending",
  RECOMMENDED = "recommended",
}

export interface IRankFilter {
  period?: RankPeriod;
  type?: RankType;
  genre?: Types.ObjectId | string;
  country?: string;
  year?: number;
  limit?: number;
  page?: number;
  lang?: string;
}

export interface IRankMovie {
  _id: Types.ObjectId;
  title: string;
  poster?: string;
  thumbnail?: string;
  ratingAvg: number;
  views: number;
  year?: number;
  country?: string;
  type: string;
  rank: number;
  change?: number; // Thay đổi vị trí so với kỳ trước
  viewCount?: number; // Số lượt xem trong kỳ
}

export interface IRankResponse {
  period: RankPeriod;
  type: RankType;
  date: Date;
  movies: IRankMovie[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}
