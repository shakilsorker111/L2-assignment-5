// services/gear.service.ts

import api from "@/lib/axios";

import type {
  CreateGearPayload,
  GearListResponse,
  GearResponse,
} from "@/types/gear";

/**
 * Get all gears
 */
export const getGears = async (): Promise<GearListResponse> => {
  const response = await api.get("/gear");

  return response.data;
};

/**
 * Get single gear
 */
export const getGearById = async (
  id: string
): Promise<GearResponse> => {
  const response = await api.get(`/gear/${id}`);

  return response.data;
};

/**
 * Provider creates gear
 */
export const createGear = async (
  payload: CreateGearPayload
): Promise<GearResponse> => {
  const response = await api.post(
    "/provider/gear",
    payload
  );

  return response.data;
};

/**
 * Provider updates gear
 */
export const updateGear = async (
  id: string,
  payload: Partial<CreateGearPayload>
): Promise<GearResponse> => {
  const response = await api.patch(
    `/provider/gear/${id}`,
    payload
  );

  return response.data;
};

/**
 * Provider deletes gear
 */
export const deleteGear = async (
  id: string
): Promise<GearResponse> => {
  const response = await api.delete(
    `/provider/gear/${id}`
  );

  return response.data;
};