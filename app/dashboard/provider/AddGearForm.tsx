"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  ImageIcon,
  ImageOff,
  Info,
  Loader2,
  Package,
  RefreshCw,
  Save,
  Tag,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { getCategories } from "@/services/category.service";
import { createGear } from "@/services/gear.service";
import type { Category } from "@/types/category";

/* ─────────────────────────────────────────────────────────────────────
   Types, constants & helpers
───────────────────────────────────────────────────────────────────── */

interface FormState {
  title: string;
  brand: string;
  description: string;
  condition: string;
  pricePerDay: string;
  stock: string;
  image: string;
  categoryId: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;
type ImageStatus = "idle" | "loading" | "loaded" | "error";
type Tone = "indigo" | "emerald" | "rose";

const initialForm: FormState = {
  title: "",
  brand: "",
  description: "",
  condition: "",
  pricePerDay: "",
  stock: "",
  image: "",
  categoryId: "",
};

/** Order used for focusing the first invalid field. */
const FIELD_ORDER: (keyof FormState)[] = [
  "title",
  "brand",
  "categoryId",
  "condition",
  "description",
  "pricePerDay",
  "stock",
  "image",
];

const CONDITIONS = [
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like new" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
];

/* Tailwind needs full class names at build time, so tones live in a map. */
const tones: Record<Tone, { chip: string; badge: string }> = {
  indigo: {
    chip: "bg-indigo-100 text-indigo-600",
    badge: "from-indigo-500 to-violet-500",
  },
  emerald: {
    chip: "bg-emerald-100 text-emerald-600",
    badge: "from-emerald-500 to-teal-500",
  },
  rose: {
    chip: "bg-rose-100 text-rose-600",
    badge: "from-rose-500 to-orange-400",
  },
};

/** Only http(s) URLs are accepted (blocks javascript:, data:, ftp:, etc.). */
function parseHttpUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.title.trim()) errors.title = "Gear title is required.";
  if (!form.brand.trim()) errors.brand = "Brand is required.";
  if (!form.categoryId) errors.categoryId = "Please select a category.";
  if (!form.condition) errors.condition = "Please select the condition.";
  if (!form.description.trim())
    errors.description = "Description is required.";

  const price = Number(form.pricePerDay);
  if (
    form.pricePerDay.trim() === "" ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    errors.pricePerDay = "Enter a price greater than 0.";
  }

  const stock = Number(form.stock);
  if (form.stock.trim() === "" || !Number.isInteger(stock) || stock <= 0) {
    errors.stock = "Enter a whole number of 1 or more.";
  }

  if (!form.image.trim()) errors.image = "Image URL is required.";
  else if (!parseHttpUrl(form.image))
    errors.image = "Enter a valid http:// or https:// image URL.";

  return errors;
}

function getErrorMessage(err: unknown, fallback: string) {
  const data = (
    err as {
      response?: { data?: { message?: unknown; errorDetails?: unknown } };
    }
  )?.response?.data;

  if (typeof data?.message === "string" && data.message) return data.message;
  if (typeof data?.errorDetails === "string" && data.errorDetails)
    return data.errorDetails;
  return fallback;
}

function formatPrice(value: string) {
  const n = Number(value);
  return value.trim() !== "" && Number.isFinite(n) && n > 0
    ? `$${n.toFixed(2)}`
    : null;
}

function inputClass(hasError: boolean, extra = "") {
  return [
    "w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition",
    "placeholder:text-slate-400 focus:ring-4",
    "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
    hasError
      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
      : "border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:ring-indigo-100",
    extra,
  ].join(" ");
}

/* ─────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────── */

