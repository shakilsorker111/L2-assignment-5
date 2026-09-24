export default function GearSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="aspect-[4/3] animate-pulse bg-gray-200" />

      <div className="space-y-3 p-5">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />

        <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />

        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />

        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />

        <div className="flex justify-between pt-4">
          <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />

          <div className="h-9 w-20 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}