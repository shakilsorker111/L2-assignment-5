"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/provider/AuthProvider";
import api from "@/lib/axios";

interface RentalGear {
  id: string;
  title: string;
  pricePerDay: number;
  availableStock: number;
  isAvailable: boolean;
}

interface RentalCheckoutProps {
  gear: RentalGear;
}

interface RentalResponse {
  success?: boolean;
  message?: string;
  data?: {
    id?: string;
    _id?: string;
    orderId?: string;
    rentalOrderId?: string;
  };
}

export default function RentalCheckout({
  gear,
}: RentalCheckoutProps) {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
    isAuthenticated,
  } = useAuth();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [submitting, setSubmitting] =
    useState(false);

  /*
   * Today's date in YYYY-MM-DD format.
   *
   * This prevents users from selecting dates
   * in the past.
   */
  const today = useMemo(() => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  /*
   * Calculate rental days.
   *
   * Example:
   * June 10 → June 10 = 1 day
   * June 10 → June 11 = 2 days
   *
   * This matches a typical rental-day calculation.
   */
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) {
      return 0;
    }

    const start = new Date(
      `${startDate}T00:00:00`
    );

    const end = new Date(
      `${endDate}T00:00:00`
    );

    const difference =
      end.getTime() - start.getTime();

    if (difference < 0) {
      return 0;
    }

    return (
      Math.floor(
        difference /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
  }, [startDate, endDate]);

  const subtotal = useMemo(() => {
    if (rentalDays <= 0) {
      return 0;
    }

    return (
      rentalDays *
      gear.pricePerDay *
      quantity
    );
  }, [
    rentalDays,
    gear.pricePerDay,
    quantity,
  ]);

  /*
   * Change this if your backend uses
   * another service-fee calculation.
   *
   * Currently:
   * 5% service fee.
   */
  const serviceFee = useMemo(() => {
    return subtotal * 0.05;
  }, [subtotal]);

  const totalPrice =
    subtotal + serviceFee;

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(
        gear.availableStock,
        current + 1
      )
    );
  };

  const validateForm = () => {
    if (!isAuthenticated || !user) {
      return "Please login before renting gear";
    }

    if (!gear.isAvailable) {
      return "This gear is currently unavailable";
    }

    if (gear.availableStock <= 0) {
      return "This gear is out of stock";
    }

    if (!startDate) {
      return "Please select a start date";
    }

    if (!endDate) {
      return "Please select an end date";
    }

    if (startDate < today) {
      return "Start date cannot be in the past";
    }

    if (endDate < today) {
      return "End date cannot be in the past";
    }

    if (endDate < startDate) {
      return "End date cannot be before start date";
    }

    if (quantity < 1) {
      return "Quantity must be at least 1";
    }

    if (
      quantity > gear.availableStock
    ) {
      return `Only ${gear.availableStock} item(s) available`;
    }

    if (rentalDays <= 0) {
      return "Please select valid rental dates";
    }

    return null;
  };

  const handleRentNow = async () => {
    /*
     * IMPORTANT:
     *
     * AuthProvider may still be checking the
     * authentication state when the page first loads.
     *
     * Don't treat that temporary state as logout.
     */
    if (authLoading) {
      toast.info(
        "Checking your login status..."
      );

      return;
    }

    /*
     * Check authentication.
     */
    if (!isAuthenticated || !user) {
      const redirectPath =
        `/gear/${gear.id}`;

      toast.error(
        "Please login before renting gear"
      );

      router.push(
        `/auth/login?redirect=${encodeURIComponent(
          redirectPath
        )}`
      );

      return;
    }

    const validationError =
      validateForm();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSubmitting(true);

      /*
       * Payload expected by the backend
       * RentalOrder model.
       */
      const payload = {
        gearItemId: gear.id,
        quantity,
        startDate,
        endDate,
      };

      console.log(
        "Creating rental order:",
        payload
      );

      const response =
        await api.post<RentalResponse>(
          "/rentals",
          payload
        );

      console.log(
        "Rental response:",
        response.data
      );

      const rentalData =
        response.data?.data;

      /*
       * Your backend may return the ID
       * using one of these names.
       */
      const orderId =
        rentalData?.id ||
        rentalData?.orderId ||
        rentalData?.rentalOrderId ||
        rentalData?._id;

      if (!orderId) {
        console.error(
          "Rental response does not contain order ID:",
          response.data
        );

        toast.error(
          response.data?.message ||
            "Rental created, but order ID was not returned by the server."
        );

        return;
      }

      toast.success(
        "Rental order created successfully!"
      );

      /*
       * Send customer to payment page.
       */
      router.push(
        `/dashboard/customer/orders/${orderId}/pay`
      );
    } catch (error: any) {
      console.error(
        "Rental creation failed:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errorDetails ||
        error?.message ||
        "Failed to create rental order";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Prevent rendering an interactive checkout
   * before authentication initialization.
   */
  if (authLoading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />

          <p className="text-sm text-gray-600">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Rent this gear
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Select your rental dates and quantity.
        </p>
      </div>

      {/* Authentication notice */}
      {!isAuthenticated && (
        <div className="mb-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            Please login before renting
            this gear.
          </p>
        </div>
      )}

      {/* Dates */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Start date */}
        <div>
          <label
            htmlFor="startDate"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Start Date
          </label>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              id="startDate"
              type="date"
              min={today}
              value={startDate}
              onChange={(event) => {
                const value =
                  event.target.value;

                setStartDate(value);

                /*
                 * If the selected end date is
                 * now before the new start date,
                 * clear it.
                 */
                if (
                  endDate &&
                  value > endDate
                ) {
                  setEndDate("");
                }
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-10 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        {/* End date */}
        <div>
          <label
            htmlFor="endDate"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            End Date
          </label>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              id="endDate"
              type="date"
              min={startDate || today}
              value={endDate}
              onChange={(event) =>
                setEndDate(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-10 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Quantity */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Quantity
          </label>

          <span className="text-xs text-gray-500">
            {gear.availableStock} available
          </span>
        </div>

        <div className="flex w-fit items-center overflow-hidden rounded-xl border border-gray-300">
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={
              quantity <= 1 ||
              submitting
            }
            className="flex h-11 w-11 items-center justify-center border-r border-gray-300 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>

          <div className="flex h-11 w-14 items-center justify-center text-sm font-semibold">
            {quantity}
          </div>

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={
              quantity >=
                gear.availableStock ||
              submitting
            }
            className="flex h-11 w-11 items-center justify-center border-l border-gray-300 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Price summary */}
      <div className="mt-6 rounded-xl bg-gray-50 p-5">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">
              Price per day
            </span>

            <span className="font-medium">
              ${gear.pricePerDay.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">
              Rental days
            </span>

            <span className="font-medium">
              {rentalDays || 0}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">
              Quantity
            </span>

            <span className="font-medium">
              {quantity}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">
              Subtotal
            </span>

            <span className="font-medium">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">
              Service fee
            </span>

            <span className="font-medium">
              ${serviceFee.toFixed(2)}
            </span>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">
                Total
              </span>

              <span className="text-2xl font-bold">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rent button */}
      <button
        type="button"
        onClick={handleRentNow}
        disabled={
          submitting ||
          !gear.isAvailable ||
          gear.availableStock <= 0
        }
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />

            Creating rental...
          </>
        ) : !gear.isAvailable ||
          gear.availableStock <= 0 ? (
          "Currently Unavailable"
        ) : (
          "Rent Now"
        )}
      </button>

      {/* Login hint */}
      {!isAuthenticated && (
        <p className="mt-3 text-center text-xs text-gray-500">
          You need to be logged in as a
          customer to rent this gear.
        </p>
      )}
    </section>
  );
}