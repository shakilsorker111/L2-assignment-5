"use client";

import Link from "next/link";

import {
  Edit,
  Trash2,
  Plus,
} from "lucide-react";

import type { Gear } from "@/types/gear";

interface Props {
  gears: Gear[];
  onDelete: (
    gear: Gear
  ) => void;
}

export default function ProviderGearTable({
  gears,
  onDelete,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-5">
        <div>
          <h2 className="text-lg font-semibold">
            My Gear
          </h2>

          <p className="text-sm text-gray-500">
            Manage your listed equipment
          </p>
        </div>

        <Link
          href="/dashboard/provider/gear/add"
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <Plus size={17} />

          <span className="hidden sm:inline">
            Add Gear
          </span>
        </Link>
      </div>

      {gears.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Plus size={24} />
          </div>

          <h3 className="font-semibold">
            No gear listed yet
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Add your first gear to start receiving rental orders.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-medium">
                    Gear
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Category
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Price
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Stock
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {gears.map((gear) => (
                  <tr key={gear.id}>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold">
                          {gear.title}
                        </p>

                        <p className="text-xs text-gray-500">
                          {gear.brand}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {gear.category?.name ??
                        "—"}
                    </td>

                    <td className="px-5 py-4 font-medium">
                      ${gear.pricePerDay.toFixed(2)}
                      <span className="text-gray-400">
                        /day
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {gear.availableStock}/
                      {gear.stock}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`
                          rounded-full px-3 py-1 text-xs font-medium
                          ${
                            gear.isAvailable
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }
                        `}
                      >
                        {gear.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/provider/gear/${gear.id}/edit`}
                          className="rounded-lg p-2 hover:bg-gray-100"
                          title="Edit"
                        >
                          <Edit
                            size={17}
                          />
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            onDelete(gear)
                          }
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="divide-y md:hidden">
            {gears.map((gear) => (
              <div
                key={gear.id}
                className="p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">
                      {gear.title}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {gear.brand}
                    </p>
                  </div>

                  <span
                    className={`
                      shrink-0 rounded-full px-2.5 py-1 text-xs
                      ${
                        gear.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    `}
                  >
                    {gear.isAvailable
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">
                      Price
                    </p>

                    <p className="font-semibold">
                      $
                      {gear.pricePerDay.toFixed(
                        2
                      )}
                      /day
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">
                      Stock
                    </p>

                    <p className="font-semibold">
                      {
                        gear.availableStock
                      }
                      /
                      {gear.stock}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/dashboard/provider/gear/${gear.id}/edit`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
                  >
                    <Edit size={15} />
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      onDelete(gear)
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}