export enum MovieType {
  MOVIE = "MOVIE",
  SERIES = "SERIES",
  EPISODE = "EPISODE",
  DOCUMENTARY = "DOCUMENTARY",
  ANIMATION = "ANIMATION",
  SHORT = "SHORT",
  SPECIAL = "SPECIAL",
}

export interface IMovie {
  id?: string;
  franchiseId?: string;

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
  cast?: string[];
  director?: string;

  ratingAvg: number;
  views: number;
  year?: number;
  country?: string;
  isPublished: boolean;
}
