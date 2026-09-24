import Link from "next/link";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* <Navbar /> */}

      <main>
        <section className="bg-gray-100">
          <div className="mx-auto max-w-7xl px-4 py-24">
            <div className="max-w-2xl">
              <p className="mb-4 font-semibold uppercase tracking-wider">
                GearUp
              </p>

              <h1 className="text-5xl font-bold tracking-tight">
                Rent Sports & Outdoor Gear Instantly
              </h1>

              <p className="mt-6 text-lg text-gray-600">
                Find the perfect equipment for your next
                adventure. Rent quality sports and outdoor
                gear from trusted providers.
              </p>

              <div className="mt-8 flex gap-4">
                <Link
                  href="/gear"
                  className="rounded-lg bg-black px-6 py-3 font-medium text-white"
                >
                  Explore Gear
                </Link>

                <Link
                  href="/auth/register"
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* <Footer /> */}
    </div>
  );
}