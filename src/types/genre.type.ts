export interface IGenre {
  name: Map<string, string>;
  slug: Map<string, string>;
  description?: Map<string, string>;
  defaultLang: string;
  isActive: boolean;
}
