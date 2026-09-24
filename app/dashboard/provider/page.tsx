"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import {
  getGears,
  deleteGear,
} from "@/services/gear.service";

import type { Gear } from "@/types/gear";

import ProviderStats from "@/components/dashboard/provider/ProviderStats";

import ProviderGearTable from "@/components/dashboard/provider/ProviderGearTable";

import { toast } from "sonner";

export default function ProviderDashboardPage() {
  const [
    gears,
    setGears,
  ] = useState<Gear[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const loadGears =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getGears();

        setGears(
          response.data ?? []
        );
      } catch (error: any) {
        console.error(
          "Failed to load gears:",
          error
        );

        const message =
          error?.response?.data
            ?.message ??
          "Failed to load your gear.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadGears();
  }, []);

  const handleDelete = async (
    gear: Gear
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${gear.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteGear(
        gear.id
      );

      setGears(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !==
              gear.id
          )
      );

      toast.success(
        "Gear deleted successfully"
      );
    } catch (error: any) {
      console.error(
        "Delete gear error:",
        error
      );

      toast.error(
        error?.response?.data
          ?.message ??
          "Failed to delete gear"
      );
    }
  };

  const activeGear =
    gears.filter(
      (gear) =>
        gear.isAvailable
    ).length;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section className="rounded-2xl bg-gray-900 p-6 text-white md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-gray-300">
              Provider workspace
            </p>

            <h1 className="mt-1 text-2xl font-bold md:text-3xl">
              Manage your gear
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300">
              Add, manage, and monitor your sports and outdoor equipment from one place.
            </p>
          </div>

          <Link
            href="/dashboard/provider/gear/add"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-gray-900 transition hover:bg-gray-100"
          >
            <Plus size={18} />

            Add Gear
          </Link>
        </div>
      </section>

      {/* Stats */}
      <ProviderStats
        totalGear={gears.length}
        activeGear={activeGear}
        pendingOrders={0}
        totalRevenue={0}
      />

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1">
            <p className="font-semibold">
              Unable to load dashboard
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={
              loadGears
            }
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Gear */}
      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <RefreshCw
            size={24}
            className="mx-auto animate-spin text-gray-400"
          />

          <p className="mt-3 text-sm text-gray-500">
            Loading your gear...
          </p>
        </div>
      ) : (
        <ProviderGearTable
          gears={gears}
          onDelete={
            handleDelete
          }
        />
      )}
    </div>
  );
}