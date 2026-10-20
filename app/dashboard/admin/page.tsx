"use client";

import type { ComponentType, ReactNode } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  Flag,
  Package,
  ShieldCheck,
  ShoppingCart,
  Users,
  UserCog,
} from "lucide-react";

import { useAuth } from "@/components/provider/AuthProvider";

/* ─────────────────────────────────────────────────────────────────────
   Types & data
───────────────────────────────────────────────────────────────────── */

type Tone = "indigo" | "sky" | "violet" | "emerald";

interface Stat {
  title: string;
  value: string;
  caption: string;
  icon: ComponentType<{ size?: number }>;
  tone: Tone;
}

/* Tailwind needs full class names at build time, so tones live in a map. */
const tones: Record<Tone, { chip: string; bar: string; glow: string }> = {
  indigo: {
    chip: "bg-indigo-100 text-indigo-600",
    bar: "from-indigo-500 to-indigo-400",
    glow: "group-hover:shadow-indigo-500/10",
  },
  sky: {
    chip: "bg-sky-100 text-sky-600",
    bar: "from-sky-500 to-cyan-400",
    glow: "group-hover:shadow-sky-500/10",
  },
  violet: {
    chip: "bg-violet-100 text-violet-600",
    bar: "from-violet-500 to-fuchsia-400",
    glow: "group-hover:shadow-violet-500/10",
  },
  emerald: {
    chip: "bg-emerald-100 text-emerald-600",
    bar: "from-emerald-500 to-teal-400",
    glow: "group-hover:shadow-emerald-500/10",
  },
};

const stats: Stat[] = [
  {
    title: "Total users",
    value: "0",
    caption: "Registered accounts",
    icon: Users,
    tone: "indigo",
  },
  {
    title: "Active gear",
    value: "0",
    caption: "Listings available to rent",
    icon: Package,
    tone: "sky",
  },
  {
    title: "Total rentals",
    value: "0",
    caption: "Completed and ongoing",
    icon: ShoppingCart,
    tone: "violet",
  },
  {
    title: "Platform status",
    value: "Healthy",
    caption: "All systems operational",
    icon: Activity,
    tone: "emerald",
  },
];

const upcomingTools = [
  {
    title: "User management",
    description: "Review accounts, roles, and access.",
    icon: UserCog,
    tone: "indigo" as Tone,
  },
  {
    title: "Listing moderation",
    description: "Approve, flag, or remove gear listings.",
    icon: Flag,
    tone: "sky" as Tone,
  },
  {
    title: "Platform reports",
    description: "Track rentals, growth, and activity trends.",
    icon: BarChart3,
    tone: "violet" as Tone,
  },
];

/* ─────────────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────────────── */

export default function AdminDashboard() {
  const { user } = useAuth();

  const firstName = user?.name?.trim().split(/\s+/)[0];
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

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

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100 ring-1 ring-inset ring-white/15">
              <ShieldCheck size={13} className="text-emerald-300" />
              Admin console
            </p>

            <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-4xl">
              Admin dashboard
            </h1>

            <p className="mt-3 text-sm leading-6 text-indigo-100/80 md:text-base">
              {firstName ? `Welcome back, ${firstName}. ` : "Welcome back. "}
              Monitor and manage the GearUp platform.
            </p>
          </div>

          <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-2xl bg-white/10 px-4 py-2.5 text-sm text-indigo-50 ring-1 ring-inset ring-white/15 backdrop-blur md:self-auto">
            <CalendarDays size={15} className="text-sky-300" />
            {today}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <section
        aria-label="Platform statistics"
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          const t = tones[stat.tone];
          const isStatus = stat.title === "Platform status";

          return (
            <div
              key={stat.title}
              className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-xl ${t.glow}`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${t.bar}`}
              />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
                    {isStatus && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      </span>
                    )}
                    {stat.value}
                  </p>

                  <p className="mt-1.5 text-xs text-slate-400">
                    {stat.caption}
                  </p>
                </div>

                <div className={`rounded-xl p-3 ${t.chip}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Platform overview ──────────────────────────────── */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Platform overview
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Real-time statistics and moderation tools will appear here.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            In development
          </span>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {upcomingTools.map((tool) => (
            <ToolCard key={tool.title} {...tool} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Sub-components (file-local)
───────────────────────────────────────────────────────────────────── */

function ToolCard({
  title,
  description,
  icon: Icon,
  tone,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ size?: number }>;
  tone: Tone;
}): ReactNode {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone].chip}`}
      >
        <Icon size={20} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      <p className="mt-3 text-xs font-medium text-slate-400">Coming soon</p>
    </div>
  );
}
