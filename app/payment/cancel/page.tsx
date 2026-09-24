"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <XCircle
              className="text-red-600"
              size={44}
            />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Payment Cancelled
          </h1>

          <p className="mt-4 leading-7 text-gray-600">
            Your payment was cancelled. Your
            rental order has not been completed.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard/customer/orders"
              className="rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              View My Orders
            </Link>

            <Link
              href="/gear"
              className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Back to Gear
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}