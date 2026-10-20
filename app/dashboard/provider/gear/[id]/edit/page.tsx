"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Loader2,
} from "lucide-react";

import {
  getGearById,
} from "@/services/gear.service";

import {
  getCategories,
} from "@/services/category.service";

import type {
  Gear,
} from "@/types/gear";

import { useAuth } from "@/components/provider/AuthProvider";

import GearForm from "@/components/provider/gear/GearForm";

interface Category {
  id: string;
  name: string;
  slug?: string;
}

export default function EditGearPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [gear, setGear] =
    useState<Gear | null>(null);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (
      authLoading ||
      !user ||
      user.role !== "PROVIDER"
    ) {
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const { id } =
          await params;

        const [
          gearResponse,
          categoryResponse,
        ] = await Promise.all([
          getGearById(id),
          getCategories(),
        ]);

        if (cancelled) {
          return;
        }

        const fetchedGear =
          gearResponse?.data;

        if (!fetchedGear) {
          throw new Error(
            "Gear not found."
          );
        }

        /*
         * IMPORTANT:
         * Verify that this gear belongs
         * to the currently logged-in provider.
         */
        if (
          fetchedGear.providerId !==
          user.id
        ) {
          throw new Error(
            "You can only edit your own gear."
          );
        }

        setGear(fetchedGear);

        setCategories(
          Array.isArray(
            categoryResponse
          )
            ? categoryResponse
            : []
        );
      } catch (err: any) {
        console.error(
          "Failed to load gear:",
          err
        );

        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load gear."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    user,
    params,
  ]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">
            Login required
          </h1>

          <Link
            href="/auth/login"
            className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-white"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  if (user.role !== "PROVIDER") {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">
            Access denied
          </h1>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <h1 className="text-xl font-semibold">
              Unable to edit gear
            </h1>

            <p className="mt-2">
              {error}
            </p>

            <Link
              href="/dashboard/provider/gear"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Gear
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!gear) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">
            Gear not found
          </h1>

          <Link
            href="/dashboard/provider/gear"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Gear
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/provider/gear"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Gear
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Gear
          </h1>

          <p className="mt-2 text-gray-500">
            Update your gear information,
            pricing, or inventory.
          </p>
        </div>

        <GearForm
          mode="edit"
          gear={gear}
          categories={categories}
          onSuccess={() => {
            window.location.href =
              "/dashboard/provider/gear";
          }}
        />
      </div>
    </main>
  );
}