export interface CreateCheckoutPayload {
  rentalId: string;
}

export interface CheckoutSessionData {
  sessionId: string;
  url: string;
}

export interface CreateCheckoutResponse {
  success: boolean;
  message: string;
  data: CheckoutSessionData;
}

export interface Payment {
  id: string;
  rentalId: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string | null;
  transactionId?: string | null;
  createdAt: string;
  updatedAt: string;
}