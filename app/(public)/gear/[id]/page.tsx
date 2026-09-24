import Image from "next/image";
import Link from "next/link";

import RentalCheckout from "@/components/gear/RentalCheckout";

interface GearDetails {
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

  category?: {
    id: string;
    name: string;
    slug: string;
  };

  provider?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: GearDetails;
}

async function getGear(
  id: string
): Promise<GearDetails> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL;

  const response = await fetch(
    `${baseUrl}/gear/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch gear");
  }

  const result: ApiResponse =
    await response.json();

  return result.data;
}

export default async function GearDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const gear = await getGear(id);

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="mx-auto max-w-7xl px-4 py-10">

        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-gray-500">
          <Link
            href="/"
            className="hover:text-black"
          >
            Home
          </Link>

          <span className="mx-2">
            /
          </span>

          <Link
            href="/gear"
            className="hover:text-black"
          >
            Gear
          </Link>

          <span className="mx-2">
            /
          </span>

          <span className="text-gray-900">
            {gear.title}
          </span>
        </div>

        {/* Main */}
        <div className="grid gap-10 lg:grid-cols-2">

          {/* Image */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

            <div className="relative aspect-square">

              <Image
                src={gear.image}
                alt={gear.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

            </div>

          </div>

          {/* Information */}
          <div className="space-y-6">

            <div>

              <div className="mb-3 flex flex-wrap gap-2">

                {gear.category && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                    {gear.category.name}
                  </span>
                )}

                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    gear.isAvailable
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {gear.isAvailable
                    ? "Available"
                    : "Unavailable"}
                </span>

              </div>

              <h1 className="text-3xl font-bold md:text-4xl">
                {gear.title}
              </h1>

              <p className="mt-2 text-gray-500">
                Brand: {gear.brand}
              </p>

            </div>

            {/* Price */}
            <div>
              <span className="text-3xl font-bold">
                ${gear.pricePerDay.toFixed(2)}
              </span>

              <span className="ml-2 text-gray-500">
                / day
              </span>
            </div>

            {/* Description */}
            <div>

              <h2 className="mb-2 text-xl font-semibold">
                Description
              </h2>

              <p className="leading-7 text-gray-600">
                {gear.description}
              </p>

            </div>

            {/* Specifications */}
            <div>

              <h2 className="mb-3 text-xl font-semibold">
                Specifications
              </h2>

              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-gray-500">
                    Condition
                  </p>

                  <p className="font-semibold">
                    {gear.condition}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-gray-500">
                    Available
                  </p>

                  <p className="font-semibold">
                    {gear.availableStock}
                  </p>
                </div>

              </div>

            </div>

            {/* Provider */}
            {gear.provider && (
              <div className="rounded-xl bg-white p-5">

                <h2 className="mb-3 text-lg font-semibold">
                  Provided by
                </h2>

                <p className="font-medium">
                  {gear.provider.name}
                </p>

                <p className="text-sm text-gray-500">
                  {gear.provider.email}
                </p>

              </div>
            )}

          </div>

        </div>

        {/* Rental checkout */}
        <div className="mt-12">

          <div className="mx-auto max-w-2xl">

            <RentalCheckout
              gear={{
                id: gear.id,
                title: gear.title,
                pricePerDay: gear.pricePerDay,
                availableStock:
                  gear.availableStock,
                isAvailable:
                  gear.isAvailable,
              }}
            />

          </div>

        </div>

      </div>

    </main>
  );
}