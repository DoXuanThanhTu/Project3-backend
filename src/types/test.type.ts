import { Role } from "./role.type";
import { Types } from "mongoose";

export interface IUser {
  _id: string;
  username: string;
  displayName: string;
  role: Role;
  email: string;
  phone?: string;
  avatar?: string;
  coverImage?: string;
  password: string;
  joinDate: Date;
  membership: "Free" | "Premium" | "VIP";
  level: number;
  points: number;
  preferences?: IUserPreference;
  stats?: IUserStats;
  achievements?: IAchievement[];
  followers?: string[];
  following?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPreference {
  favoriteGenres: string[];
  languages: string[];
  quality: string[];
  autoPlay: boolean;
  notifications: boolean;
}

export interface IUserStats {
  totalWatched: number;
  totalHours: number;
  favorites: number;
  reviews: number;
  followers: number;
  following: number;
}

export interface IAchievement {
  _id: string;
  name: string;
  icon: string;
  description: string;
  achievedAt?: Date;
}

export interface IWatchHistory {
  _id: string;
  userId: Types.ObjectId;
  movieId: Types.ObjectId;
  episodeId?: Types.ObjectId;
  currentTime?: number;
  duration?: number;
  watchDuration?: number;
  watchedPercentage?: number;
  lastWatchedAt?: Date;
  watchCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFavorite {
  _id: string;
  userId: Types.ObjectId;
  movieId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview {
  _id: string;
  userId?: string;
  movieId?: string;
  movieTitle: string;
  rating: number;
  comment: string;
  likes: number;
  date: Date;
}
