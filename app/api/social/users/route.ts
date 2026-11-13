import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "../../../../lib/db/prisma";

export async function GET(
  request: Request,
) {
  const url =
    new URL(
      request.url,
    );

  const query =
    url.searchParams
      .get("query")
      ?.trim()
      .toLowerCase() ??
    "";

  if (query.length < 2) {
    return NextResponse.json({
      users: [],
    });
  }

  const users =
    await prisma.user.findMany({
      where: {
        username: {
          not: null,
        },

        OR: [
          {
            username: {
              contains:
                query,
              mode:
                "insensitive",
            },
          },
          {
            name: {
              contains:
                query,
              mode:
                "insensitive",
            },
          },
        ],
      },

      take: 20,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        role: true,

        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

  return NextResponse.json({
    users,
  });
}
