"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

import { toast } from "sonner";

import {
  useAuth,
} from "@/components/provider/AuthProvider";

export default function LoginPage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const {
    login,
    isAuthenticated,
    user,
    loading: authLoading,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  /**
   * If already logged in,
   * do not show login page.
   */
  useEffect(() => {
    if (
      !authLoading &&
      isAuthenticated &&
      user
    ) {
      const redirect =
        searchParams.get(
          "redirect"
        );

      if (
        redirect &&
        redirect.startsWith("/")
      ) {
        router.replace(
          redirect
        );

        return;
      }

      if (
        user.role === "ADMIN"
      ) {
        router.replace(
          "/dashboard/admin"
        );
      } else if (
        user.role === "PROVIDER"
      ) {
        router.replace(
          "/dashboard/provider"
        );
      } else {
        router.replace(
          "/dashboard/customer"
        );
      }
    }
  }, [
    authLoading,
    isAuthenticated,
    user,
    router,
    searchParams,
  ]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error(
        "Email is required"
      );

      return;
    }

    if (!password) {
      toast.error(
        "Password is required"
      );

      return;
    }

    try {
      setSubmitting(true);

      const authenticatedUser =
        await login({
          email:
            email.trim(),
          password,
        });

      toast.success(
        "Login successful"
      );

      const redirect =
        searchParams.get(
          "redirect"
        );

      if (
        redirect &&
        redirect.startsWith("/")
      ) {
        router.replace(
          redirect
        );

        return;
      }

      if (
        authenticatedUser.role ===
        "ADMIN"
      ) {
        router.replace(
          "/dashboard/admin"
        );
      } else if (
        authenticatedUser.role ===
        "PROVIDER"
      ) {
        router.replace(
          "/dashboard/provider"
        );
      } else {
        router.replace(
          "/dashboard/customer"
        );
      }
    } catch (error: any) {
      console.error(
        "Login failed:",
        error
      );

      const message =
        error?.response?.data
          ?.message ||
        "Invalid email or password";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin text-blue-600"
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to continue using
            GearUp.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="customer@example.com"
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="••••••••"
                className="w-full rounded-lg border px-4 py-3 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) =>
                      !value
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {submitting ? (
              <>
                <Loader2
                  size={19}
                  className="animate-spin"
                />

                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}