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
      .get("q")
      ?.trim();

  if (
    !query ||
    query.length < 2
  ) {
    return NextResponse.json({
      tracks: [],
      artists: [],
    });
  }

  const [
    tracks,
    artists,
  ] =
    await Promise.all([
      prisma.track.findMany({
        where: {
          published: true,

          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive",
              },
            },

            {
              artist: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          ],
        },

        take: 25,

        select: {
          id: true,
          title: true,
          audioUrl: true,
          cover: true,
          duration: true,

          artist: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      prisma.artist.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },

        take: 10,

        select: {
          id: true,
          name: true,
          image: true,
        },
      }),
    ]);

  return NextResponse.json({
    tracks,
    artists,
  });
}
