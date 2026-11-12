"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      "[VORTEX:UI]",
      error,
    );
  }, [error]);

  return (
    <section className="grid min-h-[60vh] place-items-center py-16">
      <div className="max-w-md text-center">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-red-400">
          VORTEX ERROR
        </p>

        <h1 className="mt-3 text-3xl font-black">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/40">
          Vortex hit an unexpected runtime error.
        </p>

        {error.digest && (
          <p className="mt-3 font-mono text-[10px] text-white/20">
            {error.digest}
          </p>
        )}

        <button
          type="button"
          onClick={reset}
          className="mt-7 rounded-full bg-white px-6 py-3 text-sm font-black text-black"
        >
          Try Again
        </button>
      </div>
    </section>
  );
}
