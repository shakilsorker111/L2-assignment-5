"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Loader2,
  Package,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

import { getMyRentals } from "@/services/rental.service";
import CheckoutButton from "@/components/payment/CheckoutButton";

interface RentalOrder {
  id: string;

  quantity: number;

  startDate: string;
  endDate: string;

  totalAmount: number;

  status: string;

  paymentStatus?: string;

  gear?: {
    id: string;
    title: string;
    image?: string;
    pricePerDay?: number;
  };
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: RentalOrder[];
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PaymentPage({
  params,
}: PageProps) {
  const [rentalId, setRentalId] =
    useState<string>("");

  const [rental, setRental] =
    useState<RentalOrder | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string>("");

  useEffect(() => {
    const loadRental = async () => {
      try {
        setLoading(true);
        setError("");

        const { id } = await params;

        setRentalId(id);

        const response =
          (await getMyRentals()) as ApiResponse;

        const rentals =
          response?.data || [];

        const foundRental =
          rentals.find(
            (item) => item.id === id
          );

        if (!foundRental) {
          setError(
            "Rental order was not found."
          );
          return;
        }

        setRental(foundRental);
      } catch (error: any) {
        console.error(
          "Failed to load rental:",
          error
        );

        const message =
          error?.response?.data?.message ||
          "Failed to load rental order.";

        setError(message);

        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadRental();
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2
              className="animate-spin"
              size={24}
            />

            Loading rental...
          </div>
        </div>
      </main>
    );
  }

  if (error || !rental) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Package
                className="text-red-600"
                size={32}
              />
            </div>

            <h1 className="text-2xl font-bold">
              Rental Not Found
            </h1>

            <p className="mt-3 text-gray-600">
              {error ||
                "We could not find this rental order."}
            </p>

            <Link
              href="/dashboard/customer/orders"
              className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const alreadyPaid =
    rental.paymentStatus?.toUpperCase() ===
      "PAID" ||
    rental.status?.toUpperCase() ===
      "PAID";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Back */}
        <Link
          href="/dashboard/customer/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
        >
          <ArrowLeft size={18} />
          Back to Orders
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            <CreditCard size={16} />
            Rental Payment
          </div>

          <h1 className="text-3xl font-bold md:text-4xl">
            Complete Your Payment
          </h1>

          <p className="mt-2 text-gray-600">
            Review your rental details before
            proceeding to secure checkout.
          </p>
        </div>

        {/* Rental card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {/* Gear */}
          <div className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-4">
              {rental.gear?.image ? (
                <img
                  src={rental.gear.image}
                  alt={
                    rental.gear.title ||
                    "Gear"
                  }
                  className="h-20 w-20 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100">
                  <Package
                    size={30}
                    className="text-gray-400"
                  />
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold">
                  {rental.gear?.title ||
                    "Rental Gear"}
                </h2>

                {rental.gear
                  ?.pricePerDay !==
                  undefined && (
                  <p className="mt-1 text-sm text-gray-500">
                    $
                    {rental.gear.pricePerDay.toFixed(
                      2
                    )}{" "}
                    / day
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid gap-4 border-b border-gray-100 p-6 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CalendarDays size={17} />
                Start Date
              </div>

              <p className="mt-2 font-semibold">
                {new Date(
                  rental.startDate
                ).toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CalendarDays size={17} />
                End Date
              </div>

              <p className="mt-2 font-semibold">
                {new Date(
                  rental.endDate
                ).toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ShoppingCart size={17} />
                Quantity
              </div>

              <p className="mt-2 font-semibold">
                {rental.quantity}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="text-sm text-gray-500">
                Rental Status
              </div>

              <p className="mt-2 font-semibold">
                {rental.status}
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg text-gray-600">
                Total Amount
              </span>

              <span className="text-3xl font-bold">
                $
                {Number(
                  rental.totalAmount
                ).toFixed(2)}
              </span>
            </div>

            {alreadyPaid ? (
              <div className="rounded-xl bg-green-50 p-4 text-center font-semibold text-green-700">
                This rental has already been
                paid.
              </div>
            ) : (
              <CheckoutButton
                rentalId={rentalId}
                amount={Number(
                  rental.totalAmount
                )}
              />
            )}

            <p className="mt-4 text-center text-xs leading-5 text-gray-500">
              You will be redirected to the
              secure payment page to complete
              your transaction.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}