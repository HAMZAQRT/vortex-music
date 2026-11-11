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
      { error: "Unauthorized" },
      { status: 401 },
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
      { error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const trackId =
    typeof body === "object" &&
    body !== null &&
    "trackId" in body
      ? (
          body as {
            trackId?: unknown;
          }
        ).trackId
      : undefined;

  if (
    typeof trackId !==
    "string"
  ) {
    return NextResponse.json(
      {
        error:
          "trackId is required",
      },
      {
        status: 400,
      },
    );
  }

  const track =
    await prisma.track.findFirst({
      where: {
        id: trackId,
        published: true,
      },
      select: {
        id: true,
      },
    });

  if (!track) {
    return NextResponse.json(
      {
        error:
          "Track not found",
      },
      {
        status: 404,
      },
    );
  }

  const updated =
    await prisma.liveRoom.update({
      where: {
        id:
          room.id,
      },

      data: {
        currentTrackId:
          track.id,
      },

      select: {
        id: true,

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
      },
    });

  return NextResponse.json({
    room: updated,
  });
}
