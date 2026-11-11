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

  const updated =
    await prisma.liveRoom.update({
      where: {
        id,
      },

      data: {
        status: "ENDED",
        endedAt:
          new Date(),
      },

      select: {
        id: true,
        title: true,
        status: true,
        startedAt: true,
        endedAt: true,
      },
    });

  return NextResponse.json({
    room: updated,
  });
}
