import Link from "next/link";

import NetworkInspector from "../../../components/debug/NetworkInspector";

export default function DebugNetworkPage() {
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

          <p className="mt-6 text-xs font-black tracking-[0.3em] text-cyan-400">
            VORTEX NETWORK
          </p>

          <h1 className="mt-1 text-3xl font-black">
            API Inspector
          </h1>

          <p className="mt-2 text-sm text-white/35">
            Request timing, status and response diagnostics.
          </p>

        </header>

        <NetworkInspector />

      </div>

    </main>
  );
}
