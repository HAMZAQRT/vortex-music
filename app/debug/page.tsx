import Link from "next/link";

import DebugDashboard from "../../components/debug/DebugDashboard";

export default function DebugPage() {
  return (
    <>
      <header className="py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-[0.35em] text-emerald-400">
              VORTEX DIAGNOSTICS
            </p>

            <h1 className="mt-1 text-3xl font-black">
              System Console
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/35">
              Runtime, media, networking, authentication and application diagnostics.
            </p>
          </div>

          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 font-mono text-[10px] font-black text-emerald-400">
            DEV
          </span>
        </div>

        <div className="mt-5 flex gap-2">
          <Link
            href="/"
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-white/50"
          >
            Home
          </Link>

          <Link
            href="/live"
            className="rounded-full border border-red-500/15 px-4 py-2 text-xs font-bold text-red-300"
          >
            Live
          </Link>
        </div>
      </header>

      <DebugDashboard />
    </>
  );
}
