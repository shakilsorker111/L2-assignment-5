"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingCart,
  User,
} from "lucide-react";

import RentalDatePicker from "./RentalDatePicker";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

interface Gear {
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

interface GearResponse {
  success: boolean;
  message: string;
  data: Gear;
}

interface GearDetailsProps {
  gearId: string;
}

function calculateDays(
  startDate: Date | undefined,
  endDate: Date | undefined
) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const difference =
    end.getTime() - start.getTime();

  const days =
    Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    ) + 1;

  return Math.max(days, 1);
}

export default function GearDetails({
  gearId,
}: GearDetailsProps) {
  const [gear, setGear] = useState<Gear | null>(
    null
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [startDate, setStartDate] =
    useState<Date>();

  const [endDate, setEndDate] =
    useState<Date>();

  const [quantity, setQuantity] = useState(1);

  const [rentError, setRentError] = useState("");

  const [renting, setRenting] = useState(false);

  /*
   * Fetch gear details
   */
  useEffect(() => {
    const fetchGear = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/gear/${gearId}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch gear details"
          );
        }

        const result: GearResponse =
          await response.json();

        if (!result.success) {
          throw new Error(
            result.message ||
              "Failed to fetch gear"
          );
        }

        setGear(result.data);
      } catch (error) {
        console.error(
          "Gear details error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGear();
  }, [gearId]);

  /*
   * Calculate rental days
   */
  const rentalDays = useMemo(() => {
    return calculateDays(
      startDate,
      endDate
    );
  }, [startDate, endDate]);

  /*
   * Calculate subtotal
   */
  const subtotal = useMemo(() => {
    if (!gear || rentalDays === 0) {
      return 0;
    }

    return (
      gear.pricePerDay *
      rentalDays *
      quantity
    );
  }, [
    gear,
    rentalDays,
    quantity,
  ]);

  /*
   * Service fee
   *
   * Currently 5%.
   *
   * Later you can change this according
   * to your backend business rules.
   */
  const serviceFee = useMemo(() => {
    return subtotal * 0.05;
  }, [subtotal]);

  /*
   * Final total
   */
  const total = useMemo(() => {
    return subtotal + serviceFee;
  }, [subtotal, serviceFee]);

  /*
   * Decrease quantity
   */
  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  /*
   * Increase quantity
   */
  const increaseQuantity = () => {
    if (!gear) {
      return;
    }

    setQuantity((current) =>
      Math.min(
        gear.availableStock,
        current + 1
      )
    );
  };

  /*
   * Rent Now
   */
  const handleRentNow = async () => {
    setRentError("");

    if (!startDate || !endDate) {
      setRentError(
        "Please select both start and end dates."
      );

      return;
    }

    if (endDate < startDate) {
      setRentError(
        "End date cannot be before start date."
      );

      return;
    }

    if (!gear) {
      setRentError(
        "Gear information is unavailable."
      );

      return;
    }

    if (!gear.isAvailable) {
      setRentError(
        "This gear is currently unavailable."
      );

      return;
    }

    if (gear.availableStock <= 0) {
      setRentError(
        "This gear is currently out of stock."
      );

      return;
    }

    if (quantity > gear.availableStock) {
      setRentError(
        "Selected quantity is not available."
      );

      return;
    }

    try {
      setRenting(true);

      /*
       * Temporary checkout data.
       *
       * The next rental step will replace this
       * with POST /api/rentals.
       */
      const rentalData = {
        gearItemId: gear.id,
        gearTitle: gear.title,
        quantity,
        startDate:
          startDate.toISOString(),
        endDate:
          endDate.toISOString(),
        days: rentalDays,
        pricePerDay:
          gear.pricePerDay,
        subtotal,
        serviceFee,
        totalPrice: total,
      };

      sessionStorage.setItem(
        "gearup_rental",
        JSON.stringify(rentalData)
      );

      /*
       * Temporary redirect.
       *
       * We will build this checkout page
       * in the rental/payment step.
       */
      window.location.href =
        `/dashboard/customer/checkout?gearId=${gear.id}`;
    } catch (error) {
      console.error(
        "Rental error:",
        error
      );

      setRentError(
        "Unable to continue with rental."
      );
    } finally {
      setRenting(false);
    }
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-3xl bg-gray-200" />

            <div className="space-y-5">
              <div className="h-10 animate-pulse rounded bg-gray-200" />

              <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />

              <div className="h-32 animate-pulse rounded bg-gray-200" />

              <div className="h-80 animate-pulse rounded-3xl bg-gray-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Error state
   */
  if (error || !gear) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Gear Not Found
          </h1>

          <p className="mt-3 text-gray-600">
            {error ||
              "The requested gear could not be found."}
          </p>

          <Link
            href="/gear"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Gear
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/gear"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Gear
        </Link>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* ===================================== */}
          {/* LEFT SIDE */}
          {/* ===================================== */}

          <div>
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-100">
              <Image
                src={gear.image}
                alt={gear.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Availability badge */}
              <div className="absolute left-5 top-5">
                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
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

            {/* Quick information */}
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {/* Brand */}
              <div className="rounded-2xl border bg-white p-4">
                <p className="text-xs text-gray-500">
                  Brand
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {gear.brand}
                </p>
              </div>

              {/* Condition */}
              <div className="rounded-2xl border bg-white p-4">
                <p className="text-xs text-gray-500">
                  Condition
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {gear.condition}
                </p>
              </div>

              {/* Stock */}
              <div className="rounded-2xl border bg-white p-4">
                <p className="text-xs text-gray-500">
                  Available
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {gear.availableStock} item(s)
                </p>
              </div>
            </div>
          </div>

          {/* ===================================== */}
          {/* RIGHT SIDE */}
          {/* ===================================== */}

          <div>
            {/* Category */}
            {gear.category && (
              <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                {gear.category.name}
              </span>
            )}

            {/* Title */}
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {gear.title}
            </h1>

            {/* Brand */}
            <p className="mt-2 text-lg text-gray-500">
              {gear.brand}
            </p>

            {/* Price */}
            <div className="mt-6">
              <span className="text-4xl font-bold text-gray-900">
                ৳{gear.pricePerDay.toFixed(2)}
              </span>

              <span className="ml-2 text-gray-500">
                / day
              </span>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900">
                About This Gear
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                {gear.description}
              </p>
            </div>

            {/* Provider */}
            {gear.provider && (
              <div className="mt-8 rounded-2xl border bg-white p-5">
                <div className="flex items-center gap-4">
                  {gear.provider.avatar ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded-full">
                      <Image
                        src={gear.provider.avatar}
                        alt={gear.provider.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-500">
                      Provided By
                    </p>

                    <p className="font-semibold text-gray-900">
                      {gear.provider.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {gear.provider.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ================================= */}
            {/* RENTAL SECTION */}
            {/* ================================= */}

            <div className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />

                  <h2 className="text-xl font-bold text-gray-900">
                    Rent This Gear
                  </h2>
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  Choose your rental dates and quantity.
                </p>
              </div>

              {/* Unavailable */}
              {!gear.isAvailable ||
              gear.availableStock <= 0 ? (
                <div className="rounded-2xl bg-red-50 p-5 text-center">
                  <p className="font-semibold text-red-700">
                    This gear is currently unavailable.
                  </p>
                </div>
              ) : (
                <>
                  {/* Date picker */}
                  <RentalDatePicker
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={
                      setStartDate
                    }
                    onEndDateChange={
                      setEndDate
                    }
                  />

                  {/* Quantity */}
                  <div className="mt-6">
                    <label className="text-sm font-semibold text-gray-900">
                      Quantity
                    </label>

                    <div className="mt-2 flex w-fit items-center overflow-hidden rounded-xl border bg-white">
                      <button
                        type="button"
                        onClick={
                          decreaseQuantity
                        }
                        disabled={quantity <= 1}
                        className="p-3 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="min-w-12 text-center font-semibold">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={
                          increaseQuantity
                        }
                        disabled={
                          quantity >=
                          gear.availableStock
                        }
                        className="p-3 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      {gear.availableStock} item(s)
                      available
                    </p>
                  </div>

                  {/* Rental summary */}
                  <div className="mt-6 rounded-2xl bg-gray-50 p-5">
                    <h3 className="font-bold text-gray-900">
                      Rental Summary
                    </h3>

                    <div className="mt-4 space-y-3 text-sm">
                      {/* Price */}
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Price per day
                        </span>

                        <span className="font-medium">
                          ৳
                          {gear.pricePerDay.toFixed(
                            2
                          )}
                        </span>
                      </div>

                      {/* Days */}
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Rental days
                        </span>

                        <span className="font-medium">
                          {rentalDays || "-"}
                        </span>
                      </div>

                      {/* Quantity */}
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Quantity
                        </span>

                        <span className="font-medium">
                          {quantity}
                        </span>
                      </div>

                      {/* Subtotal */}
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Subtotal
                        </span>

                        <span className="font-medium">
                          ৳
                          {subtotal.toFixed(2)}
                        </span>
                      </div>

                      {/* Service fee */}
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Service fee
                        </span>

                        <span className="font-medium">
                          ৳
                          {serviceFee.toFixed(2)}
                        </span>
                      </div>

                      {/* Total */}
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-bold text-gray-900">
                          <span>Total</span>

                          <span>
                            ৳{total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error */}
                  {rentError && (
                    <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
                      {rentError}
                    </div>
                  )}

                  {/* Rent Now */}
                  <button
                    type="button"
                    onClick={handleRentNow}
                    disabled={renting}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingCart className="h-5 w-5" />

                    {renting
                      ? "Processing..."
                      : "Rent Now"}
                  </button>

                  {/* Security message */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />

                    Secure rental process
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}