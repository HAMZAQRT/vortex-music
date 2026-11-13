import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "../../../../../../lib/db/prisma";

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

  const user =
    await prisma.user.findUnique({
      where: {
        username:
          username
            .trim()
            .toLowerCase(),
      },

      select: {
        id: true,
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

  const relationships =
    await prisma.userFollow.findMany({
      where: {
        followingId:
          user.id,
      },

      orderBy: {
        createdAt:
          "desc",
      },

      select: {
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
            role: true,
          },
        },
      },
    });

  return NextResponse.json({
    users:
      relationships.map(
        (item) =>
          item.follower,
      ),
  });
}
