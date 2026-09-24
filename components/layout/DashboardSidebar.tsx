"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Star,
} from "lucide-react";
import { useAuth } from "../provider/AuthProvider";



interface DashboardSidebarProps {
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
}

export default function DashboardSidebar({
  role,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const { user, logout } = useAuth();

  const customerLinks = [
    {
      name: "Overview",
      href: "/dashboard/customer",
      icon: LayoutDashboard,
    },
    {
      name: "My Orders",
      href: "/dashboard/customer/orders",
      icon: ShoppingCart,
    },
    {
      name: "Payments",
      href: "/dashboard/customer/payments",
      icon: CreditCard,
    },
    {
      name: "Reviews",
      href: "/dashboard/customer/reviews",
      icon: Star,
    },
  ];

  const providerLinks = [
    {
      name: "Overview",
      href: "/dashboard/provider",
      icon: LayoutDashboard,
    },
    {
      name: "My Gear",
      href: "/dashboard/provider/gear",
      icon: Package,
    },
    {
      name: "Orders",
      href: "/dashboard/provider/orders",
      icon: ShoppingCart,
    },
  ];

  const adminLinks = [
    {
      name: "Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      name: "Gear",
      href: "/dashboard/admin/gear",
      icon: Package,
    },
    {
      name: "Rentals",
      href: "/dashboard/admin/rentals",
      icon: ShoppingCart,
    },
    {
      name: "Statistics",
      href: "/dashboard/admin/statistics",
      icon: BarChart3,
    },
  ];

  const links =
    role === "CUSTOMER"
      ? customerLinks
      : role === "PROVIDER"
        ? providerLinks
        : adminLinks;

  return (
    <aside className="hidden min-h-[calc(100vh-64px)] w-64 shrink-0 border-r bg-white lg:block">
      <div className="flex h-full flex-col">

        {/* User */}

        <div className="border-b p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
              {user?.name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user?.name}
              </p>

              <p className="truncate text-xs text-gray-500">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}

        <nav className="flex-1 space-y-1 p-4">
          {links.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(
                `${item.href}/`
              );

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={19} />

                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}

        <div className="border-t p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}