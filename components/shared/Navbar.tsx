"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  UserCircle,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import {
  useState,
} from "react";

import {
  useAuth,
} from "@/components/provider/AuthProvider";

export default function Navbar() {
  const pathname =
    usePathname();

  const {
    user,
    loading,
    isAuthenticated,
    logout,
  } = useAuth();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();

    closeMobileMenu();

    window.location.href = "/";
  };

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/dashboard/admin"
      : user?.role === "PROVIDER"
        ? "/dashboard/provider"
        : "/dashboard/customer";

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="text-2xl font-bold tracking-tight text-gray-900"
        >
          Gear<span className="text-blue-600">Up</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink
            href="/"
            active={pathname === "/"}
          >
            Home
          </NavLink>

          <NavLink
            href="/gear"
            active={
              pathname === "/gear" ||
              pathname.startsWith(
                "/gear/"
              )
            }
          >
            Browse Gear
          </NavLink>

          {isAuthenticated &&
            user?.role ===
              "CUSTOMER" && (
              <NavLink
                href="/dashboard/customer"
                active={pathname.startsWith(
                  "/dashboard/customer"
                )}
              >
                My Rentals
              </NavLink>
            )}

          {isAuthenticated &&
            user?.role ===
              "PROVIDER" && (
              <NavLink
                href="/dashboard/provider"
                active={pathname.startsWith(
                  "/dashboard/provider"
                )}
              >
                Provider
              </NavLink>
            )}

          {isAuthenticated &&
            user?.role === "ADMIN" && (
              <NavLink
                href="/dashboard/admin"
                active={pathname.startsWith(
                  "/dashboard/admin"
                )}
              >
                Admin
              </NavLink>
            )}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100" />
          ) : isAuthenticated &&
            user ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right lg:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user.name}
                </p>

                <p className="text-xs text-gray-500">
                  {user.role}
                </p>
              </div>

              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-gray-50"
              >
                <LayoutDashboard
                  size={17}
                />

                Dashboard
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
              >
                <LogOut size={17} />

                Logout
              </button>
            </div>
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
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() =>
            setMobileOpen(
              (previous) =>
                !previous
            )
          }
          className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
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
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-4">
            <MobileLink
              href="/"
              onClick={closeMobileMenu}
            >
              Home
            </MobileLink>

            <MobileLink
              href="/gear"
              onClick={closeMobileMenu}
            >
              Browse Gear
            </MobileLink>

            {!loading &&
              isAuthenticated &&
              user && (
                <>
                  <MobileLink
                    href={dashboardHref}
                    onClick={closeMobileMenu}
                  >
                    <LayoutDashboard
                      size={18}
                    />

                    Dashboard
                  </MobileLink>

                  {user.role ===
                    "CUSTOMER" && (
                    <MobileLink
                      href="/dashboard/customer"
                      onClick={
                        closeMobileMenu
                      }
                    >
                      <ShoppingBag
                        size={18}
                      />

                      My Rentals
                    </MobileLink>
                  )}

                  {user.role ===
                    "ADMIN" && (
                    <MobileLink
                      href="/dashboard/admin"
                      onClick={
                        closeMobileMenu
                      }
                    >
                      Admin Dashboard
                    </MobileLink>
                  )}

                  <div className="my-3 border-t" />

                  <div className="flex items-center gap-3 px-3 py-3">
                    <UserCircle
                      size={25}
                    />

                    <div>
                      <p className="font-semibold">
                        {user.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {user.role}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 flex items-center gap-2 rounded-lg px-3 py-3 text-left font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut
                      size={18}
                    />

                    Logout
                  </button>
                </>
              )}

            {!loading &&
              !isAuthenticated && (
                <>
                  <MobileLink
                    href="/auth/login"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </MobileLink>

                  <MobileLink
                    href="/auth/register"
                    onClick={closeMobileMenu}
                  >
                    Register
                  </MobileLink>
                </>
              )}
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition ${
        active
          ? "text-blue-600"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-3 py-3 font-medium text-gray-700 hover:bg-gray-100"
    >
      {children}
    </Link>
  );
}