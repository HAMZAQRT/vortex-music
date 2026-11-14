import {
  connection,
} from "next/server";

import Image from "next/image";
import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  auth,
} from "../../auth";

import {
  prisma,
} from "../../lib/db/prisma";

import ProfileEditor from "../../components/auth/ProfileEditor";
import AvatarUpload from "../../components/auth/AvatarUpload";

export const instant = false;

export default async function ProfilePage() {
  await connection();

  const session =
    await auth();

  if (!session?.user?.id) {
    redirect(
      "/login",
    );
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id:
          session.user.id,
      },

      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        bio: true,
        role: true,

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

  if (!user) {
    redirect(
      "/login",
    );
  }

  return (
    <>
      <header className="flex items-center justify-between py-6">
        <Link
          href="/"
          className="text-sm font-bold text-white/40"
        >
          ‹ Home
        </Link>

        <Link
          href="/account"
          className="text-sm font-bold text-white/40"
        >
          Account
        </Link>
      </header>

      <section className="mx-auto max-w-xl text-center">

        <div className="mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-violet-500 via-purple-600 to-blue-600">

          {user.image ? (
            <Image
              src={
                user.image
              }
              alt="Profile"
              width={112}
              height={112}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-4xl font-black">
              {
                user.name
                  ?.slice(
                    0,
                    1,
                  )
                  .toUpperCase() ??
                "V"
              }
            </span>
          )}

        </div>

        <AvatarUpload
          name={user.name ?? "Vortex User"}
          username={user.username ?? ""}
          bio={user.bio ?? ""}
        />

        <h1 className="mt-5 text-3xl font-black">
          {user.name ??
            "Vortex User"}
        </h1>

        <p className="mt-2 text-sm text-violet-300">
          {user.username
            ? `@${user.username}`
            : "Username not set"}
        </p>

        {user.bio && (
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/45">
            {user.bio}
          </p>
        )}

        <div className="mt-7 grid grid-cols-4 gap-2">
          <Metric
            value={
              user._count
                .likes
            }
            label="Likes"
          />

          <Metric
            value={
              user._count
                .follows
            }
            label="Following"
          />

          <Metric
            value={
              user._count
                .playlists
            }
            label="Playlists"
          />

          <Metric
            value={
              user._count
                .history
            }
            label="History"
          />
        </div>

        {user.username && (
          <div className="mt-6">
            <Link
              href={`/profile/${user.username}`}
              className="inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-5 py-3 text-xs font-black text-violet-300"
            >
              View Public Profile
            </Link>
          </div>
        )}

        <div className="mt-3">
          <ProfileEditor
            initial={{
              name:
                user.name ??
                "",
              username:
                user.username ??
                "",
              bio:
                user.bio ??
                "",
              image:
                user.image ??
                "",
            }}
          />
        </div>

      </section>
    </>
  );
}

function Metric({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-3">
      <p className="font-mono text-lg font-black">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-white/30">
        {label}
      </p>
    </div>
  );
}
