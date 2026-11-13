import {
  connection,
} from "next/server";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  auth,
} from "../../../auth";

import {
  prisma,
} from "../../../lib/db/prisma";

import FollowButton from "../../../components/social/FollowButton";
import ShareProfileButton from "../../../components/social/ShareProfileButton";

export const instant = false;

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{
    username: string;
  }>;
}) {
  await connection();

  const {
    username,
  } = await params;

  const cleanUsername =
    username
      .trim()
      .toLowerCase();

  const session =
    await auth();

  const user =
    await prisma.user.findUnique({
      where: {
        username:
          cleanUsername,
      },

      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        role: true,

        _count: {
          select: {
            followers: true,
            following: true,

            playlists: {
              where: {
                public: true,
              },
            },
          },
        },

        playlists: {
          where: {
            public: true,
          },

          orderBy: {
            updatedAt:
              "desc",
          },

          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

  if (
    !user ||
    !user.username
  ) {
    notFound();
  }

  const isOwner =
    session?.user?.id ===
    user.id;

  const relationship =
    session?.user?.id &&
    !isOwner
      ? await prisma.userFollow.findUnique({
          where: {
            followerId_followingId: {
              followerId:
                session.user.id,
              followingId:
                user.id,
            },
          },

          select: {
            createdAt: true,
          },
        })
      : null;

  return (
    <>
      <header className="flex items-center justify-between py-6">
        <Link
          href="/people"
          className="text-sm font-bold text-white/40"
        >
          ‹ People
        </Link>

        <ShareProfileButton
          username={
            user.username
          }
        />
      </header>

      <section className="mx-auto max-w-xl text-center">

        <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-violet-500 via-purple-600 to-blue-600 text-4xl font-black">
          {user.name
            ?.slice(
              0,
              1,
            )
            .toUpperCase() ??
            "V"}
        </div>

        <h1 className="mt-5 text-3xl font-black">
          {user.name ??
            "Vortex User"}
        </h1>

        <p className="mt-2 text-violet-300">
          @{user.username}
        </p>

        {user.bio && (
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/45">
            {user.bio}
          </p>
        )}

        <div className="mt-7 grid grid-cols-3 gap-3">

          <Link
            href={`/profile/${user.username}/followers`}
            className="rounded-3xl bg-white/[0.03] p-4"
          >
            <p className="text-xl font-black">
              {
                user._count
                  .followers
              }
            </p>

            <p className="mt-1 text-xs text-white/30">
              Followers
            </p>
          </Link>

          <Link
            href={`/profile/${user.username}/following`}
            className="rounded-3xl bg-white/[0.03] p-4"
          >
            <p className="text-xl font-black">
              {
                user._count
                  .following
              }
            </p>

            <p className="mt-1 text-xs text-white/30">
              Following
            </p>
          </Link>

          <div className="rounded-3xl bg-white/[0.03] p-4">
            <p className="text-xl font-black">
              {
                user._count
                  .playlists
              }
            </p>

            <p className="mt-1 text-xs text-white/30">
              Playlists
            </p>
          </div>

        </div>

        <div className="mt-6 flex justify-center gap-2">

          {isOwner ? (
            <Link
              href="/profile"
              className="rounded-full bg-white px-6 py-3 text-sm font-black text-black"
            >
              Edit Profile
            </Link>
          ) : session?.user ? (
            <FollowButton
              username={
                user.username
              }
              initialFollowing={
                Boolean(
                  relationship,
                )
              }
            />
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-white px-6 py-3 text-sm font-black text-black"
            >
              Sign in to Follow
            </Link>
          )}

        </div>

      </section>

      <section className="mx-auto mt-12 max-w-xl">

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">
            Public Playlists
          </h2>

          <span className="text-xs text-white/30">
            {
              user.playlists
                .length
            }
          </span>
        </div>

        {user.playlists.length ===
        0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-white/10 p-7 text-center text-sm text-white/30">
            No public playlists yet.
          </div>
        ) : (
          <div className="mt-4 space-y-3">

            {user.playlists.map(
              (
                playlist,
              ) => (
                <Link
                  key={
                    playlist.id
                  }
                  href={`/p/${playlist.id}`}
                  className="block rounded-3xl border border-white/5 bg-white/[0.03] p-5"
                >
                  <p className="font-black">
                    {
                      playlist.title
                    }
                  </p>

                  <p className="mt-2 text-sm text-white/35">
                    {
                      playlist.description ||
                      "Vortex public playlist"
                    }
                  </p>
                </Link>
              ),
            )}

          </div>
        )}

      </section>
    </>
  );
}
