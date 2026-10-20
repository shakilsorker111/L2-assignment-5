"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ClipboardList,
  User,
  X,
} from "lucide-react";

interface ProviderSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const navigation = [
  {
    label: "Overview",
    href: "/dashboard/provider",
    icon: LayoutDashboard,
  },
  {
    label: "My Gear",
    href: "/dashboard/provider/gear",
    icon: Package,
  },
  {
    label: "Add Gear",
    href: "/dashboard/provider/gear/add",
    icon: PlusCircle,
  },
  {
    label: "Rental Orders",
    href: "/dashboard/provider/orders",
    icon: ClipboardList,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
];

export default function ProviderSidebar({
  mobileOpen = false,
  onClose,
}: ProviderSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-72 border-r border-gray-200
          bg-white
          transition-transform duration-300
          lg:static lg:z-auto lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between border-b px-6">
            <Link
              href="/"
              className="text-2xl font-bold text-gray-900"
              onClick={onClose}
            >
              Gear<span className="text-blue-600">Up</span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3
                    rounded-xl px-4 py-3
                    text-sm font-medium
                    transition
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon size={19} />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="border-t p-4">
            <Link
              href="/"
              className="block rounded-xl bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Back to Website
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}