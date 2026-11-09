import Link from "next/link";
import {
  connection,
} from "next/server";

import {
  auth,
} from "../../../auth";

import AuthInspector from "../../../components/debug/AuthInspector";

export const instant = false;

export default async function DebugAuthPage() {
  await connection();

  const session =
    await auth();

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

          <p className="mt-6 text-xs font-black tracking-[0.3em] text-violet-400">
            VORTEX AUTH
          </p>

          <h1 className="mt-1 text-3xl font-black">
            Auth Inspector
          </h1>

          <p className="mt-2 text-sm text-white/35">
            Authentication, session and RBAC diagnostics.
          </p>

        </header>

        <AuthInspector
          session={session}
        />

      </div>

    </main>
  );
}
