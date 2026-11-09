"use client";

import Link from "next/link";

import EventExplorer from "../../../components/debug/EventExplorer";
import { useDebug } from "../../../context/DebugContext";

export default function DebugErrorsPage() {
  const {
    events,
    log,
  } = useDebug();

  const errors =
    events.filter(
      (event) =>
        event.type === "error",
    ).length;

  function createTestError() {
    log(
      "error",
      "Synthetic diagnostic error",
      {
        source:
          "Vortex Debug Center",
        safe: true,
      },
    );
  }

  return (
    <main className="min-h-screen bg-[#070709] px-4 pb-12 text-white">
      <div className="mx-auto max-w-5xl">

        <header className="py-6">
          <Link
            href="/debug"
            className="text-sm font-bold text-white/40"
          >
            ‹ Debug Console
          </Link>

          <p className="mt-6 text-xs font-black tracking-[0.3em] text-red-400">
            VORTEX ERROR CENTER
          </p>

          <div className="mt-2 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-black">
                Errors & Events
              </h1>

              <p className="mt-2 text-sm text-white/35">
                Inspect application diagnostics.
              </p>
            </div>

            <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-center">
              <p className="font-mono text-2xl font-black text-red-400">
                {errors}
              </p>

              <p className="text-[10px] uppercase text-red-300/50">
                errors
              </p>
            </div>
          </div>

          <button
            onClick={
              createTestError
            }
            className="mt-5 rounded-full border border-red-500/20 px-4 py-2 text-xs font-black text-red-400"
          >
            Generate safe test error
          </button>
        </header>

        <EventExplorer />
      </div>
    </main>
  );
}
