import { Role, Status } from "./role.type";

export interface IUser {
  _id: string;
  email: string;
  password: string;
  role: Role;
  status: Status;
  displayName?: string;
  avatarUrl?: string;
}
export interface IUserPayload {
  userId: string;
  role: Role;
}
