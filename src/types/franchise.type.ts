import { IMovie } from "./movie.type";

export interface IFranchise {
  _id: string;
  title: Map<string, string>;
  description: Map<string, string>;
  slug: Map<string, string>;
  defaultLang: string;
  movies?: IMovie[];
  isPublished: boolean;
}
