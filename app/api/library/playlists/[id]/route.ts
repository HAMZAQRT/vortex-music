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

  const {
    id,
  } = await context.params;

  const playlist =
    await prisma.playlist.findFirst({
      where: {
        id,
        ownerId:
          session.user.id,
      },

      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        public: true,
        createdAt: true,

        tracks: {
          orderBy: {
            position: "asc",
          },

          select: {
            position: true,

            track: {
              select: {
                id: true,
                title: true,
                audioUrl: true,
                duration: true,

                artist: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
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

  const availableTracks =
    await prisma.track.findMany({
      where: {
        published: true,

        playlistTracks: {
          none: {
            playlistId:
              playlist.id,
          },
        },
      },

      orderBy: {
        title: "asc",
      },

      select: {
        id: true,
        title: true,
        duration: true,

        artist: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  return NextResponse.json({
    playlist,
    availableTracks,
  });
}

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
    id,
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
    body === null
  ) {
    return NextResponse.json(
      {
        error: "Invalid request",
      },
      {
        status: 400,
      },
    );
  }

  const {
    title,
    description,
    isPublic,
  } = body as {
    title?: unknown;
    description?: unknown;
    isPublic?: unknown;
  };

  const existing =
    await prisma.playlist.findFirst({
      where: {
        id,
        ownerId:
          session.user.id,
      },

      select: {
        id: true,
      },
    });

  if (!existing) {
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

  const updateData: {
    title?: string;
    description?:
      | string
      | null;
    public?: boolean;
  } = {};

  if (title !== undefined) {
    if (
      typeof title !==
        "string" ||
      title.trim().length <
        1 ||
      title.trim().length >
        80
    ) {
      return NextResponse.json(
        {
          error:
            "Playlist title must be between 1 and 80 characters",
        },
        {
          status: 400,
        },
      );
    }

    updateData.title =
      title.trim();
  }

  if (
    description !== undefined
  ) {
    if (
      typeof description !==
        "string" ||
      description.length >
        300
    ) {
      return NextResponse.json(
        {
          error:
            "Playlist description is invalid",
        },
        {
          status: 400,
        },
      );
    }

    updateData.description =
      description.trim() ||
      null;
  }

  if (
    isPublic !== undefined
  ) {
    if (
      typeof isPublic !==
      "boolean"
    ) {
      return NextResponse.json(
        {
          error:
            "isPublic must be boolean",
        },
        {
          status: 400,
        },
      );
    }

    updateData.public =
      isPublic;
  }

  const playlist =
    await prisma.playlist.update({
      where: {
        id,
      },

      data:
        updateData,

      select: {
        id: true,
        title: true,
        description: true,
        public: true,
      },
    });

  return NextResponse.json({
    playlist,
  });
}

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
    id,
  } = await context.params;

  const playlist =
    await prisma.playlist.findFirst({
      where: {
        id,
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

  await prisma.playlist.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    deleted: true,
  });
}
