// types/gear.ts

export interface Gear {
  id: string;

  title: string;

  brand: string;

  description: string;

  condition: string;

  pricePerDay: number;

  stock: number;

  availableStock: number;

  image: string;

  isAvailable: boolean;

  categoryId?: string;

  category?: {
    id: string;
    name: string;
    slug: string;
  };

  providerId?: string;

  provider?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };

  createdAt?: string;

  updatedAt?: string;
}

export interface CreateGearPayload {
  title: string;
  brand: string;
  description: string;
  condition: string;
  pricePerDay: number;
  stock: number;
  image: string;
  categoryId: string;
}

export interface GearResponse {
  success: boolean;
  message: string;
  data: Gear;
}

export interface GearListResponse {
  success: boolean;
  message: string;
  data: Gear[];
}