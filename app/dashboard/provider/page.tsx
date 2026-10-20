"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Boxes,
  CircleCheck,
  CirclePause,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { getGears, deleteGear } from "@/services/gear.service";
import type { Gear } from "@/types/gear";
import ProviderStats from "@/components/dashboard/provider/ProviderStats";
import ProviderGearTable from "@/components/dashboard/provider/ProviderGearTable";

/* ─────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────── */

function getErrorMessage(err: unknown, fallback: string) {
  const apiErr = err as { response?: { data?: { message?: string } } };
  return apiErr?.response?.data?.message ?? fallback;
}

/* ─────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────── */

export default function ProviderDashboardPage() {
  const [gears, setGears] = useState<Gear[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [gearToDelete, setGearToDelete] = useState<Gear | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadGears = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const response = await getGears();
      setGears(response.data ?? []);
    } catch (err: unknown) {
      console.error("Failed to load gears:", err);
      setError(getErrorMessage(err, "Failed to load your gear."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadGears();
  }, [loadGears]);

  // Closing the dialog with Escape (unless a delete is in flight).
  useEffect(() => {
    if (!gearToDelete) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) setGearToDelete(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gearToDelete, deleting]);

  /* The table calls this; we open the confirm dialog instead of window.confirm. */
  const requestDelete = (gear: Gear) => setGearToDelete(gear);

  const confirmDelete = async () => {
    if (!gearToDelete) return;

    try {
      setDeleting(true);
      await deleteGear(gearToDelete.id);

      setGears((previous) =>
        previous.filter((item) => item.id !== gearToDelete.id)
      );
      toast.success("Gear deleted successfully");
      setGearToDelete(null);
    } catch (err: unknown) {
      console.error("Delete gear error:", err);
      toast.error(getErrorMessage(err, "Failed to delete gear"));
    } finally {
      setDeleting(false);
    }
  };

  const activeGear = gears.filter((gear) => gear.isAvailable).length;
  const inactiveGear = gears.length - activeGear;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12">
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 p-6 text-white shadow-xl shadow-indigo-900/20 md:p-9">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 90% 0%, rgba(139,92,246,0.45) 0%, transparent 45%), radial-gradient(circle at 0% 100%, rgba(14,165,233,0.30) 0%, transparent 45%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100 ring-1 ring-inset ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Provider workspace
            </p>

            <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-4xl">
              Manage your gear
            </h1>

            <p className="mt-3 text-sm leading-6 text-indigo-100/80 md:text-base">
              Add, update, and monitor your sports and outdoor equipment
              listings from one place.
            </p>

            {/* quick summary chips */}
            {!loading && !error && (
              <div className="mt-6 flex flex-wrap gap-3">
                <SummaryChip
                  icon={<Boxes size={14} />}
                  label="Listings"
                  value={gears.length}
                  tone="text-sky-300"
                />
                <SummaryChip
                  icon={<CircleCheck size={14} />}
                  label="Available"
                  value={activeGear}
                  tone="text-emerald-300"
                />
                <SummaryChip
                  icon={<CirclePause size={14} />}
                  label="Unavailable"
                  value={inactiveGear}
                  tone="text-amber-300"
                />
              </div>
            )}
          </div>

          <Link
            href="/dashboard/provider/gear/add"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-black/10 transition hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
          >
            <Plus size={18} />
            Add gear
          </Link>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <ProviderStats
        totalGear={gears.length}
        activeGear={activeGear}
        pendingOrders={0}
        totalRevenue={0}
      />

      {/* ── Error ──────────────────────────────────────────── */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:flex-row sm:items-center"
        >
          <div className="flex flex-1 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="font-semibold text-rose-900">
                Unable to load your gear
              </p>
              <p className="mt-0.5 text-sm text-rose-700">{error}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadGears()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      )}

      {/* ── Inventory ──────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Your inventory
            </h2>
            <p className="text-sm text-slate-500">
              {loading
                ? "Loading listings…"
                : `${gears.length} ${
                    gears.length === 1 ? "listing" : "listings"
                  } in total`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadGears(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : (
          <ProviderGearTable gears={gears} onDelete={requestDelete} />
        )}
      </section>

      {/* ── Delete confirmation ────────────────────────────── */}
      {gearToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-gear-title"
        >
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !deleting && setGearToDelete(null)}
          />

          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl md:p-7">
            <button
              type="button"
              onClick={() => setGearToDelete(null)}
              disabled={deleting}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-50"
            >
              <X size={18} />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <Trash2 size={22} />
            </div>

            <h3
              id="delete-gear-title"
              className="mt-5 text-lg font-bold text-slate-900"
            >
              Delete this gear?
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              <span className="font-semibold text-slate-800">
                {gearToDelete.title}
              </span>{" "}
              will be permanently removed from your listings. This can’t be
              undone.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setGearToDelete(null)}
                disabled={deleting}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-500/25 transition hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Delete gear
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Sub-components (file-local)
───────────────────────────────────────────────────────────────────── */

function SummaryChip({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2.5 ring-1 ring-inset ring-white/15 backdrop-blur">
      <span className={tone}>{icon}</span>
      <div className="leading-tight">
        <p className="text-lg font-bold">{value}</p>
        <p className="text-xs text-indigo-100/70">{label}</p>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
      aria-busy="true"
      aria-label="Loading your gear"
    >
      <div className="h-12 border-b border-slate-100 bg-slate-50" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-slate-100 p-4 last:border-0"
        >
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-1/5 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="hidden h-6 w-20 animate-pulse rounded-full bg-slate-100 sm:block" />
          <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
