import { model, Schema } from "mongoose";
import { IEpisode } from "../types/episode.type";

const episodeSchema = new Schema<IEpisode>(
  {
    movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    serverId: { type: Schema.Types.ObjectId, ref: "Server", required: true },
    title: { type: Map, of: String },
    description: { type: Map, of: String },
    slug: { type: Map, of: String },
    defaultLang: { type: String },
    episodeOrLabel: String,
    duration: String,
    thumbnail: String,
    videoUrl: String,
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export const EpisodeModel = model<IEpisode>("Episode", episodeSchema);
