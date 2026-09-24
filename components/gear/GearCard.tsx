import Image from "next/image";
import Link from "next/link";

import {
  CalendarDays,
  MapPin,
  Star,
} from "lucide-react";

import type { GearItem } from "@/types/gear";

interface GearCardProps {
  gear: GearItem;
}

export default function GearCard({
  gear,
}: GearCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      {/* Image */}

      <Link href={`/gear/${gear.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">

          {gear.image ? (
            <Image
              src={gear.image}
              alt={gear.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No image
            </div>
          )}

          {/* Availability */}

          <div className="absolute left-3 top-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                gear.isAvailable &&
                gear.availableStock > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {gear.isAvailable &&
              gear.availableStock > 0
                ? "Available"
                : "Unavailable"}
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}

      <div className="p-5">

        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-600">
            {gear.category?.name ??
              "Uncategorized"}
          </span>

          <span className="text-xs text-gray-500">
            {gear.brand}
          </span>
        </div>

        <Link href={`/gear/${gear.id}`}>
          <h2 className="line-clamp-1 text-lg font-bold transition group-hover:text-orange-500">
            {gear.title}
          </h2>
        </Link>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
          {gear.description}
        </p>

        {/* Provider */}

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <MapPin size={15} />

          <span className="truncate">
            Provided by {gear.provider?.name}
          </span>
        </div>

        {/* Rating placeholder */}

        <div className="mt-3 flex items-center gap-1 text-sm text-gray-500">
          <Star
            size={15}
            className="fill-yellow-400 text-yellow-400"
          />

          <span>New</span>
        </div>

        {/* Bottom */}

        <div className="mt-5 flex items-center justify-between border-t pt-4">

          <div>
            <span className="text-xl font-bold text-gray-900">
              ${gear.pricePerDay}
            </span>

            <span className="ml-1 text-sm text-gray-500">
              / day
            </span>
          </div>

          <Link
            href={`/gear/${gear.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            <CalendarDays size={16} />
            View
          </Link>
        </div>
      </div>
    </article>
  );
}