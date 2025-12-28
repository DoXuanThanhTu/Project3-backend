export type PersonRole = "ACTOR" | "DIRECTOR";

export interface IPerson {
  name: Map<string, string>;
  slug: Map<string, string>;
  bio?: Map<string, string>;
  defaultLang: string;

  avatar?: string;
  cover?: string;
  birthday?: Date;
  country?: string;

  roles: PersonRole[];
  isActive: boolean;
}
