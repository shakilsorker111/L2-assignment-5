// services/category.service.ts

import api from "@/lib/axios";

export interface Category {
  id: string;
  name: string;
  slug?: string;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category[];
}

/**
 * Get all categories
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get("/categories");

  // Backend returns:
  // { success: true, message: "...", data: [...] }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  return [];
};

/**
 * Get single category
 */
export const getCategoryById = async (
  id: string
) => {
  const response = await api.get(
    `/categories/${id}`
  );

  return response.data;
};