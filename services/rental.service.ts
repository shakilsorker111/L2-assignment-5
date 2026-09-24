import api from "@/lib/axios";

import type {
  RentalOrder,
} from "@/types/rental";

/**
 * Get all rentals belonging to
 * the currently authenticated customer.
 */
export const getMyRentals = async () => {
  const response = await api.get(
    "/rentals/my-rentals"
  );

  return response.data;
};

/**
 * Get one rental by ID.
 *
 * The Authorization header is automatically
 * attached by the axios interceptor.
 */
export const getRentalById = async (
  id: string
): Promise<RentalOrder> => {
  const response = await api.get(
    `/rentals/${id}`
  );

  return response.data?.data;
};