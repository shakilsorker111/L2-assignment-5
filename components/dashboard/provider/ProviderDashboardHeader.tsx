"use client";

import {
  Menu,
  Bell,
} from "lucide-react";

import { useAuth } from "@/components/provider/AuthProvider";

interface Props {
  onMenuClick: () => void;
}

export default function ProviderDashboardHeader({
  onMenuClick,
}: Props) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="flex h-20 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
            aria-label="Open dashboard menu"
          >
            <Menu size={22} />
          </button>

          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Provider Dashboard
            </h1>

            <p className="hidden text-sm text-gray-500 sm:block">
              Manage your sports and outdoor gear
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative rounded-full p-2.5 hover:bg-gray-100"
            aria-label="Notifications"
          >
            <Bell size={20} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div className="hidden items-center gap-3 border-l pl-4 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() ?? "P"}
            </div>

            <div>
              <p className="text-sm font-semibold">
                {user?.name ?? "Provider"}
              </p>

              <p className="text-xs text-gray-500">
                Provider
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}