import { IEpisode } from "./episode.type";

export interface IServer {
  _id: string;
  name: string;
  baseUrl: string;
  isActive: boolean;
}
