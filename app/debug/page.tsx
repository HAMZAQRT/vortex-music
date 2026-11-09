import Link from "next/link";

import DebugDashboard from "../../components/debug/DebugDashboard";

export default function DebugPage() {
  return (
    <main className="min-h-screen bg-[#070709] px-4 text-white">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between border-b border-white/5 py-4">
          <Link
            href="/"
            className="text-sm font-bold text-white/40"
          >
            ‹ Vortex
          </Link>

          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 font-mono text-[10px] font-bold text-emerald-400">
            DEV CONSOLE
          </span>
        </nav>

        <DebugDashboard />
      </div>
    </main>
  );
}
