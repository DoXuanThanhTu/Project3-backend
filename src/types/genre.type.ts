export interface IGenre {
  title: Map<string, string>;
  slug: Map<string, string>;
  description?: Map<string, string>;
  defaultLang: string;
  isActive: boolean;
}
