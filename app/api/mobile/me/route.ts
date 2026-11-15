import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "../../../../lib/db/prisma";

import {
  getMobileUser,
} from "../../../../lib/mobile/auth";

export async function GET(
  request: Request,
) {
  const mobile =
    await getMobileUser(
      request,
    );

  if (!mobile) {
    return NextResponse.json(
      {
        error:
          "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const stats =
    await prisma.user.findUnique({
      where: {
        id:
          mobile.user.id,
      },

      select: {
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
      },
    });

  return NextResponse.json({
    user: {
      ...mobile.user,

      stats: {
        followers:
          stats?._count
            .followers ??
          0,

        following:
          stats?._count
            .following ??
          0,

        playlists:
          stats?._count
            .playlists ??
          0,
      },
    },
  });
}
