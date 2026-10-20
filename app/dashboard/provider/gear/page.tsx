"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  LockKeyhole,
  Plus,
  RefreshCw,
  Search,
  SearchX,
  ShieldAlert,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { getGears, deleteGear } from "@/services/gear.service";
import type { Gear } from "@/types/gear";
import ProviderGearTable from "@/components/dashboard/provider/ProviderGearTable";
import { useAuth } from "@/components/provider/AuthProvider";

/* ─────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────── */

type StatusFilter = "all" | "available" | "unavailable";

function getErrorMessage(err: unknown, fallback: string) {
  const e = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return e?.response?.data?.message || e?.message || fallback;
}

/* ─────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────── */

export default function ProviderGearPage() {
  const { user, loading: authLoading } = useAuth();

  const [gears, setGears] = useState<Gear[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  const [gearToDelete, setGearToDelete] = useState<Gear | null>(null);
  const [deleting, setDeleting] = useState(false);

  const userId = user?.id;

  const loadGears = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError("");

        const response = await getGears();
        const allGears: Gear[] = Array.isArray(response?.data)
          ? response.data
          : [];

        /*
         * IMPORTANT: only show gear owned by the
         * currently logged-in provider.
         */
        const myGears = userId
          ? allGears.filter((gear) => gear.providerId === userId)
          : [];

        setGears(myGears);
      } catch (err: unknown) {
        console.error("Failed to load provider gears:", err);
        setError(getErrorMessage(err, "Failed to load your gear."));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    if (authLoading || !user || user.role !== "PROVIDER") return;
    loadGears();
  }, [authLoading, user, loadGears]);

  // Close the delete dialog with Escape (unless a delete is running).
  useEffect(() => {
    if (!gearToDelete) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) setGearToDelete(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gearToDelete, deleting]);

  const requestDelete = (gear: Gear) => setGearToDelete(gear);

  const confirmDelete = async () => {
    if (!gearToDelete) return;

    try {
      setDeleting(true);
      await deleteGear(gearToDelete.id);

      setGears((current) =>
        current.filter((item) => item.id !== gearToDelete.id)
      );
      toast.success("Gear deleted successfully.");
      setGearToDelete(null);
    } catch (err: unknown) {
      console.error("Delete gear error:", err);
      toast.error(getErrorMessage(err, "Failed to delete gear."));
    } finally {
      setDeleting(false);
    }
  };

  const availableCount = gears.filter((g) => g.isAvailable).length;
  const unavailableCount = gears.length - availableCount;

  const visibleGears = useMemo(() => {
    const q = query.trim().toLowerCase();
    return gears.filter((gear) => {
      if (filter === "available" && !gear.isAvailable) return false;
      if (filter === "unavailable" && gear.isAvailable) return false;
      if (q && !(gear.title ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [gears, query, filter]);

  const filtersActive = query.trim() !== "" || filter !== "all";

  /* ── auth loading ────────────────────────────────────────────────── */
  if (authLoading) {
    return (
      <Shell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        </div>
      </Shell>
    );
  }

  /* ── signed out ──────────────────────────────────────────────────── */
  if (!user) {
    return (
      <Shell>
        <StateCard
          tone="indigo"
          icon={<LockKeyhole size={28} />}
          title="Sign in required"
          message="Sign in to your provider account to manage your gear."
          action={
            <Link
              href="/auth/login"
              className="inline-flex rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:shadow-lg hover:shadow-indigo-500/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
            >
              Sign in
            </Link>
          }
        />
      </Shell>
    );
  }

  /* ── wrong role ──────────────────────────────────────────────────── */
  if (user.role !== "PROVIDER") {
    return (
      <Shell>
        <StateCard
          tone="rose"
          icon={<ShieldAlert size={28} />}
          title="Access denied"
          message="This page is only available to provider accounts."
        />
      </Shell>
    );
  }

  /* ── main ────────────────────────────────────────────────────────── */
  return (
    <Shell>
      <div className="space-y-7">
        {/* header */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              My gear
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Manage your listed sports and outdoor equipment.
            </p>
          </div>

          <Link
            href="/dashboard/provider/gear/add"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:shadow-lg hover:shadow-indigo-500/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Add gear
          </Link>
        </header>

        {/* error */}
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

        {/* toolbar */}
        {!loading && gears.length > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="relative lg:w-80">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title"
                aria-label="Search gear by title"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                className="inline-flex rounded-xl bg-slate-100 p-1"
                role="group"
                aria-label="Filter by availability"
              >
                <FilterTab
                  active={filter === "all"}
                  onClick={() => setFilter("all")}
                  label="All"
                  count={gears.length}
                />
                <FilterTab
                  active={filter === "available"}
                  onClick={() => setFilter("available")}
                  label="Available"
                  count={availableCount}
                />
                <FilterTab
                  active={filter === "unavailable"}
                  onClick={() => setFilter("unavailable")}
                  label="Unavailable"
                  count={unavailableCount}
                />
              </div>

              <button
                type="button"
                onClick={() => loadGears(true)}
                disabled={refreshing}
                aria-label="Refresh list"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        )}

        {/* content */}
        {loading ? (
          <TableSkeleton />
        ) : gears.length > 0 && visibleGears.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <SearchX size={22} />
            </div>
            <p className="mt-4 font-semibold text-slate-900">
              No matching gear
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try a different search term or filter.
            </p>
            {filtersActive && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
                className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <ProviderGearTable gears={visibleGears} onDelete={requestDelete} />
        )}
      </div>

      {/* delete dialog */}
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
    </Shell>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Sub-components (file-local)
───────────────────────────────────────────────────────────────────── */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}

function StateCard({
  tone,
  icon,
  title,
  message,
  action,
}: {
  tone: "indigo" | "rose";
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  const chip =
    tone === "indigo"
      ? "bg-indigo-100 text-indigo-600"
      : "bg-rose-100 text-rose-600";

  return (
    <div className="mx-auto mt-10 max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xl shadow-slate-900/5">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${chip}`}
      >
        {icon}
      </div>
      <h1 className="mt-5 text-xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
        active
          ? "bg-white text-indigo-700 shadow-sm"
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
          active
            ? "bg-indigo-100 text-indigo-700"
            : "bg-slate-200/70 text-slate-500"
        }`}
      >
        {count}
      </span>
    </button>
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
      {Array.from({ length: 5 }).map((_, i) => (
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
