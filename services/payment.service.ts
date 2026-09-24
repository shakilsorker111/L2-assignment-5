import api from "@/lib/axios";

import type {
  CreateCheckoutPayload,
  CreateCheckoutResponse,
  Payment,
} from "@/types/payment";

/**
 * Create Stripe Checkout Session
 *
 * POST /api/payments/create-checkout-session
 */
export const createCheckoutSession = async (
  payload: CreateCheckoutPayload
): Promise<CreateCheckoutResponse> => {
  const response = await api.post(
    "/payments/create-checkout-session",
    payload
  );

  return response.data;
};

/**
 * Get logged-in customer's payments
 *
 * GET /api/payments/my-payments
 */
export const getMyPayments = async (): Promise<{
  success: boolean;
  message: string;
  data: Payment[];
}> => {
  const response = await api.get(
    "/payments/my-payments"
  );

  return response.data;
};

/**
 * Get payment by ID
 *
 * GET /api/payments/:id
 */
export const getPaymentById = async (
  id: string
): Promise<{
  success: boolean;
  message: string;
  data: Payment;
}> => {
  const response = await api.get(
    `/payments/${id}`
  );

  return response.data;
};