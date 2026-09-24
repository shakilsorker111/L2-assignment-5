import api from "@/lib/axios";

import type {
  CategoriesResponse,
} from "@/types/category";

export const getCategories =
  async (): Promise<CategoriesResponse> => {
    const response =
      await api.get("/categories");

    return response.data;
  };