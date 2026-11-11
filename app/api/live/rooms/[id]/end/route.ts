import {
  NextResponse,
} from "next/server";

import {
  auth,
} from "../../../../../../auth";

import {
  prisma,
} from "../../../../../../lib/db/prisma";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
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

  const { id } =
    await context.params;

  const room =
    await prisma.liveRoom.findFirst({
      where: {
        id,
        hostId:
          session.user.id,
      },

      select: {
        id: true,
        status: true,
      },
    });

  if (!room) {
    return NextResponse.json(
      {
        error:
          "Room not found",
      },
      {
        status: 404,
      },
    );
  }

  if (
    room.status !==
    "LIVE"
  ) {
    return NextResponse.json(
      {
        error:
          "Only live rooms can be ended",
      },
      {
        status: 409,
      },
    );
  }

  const endedAt =
    new Date();

  const updated =
    await prisma.$transaction(
      async (tx) => {
        const endedRoom =
          await tx.liveRoom.update({
            where: {
              id,
            },

            data: {
              status: "ENDED",
              endedAt,
              playbackIsPlaying:
                false,
              playbackUpdatedAt:
                endedAt,
            },

            select: {
              id: true,
              title: true,
              status: true,
              startedAt: true,
              endedAt: true,
              playbackIsPlaying:
                true,
              playbackPositionMs:
                true,
              playbackUpdatedAt:
                true,
            },
          });

        await tx.liveParticipant.updateMany({
          where: {
            roomId: id,
            leftAt: null,
          },

          data: {
            leftAt:
              endedAt,
          },
        });

        return endedRoom;
      },
    );

  return NextResponse.json({
    room: updated,
  });
}
