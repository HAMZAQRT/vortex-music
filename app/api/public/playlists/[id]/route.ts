import {
  NextResponse,
} from "next/server";

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
  const {
    id,
  } = await context.params;

  const playlist =
    await prisma.playlist.findFirst({
      where: {
        id,
        public: true,
      },

      select: {
        id: true,
        title: true,
        description: true,
        public: true,
        createdAt: true,

        owner: {
          select: {
            name: true,
            image: true,
          },
        },

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
          "Public playlist not found",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    playlist,
  });
}
