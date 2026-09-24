"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import {
  registerSchema,
} from "@/lib/validations/auth";

import {
  registerUser,
} from "@/services/auth.service";

import type {
  RegisterPayload,
} from "@/types/auth";

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterPayload>({
    resolver: zodResolver(
      registerSchema
    ),
    defaultValues: {
      role: "CUSTOMER",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (
    data: RegisterPayload
  ) => {
    try {
      await registerUser(data);

      toast.success(
        "Registration successful! Please login."
      );

      router.push("/auth/login");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Registration failed";

      toast.error(message);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-3xl font-bold"
          >
            GearUp
          </Link>

          <h1 className="mt-4 text-2xl font-bold">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Join GearUp today
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Name */}

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium"
            >
              Full Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register("name")}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}

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
              placeholder="you@example.com"
              {...register("email")}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Phone */}

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium"
            >
              Phone
            </label>

            <input
              id="phone"
              type="tel"
              placeholder="01XXXXXXXXX"
              {...register("phone")}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
            />

            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Role */}

          <div>
            <label className="mb-3 block text-sm font-medium">
              Select Role
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label
                className={`cursor-pointer rounded-lg border p-4 ${
                  selectedRole ===
                  "CUSTOMER"
                    ? "border-black bg-gray-50"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  value="CUSTOMER"
                  {...register("role")}
                  className="mr-2"
                />

                <span className="font-medium">
                  Customer
                </span>

                <p className="mt-1 text-xs text-gray-500">
                  Rent sports gear
                </p>
              </label>

              <label
                className={`cursor-pointer rounded-lg border p-4 ${
                  selectedRole ===
                  "PROVIDER"
                    ? "border-black bg-gray-50"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  value="PROVIDER"
                  {...register("role")}
                  className="mr-2"
                />

                <span className="font-medium">
                  Provider
                </span>

                <p className="mt-1 text-xs text-gray-500">
                  Provide sports gear
                </p>
              </label>
            </div>

            {errors.role && (
              <p className="mt-1 text-sm text-red-500">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Submit */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-black hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}