export default function AddGearForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesFailed, setCategoriesFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageStatus, setImageStatus] = useState<ImageStatus>("idle");

  const mountedRef = useRef(true);
  const skipLeaveGuard = useRef(false);

  /* ── categories ─────────────────────────────────────────────────── */
  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      setCategoriesFailed(false);

      const response = await getCategories();
      if (!mountedRef.current) return;

      setCategories(response.data ?? []);
    } catch (err: unknown) {
      console.error("Failed to load categories:", err);
      if (!mountedRef.current) return;

      setCategoriesFailed(true);
      toast.error("Failed to load categories");
    } finally {
      if (mountedRef.current) setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadCategories();
    return () => {
      mountedRef.current = false;
    };
  }, [loadCategories]);

  /* ── image preview status ───────────────────────────────────────── */
  const imageUrl = form.image.trim();
  const validImageUrl = parseHttpUrl(imageUrl) ? imageUrl : "";

  useEffect(() => {
    setImageStatus(validImageUrl ? "loading" : "idle");
  }, [validImageUrl]);

  /* ── warn before closing the tab with unsaved input ─────────────── */
  const isDirty = useMemo(
    () =>
      (Object.keys(initialForm) as (keyof FormState)[]).some(
        (key) => form[key] !== initialForm[key]
      ),
    [form]
  );

  useEffect(() => {
    if (!isDirty) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (skipLeaveGuard.current) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  /* ── handlers ───────────────────────────────────────────────────── */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const key = name as keyof FormState;

    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) =>
      previous[key] ? { ...previous, [key]: undefined } : previous
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const nextErrors = validate(form);
    setErrors(nextErrors);

    const firstInvalid = FIELD_ORDER.find((key) => nextErrors[key]);
    if (firstInvalid) {
      toast.error("Please fix the highlighted fields.");
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    try {
      setSubmitting(true);

      await createGear({
        title: form.title.trim(),
        brand: form.brand.trim(),
        description: form.description.trim(),
        condition: form.condition,
        pricePerDay: Number(form.pricePerDay),
        stock: Number(form.stock),
        image: form.image.trim(),
        categoryId: form.categoryId,
      });

      skipLeaveGuard.current = true;
      toast.success("Gear added successfully");

      // Stay in the "submitting" state until navigation completes so the
      // form can't be submitted twice.
      router.push("/dashboard/provider");
      router.refresh();
    } catch (err: unknown) {
      console.error("Create gear error:", err);
      toast.error(getErrorMessage(err, "Failed to add gear"));
      setSubmitting(false);
    }
  };

  /* ── derived values ─────────────────────────────────────────────── */
  const filledCount = (Object.keys(initialForm) as (keyof FormState)[]).filter(
    (key) => form[key].trim() !== ""
  ).length;
  const totalFields = Object.keys(initialForm).length;
  const progress = Math.round((filledCount / totalFields) * 100);

  const categoryName = categories.find(
    (item) => item.id === form.categoryId
  )?.name;
  const conditionLabel = CONDITIONS.find(
    (item) => item.value === form.condition
  )?.label;
  const priceLabel = formatPrice(form.pricePerDay);
  const errorCount = Object.values(errors).filter(Boolean).length;

  const fieldProps = (name: keyof FormState) => ({
    id: name,
    name,
    value: form[name],
    onChange: handleChange,
    disabled: submitting,
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-14">
      {/* header */}
      <header>
        <Link
          href="/dashboard/provider"
          className="group inline-flex items-center gap-1.5 rounded-lg text-xs font-medium text-slate-500 transition hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <ArrowLeft
            size={14}
            className="transition group-hover:-translate-x-0.5"
          />
          Back to dashboard
        </Link>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Add new gear
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Add sports or outdoor equipment to your rental inventory.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid gap-6 lg:grid-cols-[1fr_360px]"
      >
        {/* ── main column ─────────────────────────────────── */}
        <div className="space-y-6">
          {errorCount > 0 && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>
                {errorCount === 1
                  ? "1 field needs your attention."
                  : `${errorCount} fields need your attention.`}
              </p>
            </div>
          )}

          {/* basic information */}
          <SectionCard
            step={1}
            tone="indigo"
            icon={<Tag size={18} />}
            title="Basic information"
            subtitle="Enter the main details about your gear."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field
                  id="title"
                  label="Gear title"
                  required
                  error={errors.title}
                >
                  <input
                    {...fieldProps("title")}
                    placeholder="e.g. Professional Mountain Bike"
                    autoComplete="off"
                    className={inputClass(!!errors.title)}
                  />
                </Field>
              </div>

              <Field id="brand" label="Brand" required error={errors.brand}>
                <input
                  {...fieldProps("brand")}
                  placeholder="e.g. Trek"
                  autoComplete="off"
                  className={inputClass(!!errors.brand)}
                />
              </Field>

              <Field
                id="categoryId"
                label="Category"
                required
                error={errors.categoryId}
                hint={
                  categoriesFailed ? undefined : "Helps renters find your gear."
                }
              >
                <select
                  {...fieldProps("categoryId")}
                  disabled={submitting || loadingCategories}
                  className={inputClass(!!errors.categoryId, "appearance-auto")}
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories…"
                      : "Select category"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {categoriesFailed && (
                  <button
                    type="button"
                    onClick={loadCategories}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    <RefreshCw size={12} />
                    Couldn’t load categories. Retry
                  </button>
                )}
              </Field>

              <Field
                id="condition"
                label="Condition"
                required
                error={errors.condition}
              >
                <select
                  {...fieldProps("condition")}
                  className={inputClass(!!errors.condition, "appearance-auto")}
                >
                  <option value="">Select condition</option>
                  {CONDITIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="md:col-span-2">
                <Field
                  id="description"
                  label="Description"
                  required
                  error={errors.description}
                  hint={`${form.description.trim().length} characters`}
                >
                  <textarea
                    {...fieldProps("description")}
                    rows={6}
                    placeholder="Describe the gear: features, size, usage instructions, and anything renters should know…"
                    className={inputClass(!!errors.description, "resize-y")}
                  />
                </Field>
              </div>
            </div>
          </SectionCard>

          {/* pricing */}
          <SectionCard
            step={2}
            tone="emerald"
            icon={<Wallet size={18} />}
            title="Pricing & inventory"
            subtitle="Set your daily rate and how many units you have."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                id="pricePerDay"
                label="Price per day"
                required
                error={errors.pricePerDay}
              >
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400"
                  >
                    $
                  </span>
                  <input
                    {...fieldProps("pricePerDay")}
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    placeholder="25.00"
                    onWheel={(e) => e.currentTarget.blur()}
                    className={inputClass(!!errors.pricePerDay, "pl-8")}
                  />
                </div>
              </Field>

              <Field
                id="stock"
                label="Total stock"
                required
                error={errors.stock}
                hint="Number of units available to rent."
              >
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <Package size={16} />
                  </span>
                  <input
                    {...fieldProps("stock")}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    placeholder="10"
                    onWheel={(e) => e.currentTarget.blur()}
                    className={inputClass(!!errors.stock, "pl-10")}
                  />
                </div>
              </Field>
            </div>
          </SectionCard>

          {/* image */}
          <SectionCard
            step={3}
            tone="rose"
            icon={<ImageIcon size={18} />}
            title="Gear image"
            subtitle="Add a publicly accessible image URL."
          >
            <Field
              id="image"
              label="Image URL"
              required
              error={errors.image}
            >
              <input
                {...fieldProps("image")}
                type="url"
                inputMode="url"
                autoComplete="off"
                placeholder="https://example.com/gear-image.jpg"
                className={inputClass(!!errors.image)}
              />
            </Field>

            {validImageUrl && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <div className="relative aspect-video">
                  {imageStatus === "loading" && (
                    <div className="absolute inset-0 animate-pulse bg-slate-100" />
                  )}

                  {imageStatus !== "error" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={validImageUrl}
                      alt="Gear preview"
                      referrerPolicy="no-referrer"
                      className={`h-full w-full object-cover transition-opacity duration-300 ${
                        imageStatus === "loaded" ? "opacity-100" : "opacity-0"
                      }`}
                      onLoad={() => setImageStatus("loaded")}
                      onError={() => setImageStatus("error")}
                    />
                  )}

                  {imageStatus === "error" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-rose-50 px-6 text-center">
                      <ImageOff size={26} className="text-rose-400" />
                      <p className="text-sm font-medium text-rose-700">
                        This image couldn’t be loaded
                      </p>
                      <p className="text-xs text-rose-600">
                        Check that the URL is public and points directly to an
                        image file.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── sidebar ─────────────────────────────────────── */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
          {/* live preview + publish */}
          <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5">
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

            <div className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Listing preview</h2>
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">
                  {progress}%
                </span>
              </div>

              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Form completion"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                {filledCount} of {totalFields} fields completed
              </p>

              {/* mini card */}
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-indigo-50">
                  {validImageUrl && imageStatus === "loaded" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={validImageUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-indigo-200">
                      <ImageIcon size={36} />
                    </div>
                  )}

                  {conditionLabel && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                      {conditionLabel}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 p-4">
                  {categoryName && (
                    <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                      {categoryName}
                    </span>
                  )}

                  <p className="truncate font-semibold text-slate-900">
                    {form.title.trim() || "Untitled gear"}
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    {form.brand.trim() || "Brand"}
                  </p>

                  <div className="flex items-end justify-between pt-1">
                    <p className="text-lg font-bold text-slate-900">
                      {priceLabel ?? "—"}
                      {priceLabel && (
                        <span className="text-xs font-medium text-slate-400">
                          {" "}
                          / day
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {form.stock.trim() && Number(form.stock) > 0
                        ? `${Number(form.stock)} in stock`
                        : "Stock not set"}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:shadow-lg hover:shadow-emerald-500/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Adding gear…
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Add gear
                  </>
                )}
              </button>

              <Link
                href="/dashboard/provider"
                aria-disabled={submitting}
                tabIndex={submitting ? -1 : undefined}
                className={`mt-3 flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 ${
                  submitting ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Cancel
              </Link>
            </div>
          </section>

          {/* tips */}
          <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50 p-5">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <Info size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-sky-900">
                  Image tips
                </p>
                <ul className="mt-2 space-y-1.5 text-xs leading-5 text-sky-800">
                  <li className="flex gap-2">
                    <CheckCircle2
                      size={14}
                      className="mt-0.5 shrink-0 text-sky-500"
                    />
                    Use a direct public link ending in .jpg, .jpeg, .png or
                    .webp.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2
                      size={14}
                      className="mt-0.5 shrink-0 text-sky-500"
                    />
                    Landscape photos on a plain background look best.
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </aside>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Sub-components (file-local)
───────────────────────────────────────────────────────────────────── */

function SectionCard({
  step,
  tone,
  icon,
  title,
  subtitle,
  children,
}: {
  step: number;
  tone: Tone;
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-8">
      <div className="mb-7 flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tones[tone].chip}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        </div>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${tones[tone].badge}`}
          aria-hidden="true"
        >
          {step}
        </span>
      </div>

      {children}
    </section>
  );
}

function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-rose-500" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600"
        >
          <AlertCircle size={13} className="shrink-0" />
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}
