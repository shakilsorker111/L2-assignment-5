"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  Search,
  SlidersHorizontal,
  Package,
  ArrowRight,
} from "lucide-react";

import {
  getGears,
} from "@/services/gear.service";

import {
  getCategories,
} from "@/services/category.service";

import type {
  Gear,
} from "@/types/gear";

import GearSkeleton from "@/components/gear/GearSkeleton";

interface Category {
  id: string;
  name: string;
}

export default function GearPage() {
  const [gears, setGears] =
    useState<Gear[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [categoryLoading, setCategoryLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setCategoryLoading(true);
      setError("");

      const [
        gearResponse,
        categoryResponse,
      ] = await Promise.all([
        getGears(),
        getCategories(),
      ]);

      /*
       * getGears() returns:
       *
       * {
       *   success: boolean;
       *   message: string;
       *   data: Gear[];
       * }
       */
      setGears(
        Array.isArray(
          gearResponse.data
        )
          ? gearResponse.data
          : []
      );

      /*
       * getCategories() returns Category[]
       */
      setCategories(
        Array.isArray(
          categoryResponse
        )
          ? categoryResponse
          : []
      );
    } catch (err: any) {
      console.error(
        "Failed to load gear:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load gear."
      );
    } finally {
      setLoading(false);
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredGears = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return gears.filter((gear) => {
      const matchesSearch =
        !query ||
        gear.title
          ?.toLowerCase()
          .includes(query) ||
        gear.brand
          ?.toLowerCase()
          .includes(query) ||
        gear.description
          ?.toLowerCase()
          .includes(query);

      /*
       * category can come from the backend
       * as a populated object.
       *
       * Otherwise use categoryId.
       */
      const gearCategoryId =
        gear.category?.id ??
        gear.categoryId;

      const matchesCategory =
        !categoryId ||
        gearCategoryId === categoryId;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    gears,
    search,
    categoryId,
  ]);

  const getImage = (
    gear: Gear
  ) => {
    return (
      gear.image ||
      "/placeholder-gear.jpg"
    );
  };

  const getCategoryName = (
    gear: Gear
  ) => {
    /*
     * If category information is
     * already populated by backend.
     */
    if (
      gear.category?.name
    ) {
      return gear.category.name;
    }

    /*
     * Otherwise find category from
     * category list.
     */
    const category =
      categories.find(
        (item) =>
          item.id ===
          gear.categoryId
      );

    return (
      category?.name ||
      "Uncategorized"
    );
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-200" />

            <div className="mt-3 h-5 w-80 max-w-full animate-pulse rounded bg-gray-200" />
          </div>

          <GearSkeleton />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* =========================
          HERO
      ========================== */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
              <Package className="h-4 w-4" />

              GearUp Rental Marketplace
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Browse Rental Gear
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
              Find sports and outdoor
              equipment available for rent
              from GearUp providers.
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          MAIN
      ========================== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* =========================
            FILTERS
        ========================== */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_240px]">

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search gear, brand or description..."
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100"
              />
            </div>

            {/* Category */}
            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <select
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(
                    event.target.value
                  )
                }
                disabled={
                  categoryLoading
                }
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100 disabled:bg-gray-50"
              >
                <option value="">
                  {categoryLoading
                    ? "Loading categories..."
                    : "All Categories"}
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
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>

        {/* =========================
            ERROR
        ========================== */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-900">
              Unable to load gear
            </h2>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={loadData}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* =========================
            RESULTS HEADER
        ========================== */}
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Available Gear
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredGears.length}{" "}
              {filteredGears.length ===
              1
                ? "item"
                : "items"}{" "}
              found
            </p>
          </div>

          {(search ||
            categoryId) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategoryId("");
              }}
              className="text-left text-sm font-medium text-gray-600 hover:text-black sm:text-right"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* =========================
            EMPTY STATE
        ========================== */}
        {!error &&
          filteredGears.length ===
            0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-300" />

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No gear found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Try changing your search
                or category filter.
              </p>

              {(search ||
                categoryId) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategoryId("");
                  }}
                  className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

        {/* =========================
            GEAR GRID
        ========================== */}
        {!error &&
          filteredGears.length >
            0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredGears.map(
                (gear) => (
                  <Link
                    key={gear.id}
                    href={`/gear/${gear.id}`}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <img
                        src={getImage(
                          gear
                        )}
                        alt={
                          gear.title ||
                          "Gear"
                        }
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(
                          event
                        ) => {
                          event.currentTarget.src =
                            "/placeholder-gear.jpg";
                        }}
                      />

                      {/* Category badge */}
                      <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
                        {getCategoryName(
                          gear
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="line-clamp-1 text-lg font-semibold text-gray-900">
                        {gear.title}
                      </h3>

                      {gear.brand && (
                        <p className="mt-1 text-sm text-gray-500">
                          {gear.brand}
                        </p>
                      )}

                      {gear.description && (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
                          {
                            gear.description
                          }
                        </p>
                      )}

                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div>
                          <span className="text-xl font-bold text-gray-900">
                            $
                            {
                              gear.pricePerDay
                            }
                          </span>

                          <span className="text-sm text-gray-500">
                            {" "}
                            / day
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                          View

                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
      </section>
    </main>
  );
}

