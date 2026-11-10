import {
  NextResponse,
} from "next/server";

import {
  auth,
} from "../../../../../../../auth";

import {
  prisma,
} from "../../../../../../../lib/db/prisma";

type Context = {
  params: Promise<{
    id: string;
    trackId: string;
  }>;
};

export async function DELETE(
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
    id: playlistId,
    trackId,
  } = await context.params;

  const playlist =
    await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        ownerId:
          session.user.id,
      },

      select: {
        id: true,
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

  await prisma.$transaction(
    async (tx) => {
      await tx.playlistTrack.deleteMany({
        where: {
          playlistId,
          trackId,
        },
      });

      const remaining =
        await tx.playlistTrack.findMany({
          where: {
            playlistId,
          },

          orderBy: {
            position: "asc",
          },

          select: {
            trackId: true,
          },
        });

      for (
        let index = 0;
        index <
        remaining.length;
        index += 1
      ) {
        await tx.playlistTrack.update({
          where: {
            playlistId_trackId: {
              playlistId,
              trackId:
                remaining[index]
                  .trackId,
            },
          },

          data: {
            position: index,
          },
        });
      }
    },
  );

  return NextResponse.json({
    removed: true,
  });
}
