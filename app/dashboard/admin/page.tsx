"use client";

import { useAuth } from "@/components/provider/AuthProvider";
import {
  Users,
  Package,
  ShoppingCart,
  Activity,
} from "lucide-react";


export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: "Total Users",
      value: "0",
      icon: Users,
    },
    {
      title: "Active Gear",
      value: "0",
      icon: Package,
    },
    {
      title: "Total Rentals",
      value: "0",
      icon: ShoppingCart,
    },
    {
      title: "Platform Status",
      value: "Healthy",
      icon: Activity,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome, {user?.name}. Monitor and manage
          the GearUp platform.
        </p>
      </div>

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

      <div className="mt-8 rounded-xl border bg-white p-8">
        <h2 className="text-lg font-semibold">
          Platform Overview
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Real-time platform statistics and
          moderation tools will appear here.
        </p>
      </div>
    </div>
  );
}