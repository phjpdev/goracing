"use client";

import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0d0d0d] text-white">
      <h2 className="font-inter text-2xl font-semibold">Something went wrong</h2>
      <p className="font-inter text-sm text-white/60">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full border border-white/20 px-6 py-2 font-inter text-sm text-white transition hover:bg-white/10"
      >
        Try again
      </button>
    </div>
  );
}
