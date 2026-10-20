"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  CheckCircle2,
  CircleUserRound,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/provider/AuthProvider";
import api from "@/lib/axios";

/* ─────────────────────────────────────────────────────────────────────
   Types & helpers
───────────────────────────────────────────────────────────────────── */

interface ProfileUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  avatar?: string | null;
  phone?: string | null;
  address?: string | null;
}

interface ProfileForm {
  name: string;
  phone: string;
  address: string;
  avatar: string;
}

const emptyForm: ProfileForm = {
  name: "",
  phone: "",
  address: "",
  avatar: "",
};

type Tint = "indigo" | "sky" | "emerald" | "amber" | "rose" | "violet";

/* Tailwind needs full class names at build time, so tints live in a map. */
const tints: Record<Tint, { chip: string; ring: string; text: string }> = {
  indigo: {
    chip: "bg-indigo-100 text-indigo-600",
    ring: "focus-within:ring-indigo-100 focus-within:border-indigo-400",
    text: "text-indigo-700",
  },
  sky: {
    chip: "bg-sky-100 text-sky-600",
    ring: "focus-within:ring-sky-100 focus-within:border-sky-400",
    text: "text-sky-700",
  },
  emerald: {
    chip: "bg-emerald-100 text-emerald-600",
    ring: "focus-within:ring-emerald-100 focus-within:border-emerald-400",
    text: "text-emerald-700",
  },
  amber: {
    chip: "bg-amber-100 text-amber-600",
    ring: "focus-within:ring-amber-100 focus-within:border-amber-400",
    text: "text-amber-700",
  },
  rose: {
    chip: "bg-rose-100 text-rose-600",
    ring: "focus-within:ring-rose-100 focus-within:border-rose-400",
    text: "text-rose-700",
  },
  violet: {
    chip: "bg-violet-100 text-violet-600",
    ring: "focus-within:ring-violet-100 focus-within:border-violet-400",
    text: "text-violet-700",
  },
};

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "GU"
  );
}

