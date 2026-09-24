export type UserRole =
  | "CUSTOMER"
  | "PROVIDER"
  | "ADMIN";

export interface User {
  id: string;

  name: string;

  email: string;

  role: UserRole;

  avatar?: string | null;

  status?: string;

  createdAt?: string;
}