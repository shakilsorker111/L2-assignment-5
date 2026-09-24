import api from "@/lib/axios";

import type {
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";

export const registerUser = async (
  payload: RegisterPayload
) => {
  const response =
    await api.post(
      "/auth/register",
      payload
    );

  return response.data;
};

export const loginUser = async (
  payload: LoginPayload
) => {
  const response =
    await api.post(
      "/auth/login",
      payload
    );

  return response.data;
};

export const getMe = async () => {
  const response =
    await api.get(
      "/auth/me"
    );

  return response.data;
};