import {
  NextResponse,
} from "next/server";

import {
  auth,
} from "../../../../../auth";

import {
  prisma,
} from "../../../../../lib/db/prisma";

type Context = {
  params: Promise<{
    username: string;
  }>;
};

export async function GET(
  _request: Request,
  context: Context,
) {
  const {
    username,
  } = await context.params;

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
        image: true,
        bio: true,
        role: true,
        createdAt: true,

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
            public: true,
          },
        },
      },
    });

  if (!user) {
    return NextResponse.json(
      {
        error:
          "User not found",
      },
      {
        status: 404,
      },
    );
  }

  const viewerId =
    session?.user?.id ??
    null;

  const isOwner =
    viewerId ===
    user.id;

  const relationship =
    viewerId &&
    !isOwner
      ? await prisma.userFollow.findUnique({
          where: {
            followerId_followingId: {
              followerId:
                viewerId,
              followingId:
                user.id,
            },
          },

          select: {
            createdAt: true,
          },
        })
      : null;

  return NextResponse.json({
    user: {
      ...user,
      isOwner,
      isFollowing:
        Boolean(
          relationship,
        ),
    },
  });
}
