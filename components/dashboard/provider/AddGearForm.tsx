"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Save,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { getCategories } from "@/services/category.service";
import { createGear } from "@/services/gear.service";
import type { Category } from "@/types/category";

interface FormState {
  title: string;
  brand: string;
  description: string;
  condition: string;
  pricePerDay: string;
  stock: string;
  image: string;
  categoryId: string;
}

const initialForm: FormState = {
  title: "",
  brand: "",
  description: "",
  condition: "",
  pricePerDay: "",
  stock: "",
  image: "",
  categoryId: "",
};

/**
 * Supports category responses shaped as:
 * Category[]
 * { data: Category[] }
 * { data: { data: Category[] } }
 * { categories: Category[] }
 */
function extractCategories(response: unknown): Category[] {
  if (Array.isArray(response)) {
    return response as Category[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const result = response as Record<string, unknown>;

  if (Array.isArray(result.categories)) {
    return result.categories as Category[];
  }

  if (Array.isArray(result.data)) {
    return result.data as Category[];
  }

  if (result.data && typeof result.data === "object") {
    return extractCategories(result.data);
  }

  if (result.categories && typeof result.categories === "object") {
    return extractCategories(result.categories);
  }

  return [];
}

export default function AddGearForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    setCategoryError("");

    try {
      const response: unknown = await getCategories();
      const items = extractCategories(response).filter(
        (category) =>
          category &&
          typeof category.id === "string" &&
          typeof category.name === "string"
      );

      setCategories(items);

      if (items.length === 0) {
        setCategoryError(
          "No categories were returned by the API. Check whether categories exist in your database."
        );
      }
    } catch (error: unknown) {
      console.error("Load categories error:", error);

      setCategories([]);
      setCategoryError(
        "Could not load categories. Check your API URL and category endpoint."
      );
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "image") {
      setImageError(false);
    }
  };

  const validate = () => {
    if (!form.title.trim()) {
      toast.error("Gear title is required");
      return false;
    }

    if (!form.brand.trim()) {
      toast.error("Brand is required");
      return false;
    }

    if (!form.description.trim()) {
      toast.error("Description is required");
      return false;
    }

    if (!form.condition) {
      toast.error("Please select gear condition");
      return false;
    }

    const price = Number(form.pricePerDay);

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Price must be greater than 0");
      return false;
    }

    const stock = Number(form.stock);

    if (!Number.isInteger(stock) || stock <= 0) {
      toast.error("Stock must be a positive whole number");
      return false;
    }

    if (!form.categoryId) {
      toast.error("Please select a category");
      return false;
    }

    if (!form.image.trim()) {
      toast.error("Image URL is required");
      return false;
    }

    try {
      const url = new URL(form.image);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Invalid image URL protocol");
      }
    } catch {
      toast.error("Please enter a valid image URL");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);

      await createGear({
        title: form.title.trim(),
        brand: form.brand.trim(),
        description: form.description.trim(),
        condition: form.condition,
        pricePerDay: Number(form.pricePerDay),
        stock: Number(form.stock),
        image: form.image.trim(),
        categoryId: form.categoryId,
      });

      toast.success("Gear added successfully");
      setForm(initialForm);
      router.push("/dashboard/provider");
      router.refresh();
    } catch (error: unknown) {
      console.error("Create gear error:", error);

      const apiError = error as {
        response?: {
          data?: {
            message?: string;
            errorDetails?: string | { message?: string };
          };
        };
        message?: string;
      };

      const details = apiError.response?.data?.errorDetails;
      const message =
        apiError.response?.data?.message ||
        (typeof details === "string" ? details : details?.message) ||
        apiError.message ||
        "Failed to add gear";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find(
    (category) => category.id === form.categoryId
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/provider"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Add New Gear
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Add sports or outdoor equipment to your rental inventory.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
      >
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Basic Information</h2>
              <p className="text-sm text-gray-500">
                Enter the main details about your gear.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium"
                >
                  Gear Title
                </label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Professional Mountain Bike"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={submitting}
                />
              </div>

              <div>
                <label
                  htmlFor="brand"
                  className="mb-2 block text-sm font-medium"
                >
                  Brand
                </label>
                <input
                  id="brand"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="e.g. Trek"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={submitting}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label
                    htmlFor="categoryId"
                    className="block text-sm font-medium"
                  >
                    Category
                  </label>

                  <button
                    type="button"
                    onClick={() => void loadCategories()}
                    disabled={loadingCategories || submitting}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={13}
                      className={loadingCategories ? "animate-spin" : ""}
                    />
                    Retry
                  </button>
                </div>

                <select
                  id="categoryId"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  disabled={loadingCategories || submitting}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : categories.length > 0
                        ? "Select category"
                        : "No categories available"}
                  </option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {categoryError && !loadingCategories && (
                  <p className="mt-2 text-xs leading-5 text-red-600">
                    {categoryError}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="condition"
                  className="mb-2 block text-sm font-medium"
                >
                  Condition
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select condition</option>
                  <option value="NEW">New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="pricePerDay"
                  className="mb-2 block text-sm font-medium"
                >
                  Price Per Day
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    id="pricePerDay"
                    name="pricePerDay"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.pricePerDay}
                    onChange={handleChange}
                    placeholder="25.00"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-8 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="stock"
                  className="mb-2 block text-sm font-medium"
                >
                  Total Stock
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="1"
                  step="1"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="10"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={submitting}
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the gear, its features, size, usage instructions, and anything customers should know..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={submitting}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Gear Image</h2>
              <p className="text-sm text-gray-500">
                Add a publicly accessible image URL.
              </p>
            </div>

            <label
              htmlFor="image"
              className="mb-2 block text-sm font-medium"
            >
              Image URL
            </label>
            <input
              id="image"
              name="image"
              type="url"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/gear-image.jpg"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              disabled={submitting}
            />

            {form.image && !imageError && (
              <div className="mt-5 overflow-hidden rounded-xl border bg-gray-50">
                <div className="relative aspect-video">
                  <img
                    src={form.image}
                    alt="Gear preview"
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              </div>
            )}

            {imageError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                The image URL could not be loaded. Please check the URL.
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Publish Gear</h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Review your information before adding this gear to your rental
              inventory.
            </p>

            <div className="my-5 border-t" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Title</span>
                <span className="max-w-[180px] truncate font-medium">
                  {form.title || "Not set"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Category</span>
                <span className="max-w-[180px] truncate font-medium">
                  {selectedCategory?.name || "Not set"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Price</span>
                <span className="font-medium">
                  {form.pricePerDay
                    ? `$${form.pricePerDay}/day`
                    : "Not set"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Stock</span>
                <span className="font-medium">{form.stock || "Not set"}</span>
              </div>
            </div>

            <div className="my-5 border-t" />

            <button
              type="submit"
              disabled={
                submitting ||
                loadingCategories ||
                categories.length === 0
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Adding Gear...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Add Gear
                </>
              )}
            </button>

            <Link
              href="/dashboard/provider"
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>

          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex gap-3">
              <ImageIcon
                size={20}
                className="mt-0.5 shrink-0 text-blue-600"
              />
              <div>
                <p className="font-medium text-blue-900">
                  Image recommendation
                </p>
                <p className="mt-1 text-sm leading-6 text-blue-700">
                  Use a direct public image URL ending in .jpg, .jpeg, .png,
                  or .webp.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}