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

  const { id: playlistId } =
    await context.params;

  const playlist =
    await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        ownerId:
          session.user.id,
      },

      select: {
        id: true,

        tracks: {
          select: {
            trackId: true,
          },
        },
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
    !("trackIds" in body) ||
    !Array.isArray(
      body.trackIds,
    ) ||
    !body.trackIds.every(
      (id) =>
        typeof id ===
        "string",
    )
  ) {
    return NextResponse.json(
      {
        error:
          "trackIds must be an array of strings",
      },
      {
        status: 400,
      },
    );
  }

  const trackIds =
    body.trackIds;

  const existingIds =
    playlist.tracks.map(
      (item) =>
        item.trackId,
    );

  const sameLength =
    trackIds.length ===
    existingIds.length;

  const uniqueIds =
    new Set(
      trackIds,
    );

  const sameTracks =
    sameLength &&
    uniqueIds.size ===
      trackIds.length &&
    existingIds.every(
      (id) =>
        uniqueIds.has(id),
    );

  if (!sameTracks) {
    return NextResponse.json(
      {
        error:
          "Track order does not match playlist",
      },
      {
        status: 400,
      },
    );
  }

  await prisma.$transaction(
    trackIds.map(
      (trackId, position) =>
        prisma.playlistTrack.update({
          where: {
            playlistId_trackId: {
              playlistId,
              trackId,
            },
          },

          data: {
            position,
          },
        }),
    ),
  );

  return NextResponse.json({
    reordered: true,
    trackIds,
  });
}