function formatRole(role?: string) {
  if (!role) return "Member";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function statusTone(status: string) {
  const s = status.toUpperCase();
  if (s === "ACTIVE") return "emerald" as const;
  if (s === "PENDING") return "amber" as const;
  return "rose" as const;
}

/* ─────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────── */

export default function DashboardProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const profileUser = user as ProfileUser | null;

  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (!profileUser) return;
    setForm({
      name: profileUser.name ?? "",
      phone: profileUser.phone ?? "",
      address: profileUser.address ?? "",
      avatar: profileUser.avatar ?? "",
    });
  }, [
    profileUser?.id,
    profileUser?.name,
    profileUser?.email,
    profileUser?.phone,
    profileUser?.address,
    profileUser?.avatar,
  ]);

  // Retry rendering the image whenever the URL changes.
  useEffect(() => {
    setImgFailed(false);
  }, [form.avatar]);

  const updateField = (field: keyof ProfileForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleCancel = () => {
    setForm({
      name: profileUser?.name ?? "",
      phone: profileUser?.phone ?? "",
      address: profileUser?.address ?? "",
      avatar: profileUser?.avatar ?? "",
    });
    setEditing(false);
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Full name is required.");
      return;
    }

    if (form.avatar.trim()) {
      try {
        const url = new URL(form.avatar.trim());
        if (url.protocol !== "https:" && url.protocol !== "http:")
          throw new Error();
      } catch {
        toast.error("Please enter a valid image URL.");
        return;
      }
    }

    try {
      setSaving(true);
      await api.patch("/users/profile", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        avatar: form.avatar.trim() || null,
      });
      await refreshUser();
      toast.success("Profile saved.");
      setEditing(false);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message ?? "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  /* ── loading ─────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
          <Loader2 className="animate-spin text-white" size={24} />
        </div>
      </div>
    );
  }

  /* ── unauthenticated ─────────────────────────────────────────────── */
  if (!profileUser) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100">
          <CircleUserRound size={32} className="text-indigo-500" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Profile unavailable
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to view your profile.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:shadow-lg hover:shadow-indigo-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const accountStatus = profileUser.status ?? "ACTIVE";
  const roleSlug = (profileUser.role ?? "customer").toLowerCase();
  const statusColor = statusTone(accountStatus);

  /* Profile completeness is based on saved data, not unsaved edits. */
  const completionItems = [
    { label: "Full name", done: !!profileUser.name?.trim() },
    { label: "Phone number", done: !!profileUser.phone?.trim() },
    { label: "Address", done: !!profileUser.address?.trim() },
    { label: "Profile photo", done: !!profileUser.avatar?.trim() },
  ];
  const doneCount = completionItems.filter((i) => i.done).length;
  const completion = Math.round((doneCount / completionItems.length) * 100);

  const showAvatarImage = !!form.avatar && !imgFailed;

  /* ── main ────────────────────────────────────────────────────────── */
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-14">
      {/* ── breadcrumb + title ─────────────────────────────────── */}
      <header>
        <Link
          href={`/dashboard/${roleSlug}`}
          className="group inline-flex items-center gap-1.5 rounded-lg text-xs font-medium text-slate-500 transition hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <ArrowLeft
            size={14}
            className="transition group-hover:-translate-x-0.5"
          />
          Back to dashboard
        </Link>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          My profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal information and account settings.
        </p>
      </header>

      {/* ── hero ──────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5">
        {/* cover */}
        <div className="relative h-36 overflow-hidden bg-gradient-to-r from-indigo-700 via-violet-600 to-fuchsia-500 md:h-44">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 30%, rgba(56,189,248,0.55) 0%, transparent 45%), radial-gradient(circle at 85% 10%, rgba(251,191,36,0.40) 0%, transparent 40%), radial-gradient(circle at 70% 100%, rgba(244,63,94,0.45) 0%, transparent 50%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="absolute right-6 top-5 hidden items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur sm:flex">
            <Sparkles size={13} />
            GearUp account
          </div>
        </div>

        {/* identity row */}
        <div className="px-6 pb-7 md:px-10">
          <div className="-mt-16 flex flex-col gap-6 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end">
              {/* avatar with gradient ring */}
              <div className="relative shrink-0 self-start rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 p-[3px] shadow-xl shadow-indigo-500/25">
                <div className="h-28 w-28 overflow-hidden rounded-[22px] border-4 border-white bg-white sm:h-32 sm:w-32">
                  {showAvatarImage ? (
                    <img
                      src={form.avatar}
                      alt={profileUser.name ?? "Avatar"}
                      className="h-full w-full object-cover"
                      onError={() => setImgFailed(true)}
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 via-violet-100 to-fuchsia-100 text-3xl font-bold text-indigo-700">
                      {getInitials(form.name || profileUser.name || "")}
                    </span>
                  )}
                </div>
                {editing && (
                  <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-rose-500 text-white shadow-md">
                    <Camera size={14} />
                  </span>
                )}
              </div>

              {/* name block */}
              <div className="min-w-0 sm:pb-1">
                <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  {profileUser.name || "GearUp Member"}
                </h2>
                <p className="mt-0.5 break-all text-sm text-slate-500">
                  {profileUser.email}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill color="indigo">
                    <ShieldCheck size={12} />
                    {formatRole(profileUser.role)}
                  </Pill>
                  <Pill color={statusColor}>
                    <CheckCircle2 size={12} />
                    {formatRole(accountStatus)}
                  </Pill>
                  {completion === 100 && (
                    <Pill color="amber">
                      <BadgeCheck size={12} />
                      Profile complete
                    </Pill>
                  )}
                </div>
              </div>
            </div>

            {/* edit toggle */}
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:shadow-lg hover:shadow-indigo-500/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
              >
                <Pencil size={15} />
                Edit profile
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── body grid ─────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── personal info form ────────────────────────────── */}
        <section
          className={`rounded-3xl border bg-white p-6 shadow-xl shadow-slate-900/5 transition md:p-8 ${
            editing
              ? "border-indigo-300 ring-4 ring-indigo-100"
              : "border-slate-200/80"
          }`}
        >
          <SectionHeader
            title="Personal information"
            subtitle={
              editing
                ? "You’re editing. Save when you’re done."
                : "Your name, contact details, and photo."
            }
            icon={<UserRound size={18} />}
            tint="indigo"
          />

          <form onSubmit={handleSave} className="mt-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* name */}
              <Field
                label="Full name"
                htmlFor="profileName"
                tint="indigo"
                icon={<UserRound size={16} />}
                disabled={!editing || saving}
              >
                <input
                  id="profileName"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  disabled={!editing || saving}
                  placeholder="Your full name"
                  required
                  className={inputCls}
                />
              </Field>

              {/* phone */}
              <Field
                label="Phone number"
                htmlFor="profilePhone"
                tint="emerald"
                icon={<Phone size={16} />}
                disabled={!editing || saving}
              >
                <input
                  id="profilePhone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  disabled={!editing || saving}
                  placeholder="+880 1XXX-XXXXXX"
                  className={inputCls}
                />
              </Field>
            </div>

            {/* email (read-only) */}
            <Field
              label="Email address"
              htmlFor="profileEmail"
              hint="Email can’t be changed here."
              tint="sky"
              icon={<Mail size={16} />}
              disabled
              trailing={<Lock size={14} />}
            >
              <input
                id="profileEmail"
                type="email"
                value={profileUser.email ?? ""}
                disabled
                className={inputCls}
              />
            </Field>

            {/* address */}
            <Field
              label="Address"
              htmlFor="profileAddress"
              tint="amber"
              icon={<MapPin size={16} />}
              disabled={!editing || saving}
              alignTop
            >
              <textarea
                id="profileAddress"
                rows={3}
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                disabled={!editing || saving}
                placeholder="House, road, city, country"
                className={inputCls + " resize-y"}
              />
            </Field>

            {/* avatar url */}
            <Field
              label="Profile image URL"
              htmlFor="profileAvatar"
              hint="Use a public HTTPS image link."
              tint="rose"
              icon={<Camera size={16} />}
              disabled={!editing || saving}
            >
              <input
                id="profileAvatar"
                type="url"
                value={form.avatar}
                onChange={(e) => updateField("avatar", e.target.value)}
                disabled={!editing || saving}
                placeholder="https://example.com/photo.jpg"
                className={inputCls}
              />
            </Field>

            {/* action row */}
            {editing && (
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-50"
                >
                  <X size={15} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:shadow-lg hover:shadow-emerald-500/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </section>

        {/* ── sidebar ───────────────────────────────────────── */}
        <aside className="space-y-6">
          {/* completeness */}
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Profile strength
              </h2>
              <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">
                {completion}%
              </span>
            </div>

            <div
              className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Profile completion"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>

            <ul className="mt-5 space-y-2.5">
              {completionItems.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2.5 text-sm"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${
                      item.done
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-slate-300"
                    }`}
                  >
                    <CheckCircle2 size={13} />
                  </span>
                  <span
                    className={
                      item.done ? "text-slate-700" : "text-slate-400"
                    }
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* account overview */}
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/5">
            <SectionHeader
              title="Account overview"
              subtitle=""
              icon={<ShieldCheck size={17} />}
              tint="violet"
            />

            <ul className="mt-5 space-y-4">
              <OverviewRow
                icon={<ShieldCheck size={16} />}
                tint="indigo"
                label="Role"
                value={formatRole(profileUser.role)}
              />
              <OverviewRow
                icon={<CheckCircle2 size={16} />}
                tint={statusColor === "emerald" ? "emerald" : statusColor}
                label="Status"
                value={formatRole(accountStatus)}
              />
              <OverviewRow
                icon={<Mail size={16} />}
                tint="sky"
                label="Email"
                value={profileUser.email ?? "Not available"}
              />
            </ul>
          </section>

          {/* security */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 p-6 text-white shadow-xl shadow-indigo-900/20">
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-40 blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, #a78bfa 0%, transparent 70%)",
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                  <KeyRound size={16} className="text-amber-300" />
                </div>
                <h3 className="text-sm font-semibold">Security reminder</h3>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-indigo-100">
                Keep your contact details current. Never share your password
                or one-time codes with anyone, including support staff.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-indigo-200/80">
                To change your password, use the password reset flow in your
                account settings.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Sub-components (file-local)
───────────────────────────────────────────────────────────────────── */

const inputCls =
  "w-full rounded-xl border-0 bg-transparent py-3 pl-14 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-default disabled:text-slate-600";

function SectionHeader({
  title,
  subtitle,
  icon,
  tint,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  tint: Tint;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      <div className={`rounded-xl p-2.5 ${tints[tint].chip}`}>{icon}</div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  tint,
  icon,
  disabled,
  alignTop = false,
  trailing,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  tint: Tint;
  icon: ReactNode;
  disabled?: boolean;
  alignTop?: boolean;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  const t = tints[tint];
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <div
        className={`relative rounded-xl border transition focus-within:bg-white focus-within:ring-4 ${
          disabled
            ? "border-slate-200 bg-slate-50"
            : `border-slate-200 bg-white ${t.ring}`
        }`}
      >
        <span
          className={`pointer-events-none absolute left-2.5 flex h-8 w-8 items-center justify-center rounded-lg ${t.chip} ${
            alignTop ? "top-2.5" : "top-1/2 -translate-y-1/2"
          }`}
        >
          {icon}
        </span>

        {children}

        {trailing && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-300">
            {trailing}
          </span>
        )}
      </div>

      {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Pill({
  color,
  children,
}: {
  color: "indigo" | "emerald" | "amber" | "rose";
  children: ReactNode;
}) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${colors[color]}`}
    >
      {children}
    </span>
  );
}

function OverviewRow({
  icon,
  tint,
  label,
  value,
}: {
  icon: ReactNode;
  tint: Tint;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tints[tint].chip}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-0.5 break-all text-sm font-semibold text-slate-900">
          {value}
        </p>
      </div>
    </li>
  );
}
