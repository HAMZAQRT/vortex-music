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
    id: playlistId,
  } = await context.params;

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
    body === null ||
    !("trackId" in body) ||
    typeof body.trackId !==
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

  const trackId =
    body.trackId;

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

  const track =
    await prisma.track.findUnique({
      where: {
        id: trackId,
      },

      select: {
        id: true,
        published: true,
      },
    });

  if (
    !track ||
    !track.published
  ) {
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

  const existing =
    await prisma.playlistTrack.findUnique({
      where: {
        playlistId_trackId: {
          playlistId,
          trackId,
        },
      },
    });

  if (existing) {
    return NextResponse.json(
      {
        error:
          "Track already exists",
      },
      {
        status: 409,
      },
    );
  }

  const lastPosition =
    await prisma.playlistTrack.aggregate({
      where: {
        playlistId,
      },

      _max: {
        position: true,
      },
    });

  const position =
    (
      lastPosition._max
        .position ?? -1
    ) + 1;

  await prisma.playlistTrack.create({
    data: {
      playlistId,
      trackId,
      position,
    },
  });

  return NextResponse.json(
    {
      added: true,
      trackId,
      position,
    },
    {
      status: 201,
    },
  );
}
