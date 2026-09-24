"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Save,
} from "lucide-react";

import Link from "next/link";

import {
  getCategories,
} from "@/services/category.service";

import {
  createGear,
} from "@/services/gear.service";

import type {
  Category,
} from "@/types/category";

import { toast } from "sonner";

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

export default function AddGearForm() {
  const router = useRouter();

  const [
    form,
    setForm,
  ] = useState<FormState>(
    initialForm
  );

  const [
    categories,
    setCategories,
  ] = useState<Category[]>(
    []
  );

  const [
    loadingCategories,
    setLoadingCategories,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    imageError,
    setImageError,
  ] = useState(false);

  useEffect(() => {
    const loadCategories =
      async () => {
        try {
          setLoadingCategories(true);

          const response =
            await getCategories();

          setCategories(
            response.data ?? []
          );
        } catch (error) {
          console.error(
            error
          );

          toast.error(
            "Failed to load categories"
          );
        } finally {
          setLoadingCategories(
            false
          );
        }
      };

    loadCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "image") {
      setImageError(false);
    }
  };

  const validate = () => {
    if (
      !form.title.trim()
    ) {
      toast.error(
        "Gear title is required"
      );
      return false;
    }

    if (
      !form.brand.trim()
    ) {
      toast.error(
        "Brand is required"
      );
      return false;
    }

    if (
      !form.description.trim()
    ) {
      toast.error(
        "Description is required"
      );
      return false;
    }

    if (
      !form.condition
    ) {
      toast.error(
        "Please select gear condition"
      );
      return false;
    }

    const price =
      Number(
        form.pricePerDay
      );

    if (
      !Number.isFinite(
        price
      ) ||
      price <= 0
    ) {
      toast.error(
        "Price must be greater than 0"
      );
      return false;
    }

    const stock =
      Number(form.stock);

    if (
      !Number.isInteger(
        stock
      ) ||
      stock <= 0
    ) {
      toast.error(
        "Stock must be a positive whole number"
      );
      return false;
    }

    if (
      !form.categoryId
    ) {
      toast.error(
        "Please select a category"
      );
      return false;
    }

    if (
      !form.image.trim()
    ) {
      toast.error(
        "Image URL is required"
      );
      return false;
    }

    try {
      new URL(form.image);
    } catch {
      toast.error(
        "Please enter a valid image URL"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);

      await createGear({
        title: form.title.trim(),
        brand: form.brand.trim(),
        description:
          form.description.trim(),
        condition: form.condition,
        pricePerDay:
          Number(
            form.pricePerDay
          ),
        stock: Number(
          form.stock
        ),
        image: form.image.trim(),
        categoryId:
          form.categoryId,
      });

      toast.success(
        "Gear added successfully"
      );

      setForm(initialForm);

      router.push(
        "/dashboard/provider"
      );

      router.refresh();
    } catch (error: any) {
      console.error(
        "Create gear error:",
        error
      );

      const message =
        error?.response?.data
          ?.message ??
        error?.response?.data
          ?.errorDetails ??
        "Failed to add gear";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <Link
          href="/dashboard/provider"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft
            size={16}
          />
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
        className="grid gap-6 lg:grid-cols-[1fr_360px]"
      >
        {/* Main form */}
        <div className="space-y-6">
          {/* Basic information */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Basic Information
              </h2>

              <p className="text-sm text-gray-500">
                Enter the main details about your gear.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Title */}
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
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Professional Mountain Bike"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={
                    submitting
                  }
                />
              </div>

              {/* Brand */}
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
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Trek"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={
                    submitting
                  }
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="categoryId"
                  className="mb-2 block text-sm font-medium"
                >
                  Category
                </label>

                <select
                  id="categoryId"
                  name="categoryId"
                  value={
                    form.categoryId
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    submitting ||
                    loadingCategories
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "Select category"}
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Condition */}
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
                  value={
                    form.condition
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    submitting
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select condition
                  </option>

                  <option value="NEW">
                    New
                  </option>

                  <option value="LIKE_NEW">
                    Like New
                  </option>

                  <option value="GOOD">
                    Good
                  </option>

                  <option value="FAIR">
                    Fair
                  </option>
                </select>
              </div>

              {/* Price */}
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
                    min="0"
                    step="0.01"
                    value={
                      form.pricePerDay
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="25.00"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-8 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    disabled={
                      submitting
                    }
                  />
                </div>
              </div>

              {/* Stock */}
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
                  value={
                    form.stock
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="10"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={
                    submitting
                  }
                />
              </div>

              {/* Description */}
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
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Describe the gear, its features, size, usage instructions, and anything customers should know..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={
                    submitting
                  }
                />
              </div>
            </div>
          </section>

          {/* Image */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Gear Image
              </h2>

              <p className="text-sm text-gray-500">
                Add a publicly accessible image URL.
              </p>
            </div>

            <div>
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
                onChange={
                  handleChange
                }
                placeholder="https://example.com/gear-image.jpg"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={
                  submitting
                }
              />
            </div>

            {/* Preview */}
            {form.image &&
              !imageError && (
                <div className="mt-5 overflow-hidden rounded-xl border bg-gray-50">
                  <div className="relative aspect-video">
                    <img
                      src={form.image}
                      alt="Gear preview"
                      className="h-full w-full object-cover"
                      onError={() =>
                        setImageError(
                          true
                        )
                      }
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

        {/* Right panel */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">
              Publish Gear
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Review your information before adding this gear to your rental inventory.
            </p>

            <div className="my-5 border-t" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Title
                </span>

                <span className="max-w-[180px] truncate font-medium">
                  {form.title ||
                    "Not set"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Category
                </span>

                <span className="font-medium">
                  {categories.find(
                    (item) =>
                      item.id ===
                      form.categoryId
                  )?.name ??
                    "Not set"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Price
                </span>

                <span className="font-medium">
                  {form.pricePerDay
                    ? `$${form.pricePerDay}/day`
                    : "Not set"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Stock
                </span>

                <span className="font-medium">
                  {form.stock ||
                    "Not set"}
                </span>
              </div>
            </div>

            <div className="my-5 border-t" />

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Adding Gear...
                </>
              ) : (
                <>
                  <Save
                    size={18}
                  />

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
                  Use a direct public image URL ending in .jpg, .jpeg, .png, or .webp.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}