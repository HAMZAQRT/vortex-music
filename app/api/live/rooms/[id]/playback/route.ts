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

export async function PATCH(
  request: Request,
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
    await prisma.liveRoom.findFirst({
      where: {
        id: roomId,
        hostId:
          session.user.id,
        status: "LIVE",
      },

      select: {
        id: true,
      },
    });

  if (!room) {
    return NextResponse.json(
      {
        error:
          "Live room not found",
      },
      {
        status: 404,
      },
    );
  }

  let body: unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON",
      },
      {
        status: 400,
      },
    );
  }

  if (
    typeof body !== "object" ||
    body === null
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid request",
      },
      {
        status: 400,
      },
    );
  }

  const {
    isPlaying,
    positionMs,
  } = body as {
    isPlaying?: unknown;
    positionMs?: unknown;
  };

  if (
    typeof isPlaying !==
    "boolean"
  ) {
    return NextResponse.json(
      {
        error:
          "isPlaying must be boolean",
      },
      {
        status: 400,
      },
    );
  }

  if (
    typeof positionMs !==
      "number" ||
    !Number.isFinite(
      positionMs,
    ) ||
    positionMs < 0
  ) {
    return NextResponse.json(
      {
        error:
          "positionMs must be a non-negative number",
      },
      {
        status: 400,
      },
    );
  }

  const safePositionMs =
    Math.min(
      Math.round(
        positionMs,
      ),
      86_400_000,
    );

  const updated =
    await prisma.liveRoom.update({
      where: {
        id:
          room.id,
      },

      data: {
        playbackIsPlaying:
          isPlaying,

        playbackPositionMs:
          safePositionMs,

        playbackUpdatedAt:
          new Date(),
      },

      select: {
        id: true,
        playbackIsPlaying:
          true,
        playbackPositionMs:
          true,
        playbackUpdatedAt:
          true,
      },
    });

  return NextResponse.json({
    playback: updated,
  });
}
