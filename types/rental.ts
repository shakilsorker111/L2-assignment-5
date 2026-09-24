export type RentalStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface RentalGear {
  id: string;
  title: string;
  image?: string | null;
  pricePerDay?: number;
}

export interface RentalOrder {
  id: string;

  gearId?: string;
  userId?: string;
  providerId?: string;

  startDate: string;
  endDate: string;

  quantity: number;

  totalAmount: number;

  status: RentalStatus;

  paymentStatus?: PaymentStatus;

  paymentId?: string | null;

  gear?: RentalGear | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePaymentPayload {
  rentalId: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  message: string;

  data?: {
    paymentId?: string;
    paymentUrl?: string;
    checkoutUrl?: string;
    url?: string;
  };
}