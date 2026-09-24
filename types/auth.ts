import type { User, UserRole } from "./user";

export interface LoginPayload {
  email: string;
  password: string;
}

export type RegisterRole = "CUSTOMER" | "PROVIDER";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: RegisterRole;
  phone?: string;
  avatar?: string;
}

export interface AuthData {
  accessToken: string;
  user: User;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthData;
}