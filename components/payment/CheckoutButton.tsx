"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createCheckoutSession } from "@/services/payment.service";

interface CheckoutButtonProps {
  rentalId: string;
  amount?: number;
}

export default function CheckoutButton({
  rentalId,
  amount,
}: CheckoutButtonProps) {
  const [loading, setLoading] =
    useState(false);

  const handleCheckout = async () => {
    if (!rentalId) {
      toast.error(
        "Rental information is missing."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await createCheckoutSession({
          rentalId,
        });

      const checkoutUrl =
        response?.data?.url;

      if (!checkoutUrl) {
        throw new Error(
          "Checkout URL was not returned by the server."
        );
      }

      toast.success(
        "Redirecting to secure checkout..."
      );

      window.location.href = checkoutUrl;
    } catch (error: any) {
      console.error(
        "Checkout error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to start payment.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading || !rentalId}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2
            className="animate-spin"
            size={20}
          />

          Redirecting...
        </>
      ) : (
        <>
          <CreditCard size={20} />

          {amount !== undefined
            ? `Pay $${amount.toFixed(2)}`
            : "Pay Now"}
        </>
      )}
    </button>
  );
}