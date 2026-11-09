import Link from "next/link";
import {
  redirect,
} from "next/navigation";
import {
  connection,
} from "next/server";

import {
  auth,
} from "../../../../auth";

import {
  prisma,
} from "../../../../lib/db/prisma";

export const instant = false;

export default async function DatabaseAuthInspectorPage() {
  await connection();

  const session =
    await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user =
    await prisma.user.findUnique({
      where: {
        email:
          session.user.email,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,

        accounts: {
          select: {
            provider: true,
            providerAccountId:
              true,
          },
        },

        _count: {
          select: {
            playlists: true,
            likes: true,
            follows: true,
            history: true,
          },
        },
      },
    });

  return (
    <main className="min-h-screen bg-[#070709] px-4 pb-12 text-white">
      <div className="mx-auto max-w-5xl">

        <header className="py-6">
          <Link
            href="/debug/auth"
            className="text-sm font-bold text-white/40"
          >
            ‹ Auth Inspector
          </Link>

          <p className="mt-6 text-xs font-black tracking-[0.3em] text-emerald-400">
            VORTEX DATABASE AUTH
          </p>

          <h1 className="mt-1 text-3xl font-black">
            Database Identity
          </h1>

          <p className="mt-2 text-sm text-white/35">
            Safe PostgreSQL identity diagnostics.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric
            label="Database"
            value={
              user
                ? "FOUND"
                : "NOT FOUND"
            }
            color={
              user
                ? "text-emerald-400"
                : "text-red-400"
            }
          />

          <Metric
            label="Role"
            value={
              user?.role ??
              "UNKNOWN"
            }
            color="text-violet-400"
          />

          <Metric
            label="Provider"
            value={
              user?.accounts[0]
                ?.provider ??
              "NONE"
            }
            color="text-cyan-400"
          />

          <Metric
            label="Accounts"
            value={String(
              user?.accounts.length ??
                0,
            )}
            color="text-pink-400"
          />
        </section>

        <section className="mt-4 rounded-3xl border border-white/5 bg-[#111116] p-4">
          <h2 className="mb-3 text-sm font-black uppercase tracking-wider text-emerald-400">
            Database User
          </h2>

          <Row
            label="Exists"
            value={
              user
                ? "Yes"
                : "No"
            }
          />

          <Row
            label="User ID"
            value={
              user?.id ??
              "Unavailable"
            }
          />

          <Row
            label="Email"
            value={
              user?.email ??
              session.user.email
            }
          />

          <Row
            label="Role"
            value={
              user?.role ??
              "Unavailable"
            }
          />

          <Row
            label="Created"
            value={
              user
                ? user.createdAt
                    .toISOString()
                : "Unavailable"
            }
          />
        </section>

        <section className="mt-4 rounded-3xl border border-white/5 bg-[#111116] p-4">
          <h2 className="mb-3 text-sm font-black uppercase tracking-wider text-violet-400">
            Library Persistence
          </h2>

          <Row
            label="Playlists"
            value={String(
              user?._count
                .playlists ??
                0,
            )}
          />

          <Row
            label="Likes"
            value={String(
              user?._count.likes ??
                0,
            )}
          />

          <Row
            label="Following"
            value={String(
              user?._count
                .follows ??
                0,
            )}
          />

          <Row
            label="History"
            value={String(
              user?._count
                .history ??
                0,
            )}
          />
        </section>

        <section className="mt-4 rounded-3xl border border-amber-500/10 bg-amber-500/5 p-4">
          <p className="text-xs font-bold leading-5 text-amber-300/70">
            OAuth access tokens, refresh tokens,
            database passwords and Auth secrets are
            intentionally excluded from this inspector.
          </p>
        </section>

      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-3xl border border-white/5 bg-[#111116] p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
        {label}
      </p>

      <p
        className={`mt-2 truncate font-mono text-sm font-black ${color}`}
      >
        {value}
      </p>
    </div>
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

      <span className="max-w-[65%] truncate text-right font-mono text-xs text-white/75">
        {value}
      </span>
    </div>
  );
}
