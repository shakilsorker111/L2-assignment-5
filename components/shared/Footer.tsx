export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center">
        <p className="font-semibold">
          GearUp
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Rent Sports & Outdoor Gear Instantly
        </p>

        <p className="mt-4 text-sm text-gray-400">
          © {new Date().getFullYear()} GearUp. All rights reserved.
        </p>
      </div>
    </footer>
  );
}