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

  const {
    id: roomId,
  } = await context.params;

  const room =
    await prisma.liveRoom.findUnique({
      where: {
        id: roomId,
      },

      select: {
        id: true,
        hostId: true,
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
          "Room is not live",
      },
      {
        status: 409,
      },
    );
  }

  if (
    room.hostId ===
    session.user.id
  ) {
    return NextResponse.json(
      {
        error:
          "Host is not counted as a listener",
      },
      {
        status: 409,
      },
    );
  }

  const participant =
    await prisma.liveParticipant.upsert({
      where: {
        roomId_userId: {
          roomId,
          userId:
            session.user.id,
        },
      },

      update: {
        joinedAt:
          new Date(),
        leftAt: null,
      },

      create: {
        roomId,
        userId:
          session.user.id,
      },

      select: {
        id: true,
        joinedAt: true,
        leftAt: true,
      },
    });

  return NextResponse.json({
    joined: true,
    participant,
  });
}
