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
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: Context,
) {
  const session =
    await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const {
    id,
  } = await context.params;

  const playlist =
    await prisma.playlist.findFirst({
      where: {
        id,
        ownerId:
          session.user.id,
      },

      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        public: true,
        createdAt: true,

        tracks: {
          orderBy: {
            position: "asc",
          },

          select: {
            position: true,

            track: {
              select: {
                id: true,
                title: true,
                audioUrl: true,
                duration: true,

                artist: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

  if (!playlist) {
    return NextResponse.json(
      {
        error:
          "Playlist not found",
      },
      {
        status: 404,
      },
    );
  }

  const availableTracks =
    await prisma.track.findMany({
      where: {
        published: true,

        playlistTracks: {
          none: {
            playlistId:
              playlist.id,
          },
        },
      },

      orderBy: {
        title: "asc",
      },

      select: {
        id: true,
        title: true,
        duration: true,

        artist: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  return NextResponse.json({
    playlist,
    availableTracks,
  });
}
