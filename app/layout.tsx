import type { Metadata } from "next";

import "./globals.css";

import QueryProvider from "@/providers/QueryProvider";

import AppToaster from "@/components/shared/Toaster";

import {
  AuthProvider,
} from "@/components/provider/AuthProvider";

import Navbar from "@/components/shared/Navbar";

import Footer from "@/components/shared/Footer";

import { Toaster } from "sonner";

export const metadata: Metadata = {
  title:
    "GearUp | Rent Sports & Outdoor Gear",

  description:
    "Rent sports and outdoor equipment instantly with GearUp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <QueryProvider>
          <AuthProvider>
            <Navbar />

            <main className="min-h-[calc(100vh-140px)]">
              {children}
            </main>

            <Footer />
          </AuthProvider>

          <AppToaster />
        </QueryProvider>

        <Toaster
          position="top-right"
          richColors
        />
      </body>
    </html>
  );
}