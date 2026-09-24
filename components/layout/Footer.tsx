import Link from "next/link";

import { Mail } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t bg-gray-950 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}

          <div className="md:col-span-2">
            <Link
              href="/"
              className="text-2xl font-black text-white"
            >
              Gear<span className="text-orange-500">
                Up
              </span>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-gray-400">
              Rent sports and outdoor equipment
              instantly. Discover quality gear,
              flexible rental dates, and an easy
              rental experience.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="rounded-full border border-gray-700 p-2 hover:bg-gray-800"
              >
                <FaFacebookF size={18} />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="rounded-full border border-gray-700 p-2 hover:bg-gray-800"
              >
                <FaInstagram size={18} />
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="rounded-full border border-gray-700 p-2 hover:bg-gray-800"
              >
                <FaTwitter size={18} />
              </a>

              <a
                href="mailto:support@gearup.com"
                aria-label="Email"
                className="rounded-full border border-gray-700 p-2 hover:bg-gray-800"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Platform */}

          <div>
            <h3 className="font-semibold text-white">
              Platform
            </h3>

            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:text-orange-500"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/gear"
                  className="hover:text-orange-500"
                >
                  Browse Gear
                </Link>
              </li>

              <li>
                <Link
                  href="/auth/register"
                  className="hover:text-orange-500"
                >
                  Become a Provider
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}

          <div>
            <h3 className="font-semibold text-white">
              Support
            </h3>

            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href="mailto:support@gearup.com"
                  className="hover:text-orange-500"
                >
                  Contact Support
                </a>
              </li>

              <li>
                <span className="text-gray-400">
                  Secure Payments
                </span>
              </li>

              <li>
                <span className="text-gray-400">
                  Safe & Reliable Rentals
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} GearUp.
          All rights reserved.
        </div>
      </div>
    </footer>
  );
}