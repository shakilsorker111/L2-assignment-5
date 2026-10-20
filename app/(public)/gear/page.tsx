"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Heart,
  LayoutGrid,
  List,
  Package,
  RefreshCw,
  Search,
  SearchX,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { getGears } from "@/services/gear.service";
import { getCategories } from "@/services/category.service";
import type { Gear } from "@/types/gear";
import GearSkeleton from "@/components/gear/GearSkeleton";

/* ─────────────────────────────────────────────────────────────────────
   Types & constants
───────────────────────────────────────────────────────────────────── */

interface Category {
  id: string;
  name: string;
}

/* Optional fields the API may or may not return; typed loosely on purpose. */
type GearItem = Gear & {
  condition?: string | null;
  stock?: number | null;
  isAvailable?: boolean;
};

type SortKey = "featured" | "price-asc" | "price-desc" | "name";
type ViewMode = "grid" | "list";

const PAGE_SIZE = 12;
const SAVED_KEY = "gearup:saved-gear";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
];

const CONDITION_META: Record<string, { label: string; badge: string }> = {
  NEW: {
    label: "New",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  LIKE_NEW: {
    label: "Like new",
    badge: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  GOOD: {
    label: "Good",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  FAIR: {
    label: "Fair",
    badge: "bg-orange-50 text-orange-700 ring-orange-200",
  },
};

/* Tailwind needs full class names at build time, so tones live in a map. */
const TONES = [
  {
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    active: "from-indigo-600 to-violet-600 shadow-indigo-500/30",
    dot: "bg-indigo-500",
    art: "from-indigo-100 via-violet-50 to-sky-100",
    icon: "text-indigo-300",
  },
  {
    badge: "bg-sky-50 text-sky-700 ring-sky-200",
    active: "from-sky-500 to-cyan-500 shadow-sky-500/30",
    dot: "bg-sky-500",
    art: "from-sky-100 via-cyan-50 to-indigo-100",
    icon: "text-sky-300",
  },
  {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    active: "from-emerald-500 to-teal-500 shadow-emerald-500/30",
    dot: "bg-emerald-500",
    art: "from-emerald-100 via-teal-50 to-sky-100",
    icon: "text-emerald-300",
  },
  {
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    active: "from-amber-500 to-orange-500 shadow-amber-500/30",
    dot: "bg-amber-500",
    art: "from-amber-100 via-orange-50 to-rose-100",
    icon: "text-amber-300",
  },
  {
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    active: "from-rose-500 to-pink-500 shadow-rose-500/30",
    dot: "bg-rose-500",
    art: "from-rose-100 via-pink-50 to-orange-100",
    icon: "text-rose-300",
  },
  {
    badge: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
    active: "from-fuchsia-500 to-violet-500 shadow-fuchsia-500/30",
    dot: "bg-fuchsia-500",
    art: "from-fuchsia-100 via-violet-50 to-indigo-100",
    icon: "text-fuchsia-300",
  },
];

/* ─────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────── */

function toneFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return TONES[Math.abs(hash) % TONES.length];
}

/** Accepts either `T[]` or `{ data: T[] }` so both service shapes work. */
function normalizeList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  const data = (value as { data?: unknown } | null)?.data;
  return Array.isArray(data) ? (data as T[]) : [];
}

function getErrorMessage(err: unknown, fallback: string) {
  const e = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return e?.response?.data?.message || e?.message || fallback;
}

function parseSort(value: string | null): SortKey {
  return SORT_OPTIONS.some((o) => o.value === value)
    ? (value as SortKey)
    : "featured";
}

function priceOf(gear: GearItem) {
  const n = Number(gear.pricePerDay);
  return Number.isFinite(n) ? n : 0;
}

function formatPrice(n: number) {
  return Number.isInteger(n)
    ? `$${n.toLocaleString("en-US")}`
    : `$${n.toFixed(2)}`;
}

function gearCategoryId(gear: GearItem) {
  return gear.category?.id ?? gear.categoryId ?? "";
}

function isAvailable(gear: GearItem) {
  if (gear.isAvailable === false) return false;
  if (typeof gear.stock === "number" && gear.stock <= 0) return false;
  return true;
}

/** Saved gear, persisted in localStorage (safe against blocked storage). */
function useSavedGear() {
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSaved(parsed.filter((x): x is string => typeof x === "string"));
        }
      }
    } catch {
      /* storage unavailable or corrupted: start empty */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    } catch {
      /* ignore */
    }
  }, [saved, ready]);

  const toggle = useCallback((id: string) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  return { saved, toggle };
}

