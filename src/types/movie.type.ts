import { Types } from "mongoose";

export enum MovieType {
  MOVIE = "MOVIE",
  SERIES = "SERIES",
  EPISODE = "EPISODE",
  DOCUMENTARY = "DOCUMENTARY",
  ANIMATION = "ANIMATION",
  SHORT = "SHORT",
  SPECIAL = "SPECIAL",
}
export enum MovieFlagType {
  TRENDING = "trending",
  HOT = "hot",
  FEATURED = "featured",
  FAVORITE = "favorite",
  PROMOTION = "promotion", // Có thể thêm các flag khác
}
export interface MovieFlag {
  type: MovieFlagType;
  source: "admin" | "system"; // Nguồn gán flag
  startAt: Date;
  endAt: Date | null; // null nếu không có thời gian kết thúc
  metadata?: {
    score?: number; // Điểm số tính toán (cho system)
    reason?: string; // Lý do (cho admin)
    priority?: number; // Độ ưu tiên hiển thị
  };
  createdAt: Date;
  updatedAt: Date;
}
export interface IMovie {
  id?: Types.ObjectId;
  franchiseId?: Types.ObjectId;

  title: Map<string, string>;
  description?: Map<string, string>;
  slug: Map<string, string>;
  defaultLang: string;

  poster?: string;
  thumbnail?: string;
  banner?: string;
  backdrop?: string;
  trailerUrl?: string;

  type: MovieType; // dùng enum thay vì object schema

  currentEpisode?: number;
  totalEpisodes?: number;
  genres?: string[];
  cast?: Types.ObjectId[];
  director?: Types.ObjectId[];

  ratingAvg: number;
  views: number;
  year?: number;
  country?: string;
  isPublished: boolean;
  flags: MovieFlag[];
  totalViews: number;
  dailyViews: number; // Lượt xem trong ngày
  weeklyViews: number; // Lượt xem trong tuần
  likes: number;
  favorites: number;
  shares: number;
  comments: number;

  // Timestamps cho tính toán
  lastTrendingUpdate: Date;
}
