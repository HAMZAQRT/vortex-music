import Link from "next/link";
import {
  redirect,
} from "next/navigation";
import {
  connection,
} from "next/server";

import {
  auth,
} from "../../auth";

import {
  canAccessCreator,
  getSessionRole,
} from "../../lib/auth/roles";

export const instant = false;

export default async function CreatorPage() {
  await connection();

  const session =
    await auth();

  if (!session?.user) {
    redirect(
      "/login",
    );
  }

  if (
    !canAccessCreator(
      getSessionRole(
        session.user,
      ),
    )
  ) {
    redirect(
      "/account",
    );
  }

  return (
    <main className="min-h-screen bg-[#070709] px-5 text-white">

      <div className="mx-auto max-w-5xl py-8">

        <Link
          href="/"
          className="text-sm text-white/40"
        >
          ‹ Vortex
        </Link>

        <p className="mt-8 text-xs font-black tracking-[0.3em] text-fuchsia-400">
          VORTEX CREATOR
        </p>

        <h1 className="mt-2 text-4xl font-black">
          Creator Studio
        </h1>

        <p className="mt-3 text-white/40">
          Protected creator workspace.
        </p>

      </div>

    </main>
  );
}