/* ─────────────────────────────────────────────────────────────────────
   Page (Suspense is required because of useSearchParams)
───────────────────────────────────────────────────────────────────── */

export default function GearPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <GearBrowser />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="h-72 animate-pulse bg-gradient-to-br from-indigo-200 to-violet-200" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <GearSkeleton />
      </div>
    </main>
  );
}

function GearBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* data */
  const [gears, setGears] = useState<GearItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* filters (search / category / sort live in the URL) */
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [categoryId, setCategoryId] = useState(
    searchParams.get("category") ?? ""
  );
  const [sort, setSort] = useState<SortKey>(parseSort(searchParams.get("sort")));

  /* advanced filters */
  const [showFilters, setShowFilters] = useState(false);
  const [conditions, setConditions] = useState<string[]>([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  /* presentation */
  const [view, setView] = useState<ViewMode>("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { saved, toggle: toggleSaved } = useSavedGear();
  const searchRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);

  /* search suggestions (autocomplete) */
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  /* ── load ───────────────────────────────────────────────────────── */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [gearResult, categoryResult] = await Promise.allSettled([
      getGears(),
      getCategories(),
    ]);

    if (!mountedRef.current) return;

    if (gearResult.status === "fulfilled") {
      setGears(normalizeList<GearItem>(gearResult.value));
    } else {
      console.error("Failed to load gear:", gearResult.reason);
      setError(getErrorMessage(gearResult.reason, "Failed to load gear."));
    }

    // Categories are a nice-to-have: fall back to categories found on gear.
    setCategories(
      categoryResult.status === "fulfilled"
        ? normalizeList<Category>(categoryResult.value)
        : []
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    return () => {
      mountedRef.current = false;
    };
  }, [loadData]);

  /* ── keep search / category / sort in the URL (shareable links) ─── */
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (categoryId) params.set("category", categoryId);
      if (sort !== "featured") params.set("sort", sort);

      const next = params.toString();
      if (next === searchParams.toString()) return;

      router.replace(next ? `${pathname}?${next}` : pathname, {
        scroll: false,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, categoryId, sort, pathname, router, searchParams]);

  /* ── "/" focuses the search box ─────────────────────────────────── */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      searchRef.current?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* ── derived data ───────────────────────────────────────────────── */
  const categoryList = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    gears.forEach((g) => {
      const id = gearCategoryId(g);
      if (id && g.category?.name && !map.has(id)) map.set(id, g.category.name);
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [categories, gears]);

  const categoryNameById = useMemo(
    () => new Map(categoryList.map((c) => [c.id, c.name])),
    [categoryList]
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    gears.forEach((g) => {
      const id = gearCategoryId(g);
      if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
    });
    return counts;
  }, [gears]);

  const getCategoryName = useCallback(
    (gear: GearItem) =>
      gear.category?.name ||
      categoryNameById.get(gear.categoryId ?? "") ||
      "Uncategorized",
    [categoryNameById]
  );

  /* Top matches for the search box: best name matches first. */
  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];

    const scored: { gear: GearItem; score: number }[] = [];

    for (const gear of gears) {
      const title = (gear.title ?? "").toLowerCase();
      const brand = (gear.brand ?? "").toLowerCase();
      const category = getCategoryName(gear).toLowerCase();

      let score = 0;
      if (title.startsWith(q)) score = 4;
      else if (title.split(/\s+/).some((word) => word.startsWith(q))) score = 3;
      else if (title.includes(q)) score = 2;
      else if (brand.includes(q) || category.includes(q)) score = 1;

      if (score > 0) scored.push({ gear, score });
    }

    return scored
      .sort(
        (a, b) =>
          b.score - a.score ||
          (a.gear.title ?? "").localeCompare(b.gear.title ?? "")
      )
      .slice(0, 6)
      .map((item) => item.gear);
  }, [search, gears, getCategoryName]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = minPrice !== "" ? Number(minPrice) : null;
    const max = maxPrice !== "" ? Number(maxPrice) : null;

    const list = gears.filter((gear) => {
      if (q) {
        const haystack = [
          gear.title,
          gear.brand,
          gear.description,
          getCategoryName(gear),
        ];
        if (!haystack.some((v) => v?.toLowerCase().includes(q))) return false;
      }

      if (categoryId && gearCategoryId(gear) !== categoryId) return false;

      if (conditions.length && !conditions.includes(gear.condition ?? ""))
        return false;

      if (availableOnly && !isAvailable(gear)) return false;
      if (savedOnly && !saved.includes(gear.id)) return false;

      const price = priceOf(gear);
      if (min !== null && Number.isFinite(min) && price < min) return false;
      if (max !== null && Number.isFinite(max) && price > max) return false;

      return true;
    });

    if (sort === "featured") return list;

    return [...list].sort((a, b) => {
      if (sort === "price-asc") return priceOf(a) - priceOf(b);
      if (sort === "price-desc") return priceOf(b) - priceOf(a);
      return (a.title ?? "").localeCompare(b.title ?? "");
    });
  }, [
    gears,
    search,
    categoryId,
    conditions,
    availableOnly,
    savedOnly,
    saved,
    minPrice,
    maxPrice,
    sort,
    getCategoryName,
  ]);

  // Back to the first page whenever the result set changes shape.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    search,
    categoryId,
    sort,
    conditions,
    availableOnly,
    savedOnly,
    minPrice,
    maxPrice,
  ]);

  const visible = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visible.length;

  const availableCount = gears.filter(isAvailable).length;
  const activeCategoryCount = categoryCounts.size;

  const advancedCount =
    conditions.length +
    (availableOnly ? 1 : 0) +
    (savedOnly ? 1 : 0) +
    (minPrice !== "" || maxPrice !== "" ? 1 : 0);

  /* ── active filter chips ────────────────────────────────────────── */
  const activeChips: { key: string; label: string; onRemove: () => void }[] =
    [];

  if (search.trim()) {
    activeChips.push({
      key: "q",
      label: `“${search.trim()}”`,
      onRemove: () => setSearch(""),
    });
  }
  if (categoryId) {
    activeChips.push({
      key: "category",
      label: categoryNameById.get(categoryId) ?? "Category",
      onRemove: () => setCategoryId(""),
    });
  }
  conditions.forEach((c) =>
    activeChips.push({
      key: `cond-${c}`,
      label: CONDITION_META[c]?.label ?? c,
      onRemove: () => setConditions((prev) => prev.filter((x) => x !== c)),
    })
  );
  if (availableOnly) {
    activeChips.push({
      key: "available",
      label: "Available now",
      onRemove: () => setAvailableOnly(false),
    });
  }
  if (savedOnly) {
    activeChips.push({
      key: "saved",
      label: "Saved",
      onRemove: () => setSavedOnly(false),
    });
  }
  if (minPrice !== "" || maxPrice !== "") {
    activeChips.push({
      key: "price",
      label: `${minPrice !== "" ? `$${minPrice}` : "Any"} – ${
        maxPrice !== "" ? `$${maxPrice}` : "Any"
      } / day`,
      onRemove: () => {
        setMinPrice("");
        setMaxPrice("");
      },
    });
  }

  const clearAll = () => {
    setSearch("");
    setCategoryId("");
    setConditions([]);
    setAvailableOnly(false);
    setSavedOnly(false);
    setMinPrice("");
    setMaxPrice("");
  };

  const toggleCondition = (value: string) =>
    setConditions((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );

  const showEmpty = !loading && !error && filtered.length === 0;

  /* ── search suggestions: behaviour ──────────────────────────────── */
  const showSuggestions =
    suggestOpen && !loading && search.trim().length > 0;
  // suggestions + the trailing "See all results" row
  const optionCount = suggestions.length > 0 ? suggestions.length + 1 : 0;

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!searchBoxRef.current?.contains(e.target as Node)) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const goToGear = (gear: GearItem) => {
    setSuggestOpen(false);
    router.push(`/gear/${gear.id}`);
  };

  const showAllResults = () => {
    setSuggestOpen(false);
    setActiveIndex(-1);
    searchRef.current?.blur();
    document
      .getElementById("gear-results")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSearchKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        if (!search.trim()) return;
        e.preventDefault();
        if (!suggestOpen) {
          setSuggestOpen(true);
        } else if (optionCount > 0) {
          setActiveIndex((i) => (i + 1) % optionCount);
        }
        break;

      case "ArrowUp":
        if (!suggestOpen || optionCount === 0) return;
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? optionCount - 1 : i - 1));
        break;

      case "Enter":
        if (suggestOpen && activeIndex >= 0 && optionCount > 0) {
          e.preventDefault();
          if (activeIndex < suggestions.length) {
            goToGear(suggestions[activeIndex]);
          } else {
            showAllResults();
          }
        } else {
          setSuggestOpen(false);
        }
        break;

      case "Escape":
        if (suggestOpen) {
          e.preventDefault();
          setSuggestOpen(false);
          setActiveIndex(-1);
        }
        break;
    }
  };
  const showResults = !loading && !error && filtered.length > 0;

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-slate-50">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative z-20 bg-gradient-to-br from-indigo-700 via-violet-600 to-fuchsia-500">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 20%, rgba(56,189,248,0.50) 0%, transparent 42%), radial-gradient(circle at 88% 10%, rgba(251,191,36,0.38) 0%, transparent 38%), radial-gradient(circle at 70% 100%, rgba(244,63,94,0.45) 0%, transparent 50%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 md:pb-16 md:pt-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-inset ring-white/25 backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-300" />
              GearUp rental marketplace
            </p>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Rent the gear.
              <span className="block bg-gradient-to-r from-amber-200 via-white to-sky-200 bg-clip-text text-transparent">
                Skip the commitment.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-indigo-50/90 sm:text-lg">
              Find sports and outdoor equipment available for rent from GearUp
              providers.
            </p>
          </div>

          {/* search */}
          <div
            className="mt-8 max-w-2xl"
            ref={searchBoxRef}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setSuggestOpen(false);
              }
            }}
          >
            <label htmlFor="gear-search" className="sr-only">
              Search gear
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="gear-search"
                ref={searchRef}
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSuggestOpen(true);
                  setActiveIndex(-1);
                }}
                onFocus={() => {
                  if (search.trim()) setSuggestOpen(true);
                }}
                onKeyDown={handleSearchKeyDown}
                role="combobox"
                aria-expanded={showSuggestions}
                aria-controls="gear-suggestions"
                aria-autocomplete="list"
                aria-activedescendant={
                  showSuggestions && activeIndex >= 0
                    ? `gear-suggestion-${activeIndex}`
                    : undefined
                }
                placeholder="Search by gear, brand, category…"
                autoComplete="off"
                className="w-full rounded-2xl border-0 bg-white py-4 pl-14 pr-24 text-base text-slate-900 shadow-2xl shadow-indigo-900/30 outline-none ring-0 transition placeholder:text-slate-400 focus:ring-4 focus:ring-white/40 [&::-webkit-search-cancel-button]:hidden"
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                {search ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      searchRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <kbd
                    aria-hidden="true"
                    className="hidden rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-400 sm:block"
                  >
                    /
                  </kbd>
                )}
              </div>

              {/* suggestions dropdown */}
              {showSuggestions && (
                <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-slate-900 shadow-2xl shadow-indigo-900/30">
                  {suggestions.length > 0 ? (
                    <>
                      <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Suggestions
                      </p>

                      <ul
                        id="gear-suggestions"
                        role="listbox"
                        aria-label="Gear suggestions"
                        className="max-h-[24rem] overflow-y-auto px-2 pb-2"
                      >
                        {suggestions.map((gear, index) => {
                          const active = index === activeIndex;
                          const tone = toneFor(
                            gearCategoryId(gear) || getCategoryName(gear)
                          );
                          return (
                            <li
                              key={gear.id}
                              id={`gear-suggestion-${index}`}
                              role="option"
                              aria-selected={active}
                              onMouseDown={(e) => e.preventDefault()}
                              onMouseEnter={() => setActiveIndex(index)}
                              onClick={() => goToGear(gear)}
                              className={`flex cursor-pointer items-center gap-3 rounded-xl p-2 transition ${
                                active ? "bg-indigo-50" : "hover:bg-slate-50"
                              }`}
                            >
                              <SuggestionThumb
                                key={gear.image ?? ""}
                                src={gear.image}
                                alt=""
                                artClass={tone.art}
                                iconClass={tone.icon}
                              />

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  <Highlight
                                    text={gear.title ?? ""}
                                    query={search}
                                  />
                                </p>
                                <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500">
                                  {gear.brand && (
                                    <span className="truncate">
                                      {gear.brand}
                                    </span>
                                  )}
                                  {gear.brand && (
                                    <span aria-hidden="true">·</span>
                                  )}
                                  <span
                                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${tone.badge}`}
                                  >
                                    {getCategoryName(gear)}
                                  </span>
                                </p>
                              </div>

                              <div className="shrink-0 text-right">
                                <p className="text-sm font-bold text-indigo-600">
                                  {formatPrice(priceOf(gear))}
                                  <span className="text-xs font-medium text-slate-400">
                                    {" "}
                                    / day
                                  </span>
                                </p>
                                {!isAvailable(gear) && (
                                  <p className="text-[11px] font-medium text-slate-400">
                                    Unavailable
                                  </p>
                                )}
                              </div>
                            </li>
                          );
                        })}

                        <li
                          id={`gear-suggestion-${suggestions.length}`}
                          role="option"
                          aria-selected={activeIndex === suggestions.length}
                          onMouseDown={(e) => e.preventDefault()}
                          onMouseEnter={() =>
                            setActiveIndex(suggestions.length)
                          }
                          onClick={showAllResults}
                          className={`mt-1 flex cursor-pointer items-center justify-between gap-3 rounded-xl border-t border-slate-100 px-3 py-3 text-sm font-semibold text-indigo-600 transition ${
                            activeIndex === suggestions.length
                              ? "bg-indigo-50"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <Search className="h-4 w-4 shrink-0" />
                            See all results for “{search.trim()}”
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0" />
                        </li>
                      </ul>
                    </>
                  ) : (
                    <div
                      id="gear-suggestions"
                      role="status"
                      className="px-5 py-7 text-center"
                    >
                      <SearchX className="mx-auto h-7 w-7 text-slate-300" />
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        No gear matches “{search.trim()}”
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Try a different name, brand or category.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* stats */}
          <dl className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
            <HeroStat
              icon={<Package className="h-4 w-4" />}
              label="Listings"
              value={loading ? null : gears.length}
              tone="text-sky-200"
            />
            <HeroStat
              icon={<LayoutGrid className="h-4 w-4" />}
              label="Categories"
              value={loading ? null : activeCategoryCount}
              tone="text-amber-200"
            />
            <HeroStat
              icon={<Sparkles className="h-4 w-4" />}
              label="Available now"
              value={loading ? null : availableCount}
              tone="text-emerald-200"
            />
          </dl>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* category pills */}
        {(loading || categoryList.length > 0) && (
          <div
            className="-mx-4 mb-6 flex gap-2.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Filter by category"
          >
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-28 shrink-0 animate-pulse rounded-full bg-slate-200"
                />
              ))
            ) : (
              <>
                <CategoryPill
                  label="All"
                  count={gears.length}
                  active={categoryId === ""}
                  activeClass="from-slate-800 to-indigo-900 shadow-slate-900/25"
                  dotClass="bg-slate-400"
                  onClick={() => setCategoryId("")}
                />
                {categoryList
                  .filter(
                    (c) => (categoryCounts.get(c.id) ?? 0) > 0 || c.id === categoryId
                  )
                  .map((c) => {
                    const tone = toneFor(c.id);
                    return (
                      <CategoryPill
                        key={c.id}
                        label={c.name}
                        count={categoryCounts.get(c.id) ?? 0}
                        active={categoryId === c.id}
                        activeClass={tone.active}
                        dotClass={tone.dot}
                        onClick={() =>
                          setCategoryId(categoryId === c.id ? "" : c.id)
                        }
                      />
                    );
                  })}
              </>
            )}
          </div>
        )}

        {/* toolbar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              aria-controls="advanced-filters"
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                showFilters || advancedCount > 0
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {advancedCount > 0 && (
                <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-bold text-white">
                  {advancedCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="gear-sort"
                  className="hidden text-sm text-slate-500 sm:block"
                >
                  Sort by
                </label>
                <select
                  id="gear-sort"
                  value={sort}
                  onChange={(e) => setSort(parseSort(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="hidden rounded-xl bg-slate-100 p-1 sm:inline-flex"
                role="group"
                aria-label="Layout"
              >
                <ViewButton
                  active={view === "grid"}
                  label="Grid view"
                  onClick={() => setView("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </ViewButton>
                <ViewButton
                  active={view === "list"}
                  label="List view"
                  onClick={() => setView("list")}
                >
                  <List className="h-4 w-4" />
                </ViewButton>
              </div>
            </div>
          </div>

          {/* advanced filters */}
          {showFilters && (
            <div
              id="advanced-filters"
              className="mt-4 grid gap-6 border-t border-slate-100 pt-5 md:grid-cols-2 lg:grid-cols-4"
            >
              <FilterGroup title="Condition">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CONDITION_META).map(([value, meta]) => {
                    const on = conditions.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleCondition(value)}
                        aria-pressed={on}
                        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                          on
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50"
                        }`}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </FilterGroup>

              <FilterGroup title="Price per day">
                <div className="flex items-center gap-2">
                  <PriceInput
                    label="Minimum price"
                    placeholder="Min"
                    value={minPrice}
                    onChange={setMinPrice}
                  />
                  <span className="text-slate-300">–</span>
                  <PriceInput
                    label="Maximum price"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={setMaxPrice}
                  />
                </div>
              </FilterGroup>

              <FilterGroup title="Availability">
                <Switch
                  checked={availableOnly}
                  onChange={setAvailableOnly}
                  label="Available now only"
                />
              </FilterGroup>

              <FilterGroup title="Your list">
                <Switch
                  checked={savedOnly}
                  onChange={setSavedOnly}
                  label={`Saved only (${saved.length})`}
                />
              </FilterGroup>
            </div>
          )}
        </div>

        {/* active chips */}
        {activeChips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                aria-label={`Remove filter ${chip.label}`}
                className="group inline-flex items-center gap-1.5 rounded-full bg-indigo-50 py-1 pl-3 pr-2 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200 transition hover:bg-indigo-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                {chip.label}
                <X className="h-3.5 w-3.5 text-indigo-400 group-hover:text-indigo-700" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="rounded-lg px-2 py-1 text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Clear all
            </button>
          </div>
        )}

        {/* results header */}
        <div
          id="gear-results"
          className="mb-5 mt-7 flex scroll-mt-6 items-end justify-between gap-3"
        >
          <div>
            <h2 className="text-xl font-bold text-slate-900">Available gear</h2>
            <p
              className="mt-1 text-sm text-slate-500"
              role="status"
              aria-live="polite"
            >
              {loading
                ? "Loading gear…"
                : error
                  ? "Couldn’t load results"
                  : `${filtered.length} ${
                      filtered.length === 1 ? "item" : "items"
                    } found`}
            </p>
          </div>
        </div>

        {/* loading */}
        {loading && <GearSkeleton />}

        {/* error */}
        {!loading && error && (
          <div
            role="alert"
            className="flex flex-col items-center rounded-3xl border border-rose-200 bg-rose-50 px-6 py-14 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-rose-900">
              Unable to load gear
            </h3>
            <p className="mt-1 max-w-md text-sm text-rose-700">{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-500/25 transition hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {/* empty */}
        {showEmpty && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-500">
              {savedOnly && saved.length === 0 ? (
                <Heart className="h-8 w-8" />
              ) : (
                <SearchX className="h-8 w-8" />
              )}
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-900">
              {savedOnly && saved.length === 0
                ? "No saved gear yet"
                : gears.length === 0
                  ? "No gear listed yet"
                  : "No gear found"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {savedOnly && saved.length === 0
                ? "Tap the heart on any listing to save it here."
                : gears.length === 0
                  ? "Check back soon. Providers are adding new equipment."
                  : "Try changing your search or loosening your filters."}
            </p>
            {activeChips.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="mt-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:shadow-lg hover:shadow-indigo-500/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* results */}
        {showResults && (
          <>
            <div
              className={
                view === "grid"
                  ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col gap-4"
              }
            >
              {visible.map((gear) => (
                <GearCard
                  key={gear.id}
                  gear={gear}
                  view={view}
                  categoryName={getCategoryName(gear)}
                  saved={saved.includes(gear.id)}
                  onToggleSaved={() => toggleSaved(gear.id)}
                />
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center gap-3">
              <p className="text-sm text-slate-500">
                Showing {visible.length} of {filtered.length}
              </p>
              {remaining > 0 && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Show {Math.min(PAGE_SIZE, remaining)} more
                </button>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Gear card
───────────────────────────────────────────────────────────────────── */

function GearCard({
  gear,
  view,
  categoryName,
  saved,
  onToggleSaved,
}: {
  gear: GearItem;
  view: ViewMode;
  categoryName: string;
  saved: boolean;
  onToggleSaved: () => void;
}) {
  const tone = toneFor(gearCategoryId(gear) || categoryName);
  const available = isAvailable(gear);
  const condition = gear.condition ? CONDITION_META[gear.condition] : undefined;
  const lowStock =
    typeof gear.stock === "number" && gear.stock > 0 && gear.stock <= 3;
  const isList = view === "list";

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 ${
        isList ? "flex flex-col sm:flex-row" : "flex flex-col"
      }`}
    >
      {/* stretched link (the save button sits above it) */}
      <Link
        href={`/gear/${gear.id}`}
        aria-label={`View ${gear.title}`}
        className="absolute inset-0 z-10 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      />

      {/* image */}
      <div
        className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${tone.art} ${
          isList ? "sm:aspect-auto sm:w-72 sm:shrink-0" : ""
        }`}
      >
        <GearImage
          key={gear.image ?? ""}
          src={gear.image}
          alt={gear.title || "Gear"}
          iconClass={tone.icon}
          dim={!available}
        />

        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 ring-inset backdrop-blur ${tone.badge}`}
        >
          {categoryName}
        </span>

        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {!available && (
            <span className="rounded-full bg-slate-900/85 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
              Unavailable
            </span>
          )}
          {available && lowStock && (
            <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              Only {gear.stock} left
            </span>
          )}
        </div>
      </div>

      {/* save */}
      <button
        type="button"
        onClick={onToggleSaved}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${gear.title} from saved` : `Save ${gear.title}`}
        className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
      >
        <Heart
          className={`h-[18px] w-[18px] transition ${
            saved ? "fill-rose-500 text-rose-500" : "text-slate-500"
          }`}
        />
      </button>

      {/* content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {gear.brand && (
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {gear.brand}
            </span>
          )}
          {condition && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${condition.badge}`}
            >
              {condition.label}
            </span>
          )}
        </div>

        <h3 className="mt-1.5 line-clamp-1 text-lg font-semibold text-slate-900">
          {gear.title}
        </h3>

        {gear.description && (
          <p
            className={`mt-2 text-sm leading-6 text-slate-500 ${
              isList ? "line-clamp-2 sm:line-clamp-3" : "line-clamp-2"
            }`}
          >
            {gear.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p>
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-xl font-bold text-transparent">
              {formatPrice(priceOf(gear))}
            </span>
            <span className="text-sm text-slate-400"> / day</span>
          </p>

          <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
            View
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}

/** Image with a graceful in-design fallback (no dependency on a static file). */
function GearImage({
  src,
  alt,
  iconClass,
  dim,
}: {
  src?: string | null;
  alt: string;
  iconClass: string;
  dim: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Package className={`h-12 w-12 ${iconClass}`} aria-hidden="true" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
        dim ? "opacity-60 grayscale" : ""
      }`}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Small UI pieces
───────────────────────────────────────────────────────────────────── */

/** Small square thumbnail used in search suggestions. */
function SuggestionThumb({
  src,
  alt,
  artClass,
  iconClass,
}: {
  src?: string | null;
  alt: string;
  artClass: string;
  iconClass: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${artClass}`}
    >
      {!src || failed ? (
        <Package className={`h-5 w-5 ${iconClass}`} aria-hidden="true" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

/** Highlights the first occurrence of `query` inside `text`. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;

  const index = text.toLowerCase().indexOf(q.toLowerCase());
  if (index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-amber-200/70 px-0.5 text-inherit">
        {text.slice(index, index + q.length)}
      </mark>
      {text.slice(index + q.length)}
    </>
  );
}

function HeroStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number | null;
  tone: string;
}) {
  return (
    <div className="rounded-2xl bg-white/15 px-4 py-3 ring-1 ring-inset ring-white/20 backdrop-blur">
      <dt className={`flex items-center gap-1.5 text-xs font-medium ${tone}`}>
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-bold text-white">
        {value === null ? (
          <span className="inline-block h-7 w-10 animate-pulse rounded bg-white/25" />
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function CategoryPill({
  label,
  count,
  active,
  activeClass,
  dotClass,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  activeClass: string;
  dotClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 ${
        active
          ? `bg-gradient-to-r text-white shadow-lg ${activeClass}`
          : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {!active && <span className={`h-2 w-2 rounded-full ${dotClass}`} />}
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-xs ${
          active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function ViewButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`rounded-lg p-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
        active
          ? "bg-white text-indigo-600 shadow-sm"
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      {children}
    </div>
  );
}

function PriceInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"
      >
        $
      </span>
      <input
        type="number"
        inputMode="decimal"
        min="0"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onWheel={(e) => e.currentTarget.blur()}
        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-7 pr-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      />
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex items-center gap-3 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-gradient-to-r from-indigo-600 to-violet-600"
            : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </button>
  );
}
