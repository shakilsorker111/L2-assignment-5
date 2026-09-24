"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

import { useState } from "react";
import { useAuth } from "../provider/AuthProvider";



export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const {
    user,
    loading,
    isAuthenticated,
    logout,
  } = useAuth();

  const handleLogout = () => {
    logout();

    setMobileOpen(false);

    router.push("/");
  };

  const getDashboardPath = () => {
    if (!user) return "/auth/login";

    switch (user.role) {
      case "ADMIN":
        return "/dashboard/admin";

      case "PROVIDER":
        return "/dashboard/provider";

      default:
        return "/dashboard/customer";
    }
  };

  const navigation = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Gear",
      href: "/gear",
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}

        <Link
          href="/"
          className="text-2xl font-black tracking-tight"
        >
          Gear<span className="text-orange-500">Up</span>
        </Link>

        {/* Desktop Navigation */}

        <nav className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => {
            const active =
              pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition ${
                  active
                    ? "text-orange-500"
                    : "text-gray-700 hover:text-orange-500"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}

        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200" />
          ) : isAuthenticated ? (
            <>
              <Link
                href={getDashboardPath()}
                className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
              >
                <LayoutDashboard size={17} />
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
              >
                <LogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100"
              >
                Login
              </Link>

              <Link
                href="/auth/register"
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Button */}

        <button
          type="button"
          onClick={() =>
            setMobileOpen(!mobileOpen)
          }
          className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}

      {mobileOpen && (
        <div className="border-t bg-white md:hidden">
          <div className="mx-auto max-w-7xl space-y-2 px-4 py-4">

            {navigation.map((item) => {
              const active =
                pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className={`block rounded-lg px-4 py-3 text-sm font-medium ${
                    active
                      ? "bg-orange-50 text-orange-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            {loading ? (
              <div className="h-10 animate-pulse rounded-lg bg-gray-200" />
            ) : isAuthenticated ? (
              <>
                <Link
                  href={getDashboardPath()}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium hover:bg-gray-50"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="block rounded-lg px-4 py-3 text-sm font-medium hover:bg-gray-50"
                >
                  Login
                </Link>

                <Link
                  href="/auth/register"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="block rounded-lg bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}