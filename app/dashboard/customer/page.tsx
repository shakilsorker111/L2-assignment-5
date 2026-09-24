"use client";

import { useAuth } from "@/components/provider/AuthProvider";
import {
  CalendarDays,
  CreditCard,
  Package,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";



export default function CustomerDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: "Total Rentals",
      value: "0",
      icon: ShoppingCart,
    },
    {
      title: "Active Rentals",
      value: "0",
      icon: Package,
    },
    {
      title: "Upcoming",
      value: "0",
      icon: CalendarDays,
    },
    {
      title: "Total Payments",
      value: "$0",
      icon: CreditCard,
    },
  ];

  return (
    <div>
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Welcome back, {user?.name} 👋
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your rentals and track your
          orders from here.
        </p>
      </div>

      {/* Stats */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {stat.value}
                  </p>
                </div>

                <div className="rounded-lg bg-orange-50 p-3 text-orange-500">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty orders */}

      <div className="mt-8 rounded-xl border bg-white p-8 text-center">
        <Package
          size={40}
          className="mx-auto text-gray-300"
        />

        <h2 className="mt-4 text-lg font-semibold">
          No rentals yet
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Browse our available gear and start
          your first rental.
        </p>

        <Link
          href="/gear"
          className="mt-5 inline-block rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Browse Gear
        </Link>
      </div>
    </div>
  );
}