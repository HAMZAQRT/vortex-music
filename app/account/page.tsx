import Link from "next/link";
import Image from "next/image";
import {
  redirect,
} from "next/navigation";

import {
  auth,
} from "../../auth";

import SignOutButton from "../../components/auth/SignOutButton";

export const instant = false;

export default async function AccountPage() {
  const session =
    await auth();

  if (!session?.user) {
    redirect(
      "/login",
    );
  }

  const {
    user,
  } = session;

  return (
    <main className="min-h-screen bg-[#070709] px-5 pb-12 text-white">

      <div className="mx-auto max-w-xl">

        <header className="flex items-center justify-between py-6">

          <Link
            href="/"
            className="text-sm font-bold text-white/40"
          >
            ‹ Home
          </Link>

          <Link
            href="/debug"
            className="rounded-full border border-white/10 px-3 py-2 font-mono text-[10px] text-white/40"
          >
            DEBUG
          </Link>

        </header>

        <section className="mt-6 text-center">

          <div className="mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-violet-500 to-blue-700">

            {user.image ? (
              <Image
                src={user.image}
                alt="Profile"
                width={112}
                height={112}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl font-black">
                V
              </span>
            )}

          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-violet-400">
            Vortex Account
          </p>

          <h1 className="mt-2 text-3xl font-black">
            {user.name ||
              "Vortex User"}
          </h1>

          {user.email && (
            <p className="mt-2 text-sm text-white/40">
              {user.email}
            </p>
          )}

        </section>

        <section className="mt-9 rounded-3xl border border-white/5 bg-white/[0.03] p-5">

          <h2 className="text-lg font-black">
            Identity
          </h2>

          <div className="mt-4 space-y-1">

            <Row
              label="User ID"
              value={user.id ?? "Unknown"}
            />

            <Row
              label="Session"
              value="Authenticated"
            />

            <Row
              label="Provider"
              value="GitHub"
            />

            <Row
              label="Role"
              value="USER"
            />

          </div>

        </section>

        <section className="mt-4 grid grid-cols-2 gap-3">

          <Link
            href="/library"
            className="rounded-3xl border border-white/5 bg-white/[0.03] p-5"
          >
            <p className="text-xs font-black uppercase tracking-widest text-pink-400">
              Library
            </p>

            <p className="mt-2 font-bold">
              Your music
            </p>
          </Link>

          <Link
            href="/debug"
            className="rounded-3xl border border-white/5 bg-white/[0.03] p-5"
          >
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400">
              Debug
            </p>

            <p className="mt-2 font-bold">
              Diagnostics
            </p>
          </Link>

        </section>

        <div className="mt-8">
          <SignOutButton />
        </div>

      </div>

    </main>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.04] py-3 last:border-0">

      <span className="text-xs text-white/35">
        {label}
      </span>

      <span className="max-w-[65%] truncate font-mono text-xs text-white/75">
        {value}
      </span>

    </div>
  );

}
