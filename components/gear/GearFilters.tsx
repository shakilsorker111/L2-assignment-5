"use client";

import { RotateCcw, Search } from "lucide-react";

import type {
  GearCategory,
  GearFilters as GearFilterType,
} from "@/types/gear";

interface GearFiltersProps {
  filters: GearFilterType;
  categories: GearCategory[];
  onChange: (
    filters: GearFilterType
  ) => void;
  onReset: () => void;
}

export default function GearFilters({
  filters,
  categories,
  onChange,
  onReset,
}: GearFiltersProps) {
  return (
    <aside className="rounded-2xl border bg-white p-5">

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold">
          Filters
        </h2>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {/* Search */}

      <div className="mb-6">
        <label
          htmlFor="gear-search"
          className="mb-2 block text-sm font-medium"
        >
          Search
        </label>

        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            id="gear-search"
            value={filters.search ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                search: event.target.value,
                page: 1,
              })
            }
            placeholder="Search gear..."
            className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>
      </div>

      {/* Category */}

      <div className="mb-6">
        <label
          htmlFor="category"
          className="mb-2 block text-sm font-medium"
        >
          Category
        </label>

        <select
          id="category"
          value={filters.category ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              category:
                event.target.value || undefined,
              page: 1,
            })
          }
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-orange-500"
        >
          <option value="">
            All Categories
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.slug}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Brand */}

      <div className="mb-6">
        <label
          htmlFor="brand"
          className="mb-2 block text-sm font-medium"
        >
          Brand
        </label>

        <input
          id="brand"
          value={filters.brand ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              brand:
                event.target.value || undefined,
              page: 1,
            })
          }
          placeholder="e.g. Nike"
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-orange-500"
        />
      </div>

      {/* Price */}

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">
          Price per day
        </label>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            value={filters.minPrice ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                minPrice:
                  event.target.value === ""
                    ? undefined
                    : Number(event.target.value),
                page: 1,
              })
            }
            placeholder="Min"
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-orange-500"
          />

          <input
            type="number"
            min="0"
            value={filters.maxPrice ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                maxPrice:
                  event.target.value === ""
                    ? undefined
                    : Number(event.target.value),
                page: 1,
              })
            }
            placeholder="Max"
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Availability */}

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={filters.available === true}
          onChange={(event) =>
            onChange({
              ...filters,
              available: event.target.checked
                ? true
                : undefined,
              page: 1,
            })
          }
          className="h-4 w-4 accent-orange-500"
        />

        <span className="text-sm">
          Available only
        </span>
      </label>
    </aside>
  );
}