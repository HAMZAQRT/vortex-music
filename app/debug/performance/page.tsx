import Link from "next/link";

import PerformanceInspector from "../../../components/debug/PerformanceInspector";

export default function DebugPerformancePage() {
  return (
    <main className="min-h-screen bg-[#070709] px-4 pb-12 text-white">
      <div className="mx-auto max-w-4xl">

        <header className="py-6">
          <Link
            href="/debug"
            className="text-sm font-bold text-white/40"
          >
            ‹ Debug Console
          </Link>

          <p className="mt-6 text-xs font-black tracking-[0.3em] text-cyan-400">
            VORTEX PERFORMANCE
          </p>

          <h1 className="mt-1 text-3xl font-black">
            Runtime Inspector
          </h1>

          <p className="mt-2 text-sm text-white/35">
            Browser performance and runtime diagnostics.
          </p>
        </header>

        <PerformanceInspector />
      </div>
    </main>
  );
}
