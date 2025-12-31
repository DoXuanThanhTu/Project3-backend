import { Role } from "./role.type";

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
  userId?: string;
  movie: {
    id: string;
    title: string;
    thumbnail: string;
    genres: string[];
    ratingAvg: number;
    duration: string;
  };
  watchedAt: Date;
  progress: number;
  duration: number;
}

export interface IFavorite {
  _id: string;
  userId?: string;
  movieId?: string;
  movie: {
    id: string;
    title: string;
    thumbnail: string;
    genres: string[];
    ratingAvg: number;
    releasedYear?: number;
  };
  addedAt: Date;
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
