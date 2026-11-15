import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "../../../../lib/db/prisma";

export async function GET() {
  const tracks =
    await prisma.track.findMany({
      where: {
        published: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 100,

      select: {
        id: true,
        title: true,
        slug: true,
        audioUrl: true,
        cover: true,
        duration: true,

        artist: {
          select: {
            id: true,
            name: true,
          },
        },

        album: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

  const artists =
    await prisma.artist.findMany({
      orderBy: {
        name: "asc",
      },

      take: 50,

      select: {
        id: true,
        name: true,
        image: true,
      },
    });

  const albums =
    await prisma.album.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 50,

      select: {
        id: true,
        title: true,
        cover: true,

        artist: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  return NextResponse.json({
    tracks,
    artists,
    albums,
  });
}
