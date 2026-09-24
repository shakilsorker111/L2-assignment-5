"use client";

import {
  useState,
} from "react";

import ProviderSidebar from "@/components/dashboard/provider/ProviderSidebar";

import ProviderDashboardHeader from "@/components/dashboard/provider/ProviderDashboardHeader";

export default function ProviderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <ProviderSidebar
          mobileOpen={mobileOpen}
          onClose={() =>
            setMobileOpen(false)
          }
        />

        <div className="min-w-0 flex-1">
          <ProviderDashboardHeader
            onMenuClick={() =>
              setMobileOpen(true)
            }
          />

          <main className="p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}