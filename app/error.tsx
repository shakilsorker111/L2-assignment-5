"use client";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-3xl font-bold">
          Something went wrong!
        </h1>

        <p className="mb-6 text-gray-600">
          {error.message || "An unexpected error occurred."}
        </p>

        <button
          onClick={reset}
          className="rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}