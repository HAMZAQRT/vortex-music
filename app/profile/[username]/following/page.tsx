import Link from "next/link";
import {
  notFound,
} from "next/navigation";

import {
  prisma,
} from "../../../../lib/db/prisma";

import UserList from "../../../../components/social/UserList";

export default async function FollowingPage({
  params,
}: {
  params: Promise<{
    username: string;
  }>;
}) {
  const {
    username,
  } = await params;

  const user =
    await prisma.user.findUnique({
      where: {
        username:
          username
            .toLowerCase(),
      },

      select: {
        id: true,
        username: true,
      },
    });

  if (
    !user ||
    !user.username
  ) {
    notFound();
  }

  const relationships =
    await prisma.userFollow.findMany({
      where: {
        followerId:
          user.id,
      },

      orderBy: {
        createdAt:
          "desc",
      },

      select: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            bio: true,
            role: true,
          },
        },
      },
    });

  return (
    <>
      <header className="py-6">
        <Link
          href={`/profile/${user.username}`}
          className="text-sm font-bold text-white/40"
        >
          ‹ @{user.username}
        </Link>

        <h1 className="mt-5 text-3xl font-black">
          Following
        </h1>

        <p className="mt-2 text-sm text-white/35">
          {relationships.length} people
        </p>
      </header>

      <UserList
        users={
          relationships.map(
            (item) =>
              item.following,
          )
        }
      />
    </>
  );
}
