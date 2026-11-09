import Link from "next/link";

import ServerInspector from "../../../components/debug/ServerInspector";

export default function DebugServerPage() {
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

          <p className="mt-6 text-xs font-black tracking-[0.3em] text-emerald-400">
            VORTEX SERVER
          </p>

          <h1 className="mt-1 text-3xl font-black">
            Server Inspector
          </h1>

          <p className="mt-2 text-sm text-white/35">
            Runtime health and server diagnostics.
          </p>

        </header>

        <ServerInspector />

      </div>

    </main>
  );
}
