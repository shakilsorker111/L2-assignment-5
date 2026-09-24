"use client";

interface GearPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function GearPagination({
  page,
  totalPages,
  onPageChange,
}: GearPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <div className="mt-10 flex flex-wrap justify-center gap-2">
      <button
        type="button"
        disabled={page === 1}
        onClick={() =>
          onPageChange(page - 1)
        }
        className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      {pages.map((pageNumber) => (
        <button
          type="button"
          key={pageNumber}
          onClick={() =>
            onPageChange(pageNumber)
          }
          className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-medium ${
            pageNumber === page
              ? "border-orange-500 bg-orange-500 text-white"
              : "hover:bg-gray-50"
          }`}
        >
          {pageNumber}
        </button>
      ))}

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() =>
          onPageChange(page + 1)
        }
        className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}