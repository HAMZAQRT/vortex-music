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

  const { id } =
    await context.params;

  const room =
    await prisma.liveRoom.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        startedAt: true,
        endedAt: true,
        hostId: true,

        playbackIsPlaying: true,
        playbackPositionMs: true,
        playbackUpdatedAt: true,

        host: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },

        currentTrack: {
          select: {
            id: true,
            title: true,

            artist: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        _count: {
          select: {
            participants: {
              where: {
                leftAt: null,
              },
            },
          },
        },
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

  const isHost =
    room.hostId ===
    session.user.id;

  const participant =
    isHost
      ? null
      : await prisma.liveParticipant.findUnique({
          where: {
            roomId_userId: {
              roomId:
                room.id,
              userId:
                session.user.id,
            },
          },

          select: {
            leftAt: true,
          },
        });

  const isJoined =
    Boolean(
      participant &&
      participant.leftAt ===
        null,
    );

  return NextResponse.json({
    room: {
      ...room,
      isHost,
      isJoined,
    },
  });
}
