import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "../../../../../lib/db/prisma";

import {
  getMobileUser,
} from "../../../../../lib/mobile/auth";

const creatorRoles =
  new Set([
    "CREATOR",
    "ARTIST",
    "MODERATOR",
    "ADMIN",
  ]);

export async function GET(
  request: Request,
) {
  const mobile =
    await getMobileUser(
      request,
    );

  if (
    !mobile ||
    !creatorRoles.has(
      mobile.user.role,
    )
  ) {
    return NextResponse.json(
      {
        error: "Forbidden",
      },
      {
        status: 403,
      },
    );
  }

  const [
    artists,
    albums,
  ] =
    await Promise.all([
      prisma.artist.findMany({
        orderBy: {
          name: "asc",
        },

        select: {
          id: true,
          name: true,
        },
      }),

      prisma.album.findMany({
        orderBy: {
          title: "asc",
        },

        select: {
          id: true,
          title: true,
          artistId: true,
        },
      }),
    ]);

  return NextResponse.json({
    artists,
    albums,
  });
}
