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
    "DRAFT"
  ) {
    return NextResponse.json(
      {
        error:
          "Only draft rooms can be started",
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
        status: "LIVE",
        startedAt:
          new Date(),
        endedAt: null,
      },

      select: {
        id: true,
        title: true,
        status: true,
        startedAt: true,
      },
    });

  return NextResponse.json({
    room: updated,
  });
}
